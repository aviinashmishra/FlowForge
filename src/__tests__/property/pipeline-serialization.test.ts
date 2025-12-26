/**
 * Property-based tests for pipeline serialization
 * Feature: flowforge-pipeline-builder, Property 3: Pipeline Serialization Round-trip
 * Validates: Requirements 1.5
 */

import * as fc from 'fast-check';
import { Pipeline, PipelineNode, PipelineEdge, NodeType } from '@/types';
import { serializePipeline, deserializePipeline, pipelinesEqual } from '@/lib/serialization/pipeline';

// Helper function to normalize positions (handle -0 vs 0)
function normalizePosition(pipeline: Pipeline): Pipeline {
  return {
    ...pipeline,
    nodes: pipeline.nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x === 0 ? 0 : node.position.x,
        y: node.position.y === 0 ? 0 : node.position.y,
      }
    }))
  };
}

// Generators for property-based testing
const positionArb = fc.record({
  x: fc.float({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
  y: fc.float({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
});

const nodeTypeArb = fc.constantFrom(
  'api-fetch', 'csv-upload', 'json-parser',
  'filter', 'map', 'reduce', 'aggregate',
  'join', 'sort', 'limit', 'rename-fields',
  'math-transform', 'group-by', 'preview', 'export'
) as fc.Arbitrary<NodeType>;

const nodeDataArb = fc.record({
  label: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  category: fc.constantFrom('source', 'transform', 'output') as fc.Arbitrary<'source' | 'transform' | 'output'>,
  icon: fc.option(fc.string(), { nil: undefined }),
  color: fc.option(fc.string(), { nil: undefined }),
});

const baseConfigArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.float(),
    fc.constant(null)
  )
);

const pipelineNodeArb = fc.record({
  id: fc.uuid(),
  type: nodeTypeArb,
  position: positionArb,
  data: nodeDataArb,
  config: baseConfigArb,
  status: fc.constantFrom('idle', 'processing', 'success', 'error') as fc.Arbitrary<'idle' | 'processing' | 'success' | 'error'>,
  preview: fc.option(fc.record({
    sample: fc.array(fc.anything(), { maxLength: 10 }),
    totalRows: fc.nat({ max: 10000 }),
    schema: fc.record({
      fields: fc.array(fc.record({
        name: fc.string({ minLength: 1, maxLength: 30 }),
        type: fc.constantFrom('string', 'number', 'boolean', 'date', 'object', 'array') as fc.Arbitrary<'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'>,
        nullable: fc.boolean(),
      }), { maxLength: 20 })
    }),
    errors: fc.option(fc.array(fc.string(), { maxLength: 5 }), { nil: undefined }),
  }), { nil: undefined }),
});

const pipelineEdgeArb = fc.record({
  id: fc.uuid(),
  source: fc.uuid(),
  target: fc.uuid(),
  sourceHandle: fc.option(fc.string(), { nil: undefined }),
  targetHandle: fc.option(fc.string(), { nil: undefined }),
  animated: fc.option(fc.boolean(), { nil: undefined }),
  style: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
});

const pipelineArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  nodes: fc.array(pipelineNodeArb, { maxLength: 20 }),
  edges: fc.array(pipelineEdgeArb, { maxLength: 30 }),
  createdBy: fc.uuid(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
  version: fc.nat({ max: 1000 }),
});

describe('Pipeline Serialization Property Tests', () => {
  /**
   * Property 3: Pipeline Serialization Round-trip
   * For any valid pipeline configuration, serializing to JSON and then deserializing 
   * should produce an equivalent pipeline with identical nodes, edges, and configurations
   */
  it('should maintain pipeline integrity through serialization round-trip', () => {
    fc.assert(
      fc.property(pipelineArb, (originalPipeline: Pipeline) => {
        // Serialize the pipeline to JSON
        const serialized = serializePipeline(originalPipeline);
        
        // Deserialize back to pipeline object
        const deserialized = deserializePipeline(serialized);
        
        // Verify the pipelines are equivalent (handle -0 vs 0 issue)
        const normalizedOriginal = normalizePosition(originalPipeline);
        const normalizedDeserialized = normalizePosition(deserialized);
        expect(pipelinesEqual(normalizedOriginal, normalizedDeserialized)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all node properties during serialization', () => {
    fc.assert(
      fc.property(pipelineNodeArb, (node: PipelineNode) => {
        const pipeline: Pipeline = {
          id: 'test-pipeline',
          name: 'Test Pipeline',
          nodes: [node],
          edges: [],
          createdBy: 'test-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        };

        const serialized = serializePipeline(pipeline);
        const deserialized = deserializePipeline(serialized);

        expect(deserialized.nodes).toHaveLength(1);
        const deserializedNode = deserialized.nodes[0];

        expect(deserializedNode.id).toBe(node.id);
        expect(deserializedNode.type).toBe(node.type);
        expect(deserializedNode.position.x).toBe(node.position.x === 0 ? 0 : node.position.x);
        expect(deserializedNode.position.y).toBe(node.position.y === 0 ? 0 : node.position.y);
        expect(deserializedNode.status).toBe(node.status);
        expect(deserializedNode.data).toEqual(node.data);
        expect(deserializedNode.config).toEqual(node.config);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all edge properties during serialization', () => {
    fc.assert(
      fc.property(pipelineEdgeArb, (edge: PipelineEdge) => {
        const pipeline: Pipeline = {
          id: 'test-pipeline',
          name: 'Test Pipeline',
          nodes: [],
          edges: [edge],
          createdBy: 'test-user',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        };

        const serialized = serializePipeline(pipeline);
        const deserialized = deserializePipeline(serialized);

        expect(deserialized.edges).toHaveLength(1);
        const deserializedEdge = deserialized.edges[0];

        expect(deserializedEdge.id).toBe(edge.id);
        expect(deserializedEdge.source).toBe(edge.source);
        expect(deserializedEdge.target).toBe(edge.target);
        expect(deserializedEdge.sourceHandle).toBe(edge.sourceHandle);
        expect(deserializedEdge.targetHandle).toBe(edge.targetHandle);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty pipelines correctly', () => {
    const emptyPipeline: Pipeline = {
      id: 'empty-pipeline',
      name: 'Empty Pipeline',
      nodes: [],
      edges: [],
      createdBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    const serialized = serializePipeline(emptyPipeline);
    const deserialized = deserializePipeline(serialized);

    expect(pipelinesEqual(emptyPipeline, deserialized)).toBe(true);
  });

  it('should handle complex nested configurations', () => {
    const complexConfig = {
      nested: {
        array: [1, 2, 3, { deep: 'value' }],
        boolean: true,
        null: null,
        undefined: undefined,
      },
      transformations: [
        { field: 'name', operation: 'uppercase' },
        { field: 'age', operation: 'multiply', value: 2 },
      ],
    };

    const node: PipelineNode = {
      id: 'complex-node',
      type: 'map',
      position: { x: 0, y: 0 },
      data: { label: 'Complex Node', category: 'transform' },
      config: complexConfig,
      status: 'idle',
    };

    const pipeline: Pipeline = {
      id: 'complex-pipeline',
      name: 'Complex Pipeline',
      nodes: [node],
      edges: [],
      createdBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    const serialized = serializePipeline(pipeline);
    const deserialized = deserializePipeline(serialized);

    expect(pipelinesEqual(pipeline, deserialized)).toBe(true);
  });
});