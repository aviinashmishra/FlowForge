/**
 * Smoke tests to verify the application loads without errors
 */

import { createNode } from '@/lib/nodes/nodeFactory';
import { serializePipeline, deserializePipeline } from '@/lib/serialization/pipeline';
import { generateSchema } from '@/lib/data/schema';
import { Pipeline } from '@/types';

describe('Application Smoke Tests', () => {
  it('should create nodes without errors', () => {
    const node = createNode('api-fetch', { x: 100, y: 200 });
    
    expect(node).toBeDefined();
    expect(node.type).toBe('api-fetch');
    expect(node.position.x).toBe(100);
    expect(node.position.y).toBe(200);
    expect(node.status).toBe('idle');
  });

  it('should serialize and deserialize pipelines', () => {
    const pipeline: Pipeline = {
      id: 'test-pipeline',
      name: 'Test Pipeline',
      description: 'A test pipeline',
      nodes: [
        createNode('api-fetch', { x: 0, y: 0 }),
        createNode('filter', { x: 200, y: 0 }),
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        }
      ],
      createdBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    const serialized = serializePipeline(pipeline);
    const deserialized = deserializePipeline(serialized);

    expect(deserialized.id).toBe(pipeline.id);
    expect(deserialized.name).toBe(pipeline.name);
    expect(deserialized.nodes).toHaveLength(2);
    expect(deserialized.edges).toHaveLength(1);
  });

  it('should generate schemas from data', () => {
    const testData = [
      { id: 1, name: 'John', active: true },
      { id: 2, name: 'Jane', active: false },
      { id: 3, name: 'Bob', active: true },
    ];

    const schema = generateSchema(testData);

    expect(schema.fields).toHaveLength(3);
    expect(schema.fields.find(f => f.name === 'id')?.type).toBe('number');
    expect(schema.fields.find(f => f.name === 'name')?.type).toBe('string');
    expect(schema.fields.find(f => f.name === 'active')?.type).toBe('boolean');
  });

  it('should handle all node types', () => {
    const nodeTypes = [
      'api-fetch', 'csv-upload', 'json-parser',
      'filter', 'map', 'reduce', 'aggregate',
      'join', 'sort', 'limit', 'rename-fields',
      'math-transform', 'group-by', 'preview', 'export'
    ];

    nodeTypes.forEach(nodeType => {
      expect(() => {
        const node = createNode(nodeType as any, { x: 0, y: 0 });
        expect(node.type).toBe(nodeType);
      }).not.toThrow();
    });
  });
});