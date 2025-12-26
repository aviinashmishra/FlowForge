/**
 * Property-based tests for node creation and positioning
 * Feature: flowforge-pipeline-builder, Property 1: Node Creation and Positioning
 * Validates: Requirements 1.2
 */

import * as fc from 'fast-check';
import { NodeType, Position, PipelineNode } from '@/types';
import { createNode, validateNodePosition } from '@/lib/nodes/nodeFactory';

// Generators for property-based testing
const nodeTypeArb = fc.constantFrom(
  'api-fetch', 'csv-upload', 'json-parser',
  'filter', 'map', 'reduce', 'aggregate',
  'join', 'sort', 'limit', 'rename-fields',
  'math-transform', 'group-by', 'preview', 'export'
) as fc.Arbitrary<NodeType>;

const positionArb = fc.record({
  x: fc.float({ min: -2000, max: 2000, noNaN: true, noDefaultInfinity: true }),
  y: fc.float({ min: -2000, max: 2000, noNaN: true, noDefaultInfinity: true }),
});

const canvasPositionArb = fc.record({
  x: fc.float({ min: 0, max: 1920, noNaN: true }),
  y: fc.float({ min: 0, max: 1080, noNaN: true }),
});

describe('Node Creation and Positioning Property Tests', () => {
  /**
   * Property 1: Node Creation and Positioning
   * For any node type and canvas position, dragging a node from the palette to the canvas 
   * should create a new node instance at the exact drop location with correct type and default configuration
   */
  it('should create nodes with correct type and position', () => {
    fc.assert(
      fc.property(nodeTypeArb, positionArb, (nodeType: NodeType, position: Position) => {
        const node = createNode(nodeType, position);
        
        // Node should have correct type
        expect(node.type).toBe(nodeType);
        
        // Node should be positioned exactly at the specified location
        expect(node.position.x).toBe(position.x);
        expect(node.position.y).toBe(position.y);
        
        // Node should have a unique ID
        expect(node.id).toBeDefined();
        expect(typeof node.id).toBe('string');
        expect(node.id.length).toBeGreaterThan(0);
        
        // Node should have default status
        expect(node.status).toBe('idle');
        
        // Node should have appropriate data based on type
        expect(node.data).toBeDefined();
        expect(node.data.label).toBeDefined();
        expect(node.data.category).toMatch(/^(source|transform|output)$/);
        
        // Node should have default configuration
        expect(node.config).toBeDefined();
        expect(typeof node.config).toBe('object');
      }),
      { numRuns: 100 }
    );
  });

  it('should create nodes with correct category based on type', () => {
    const sourceTypes: NodeType[] = ['api-fetch', 'csv-upload', 'json-parser'];
    const transformTypes: NodeType[] = ['filter', 'map', 'reduce', 'aggregate', 'join', 'sort', 'limit', 'rename-fields', 'math-transform', 'group-by'];
    const outputTypes: NodeType[] = ['preview', 'export'];

    fc.assert(
      fc.property(positionArb, (position: Position) => {
        // Test source nodes
        sourceTypes.forEach(nodeType => {
          const node = createNode(nodeType, position);
          expect(node.data.category).toBe('source');
        });

        // Test transform nodes
        transformTypes.forEach(nodeType => {
          const node = createNode(nodeType, position);
          expect(node.data.category).toBe('transform');
        });

        // Test output nodes
        outputTypes.forEach(nodeType => {
          const node = createNode(nodeType, position);
          expect(node.data.category).toBe('output');
        });
      }),
      { numRuns: 10 }
    );
  });

  it('should create nodes with unique IDs', () => {
    fc.assert(
      fc.property(
        nodeTypeArb,
        positionArb,
        fc.nat({ max: 100 }),
        (nodeType: NodeType, position: Position, count: number) => {
          const nodes: PipelineNode[] = [];
          const ids = new Set<string>();

          // Create multiple nodes
          for (let i = 0; i < count; i++) {
            const node = createNode(nodeType, position);
            nodes.push(node);
            ids.add(node.id);
          }

          // All IDs should be unique
          expect(ids.size).toBe(nodes.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle extreme position values correctly', () => {
    const extremePositions: Position[] = [
      { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
      { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
      { x: 0, y: 0 },
      { x: -0, y: -0 },
      { x: Infinity, y: -Infinity },
      { x: -Infinity, y: Infinity },
    ];

    fc.assert(
      fc.property(nodeTypeArb, (nodeType: NodeType) => {
        extremePositions.forEach(position => {
          const node = createNode(nodeType, position);
          
          // Node should be created successfully
          expect(node).toBeDefined();
          expect(node.type).toBe(nodeType);
          
          // Position should be handled appropriately (finite values or defaults)
          expect(typeof node.position.x).toBe('number');
          expect(typeof node.position.y).toBe('number');
          
          // If position was infinite, it should be normalized
          if (!isFinite(position.x) || !isFinite(position.y)) {
            expect(isFinite(node.position.x)).toBe(true);
            expect(isFinite(node.position.y)).toBe(true);
          }
        });
      }),
      { numRuns: 10 }
    );
  });

  it('should validate node positions correctly', () => {
    fc.assert(
      fc.property(canvasPositionArb, (position: Position) => {
        const validation = validateNodePosition(position);
        
        // Valid canvas positions should pass validation
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid positions', () => {
    const invalidPositions: Position[] = [
      { x: NaN, y: 0 },
      { x: 0, y: NaN },
      { x: NaN, y: NaN },
    ];

    invalidPositions.forEach(position => {
      const validation = validateNodePosition(position);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  it('should create nodes with appropriate default configurations', () => {
    fc.assert(
      fc.property(nodeTypeArb, positionArb, (nodeType: NodeType, position: Position) => {
        const node = createNode(nodeType, position);
        
        // Check type-specific default configurations
        switch (nodeType) {
          case 'api-fetch':
            expect(node.config).toHaveProperty('url');
            expect(node.config).toHaveProperty('method');
            break;
          case 'filter':
            expect(node.config).toHaveProperty('condition');
            expect(node.config).toHaveProperty('field');
            expect(node.config).toHaveProperty('operator');
            break;
          case 'join':
            expect(node.config).toHaveProperty('joinType');
            expect(node.config).toHaveProperty('leftKey');
            expect(node.config).toHaveProperty('rightKey');
            break;
          case 'sort':
            expect(node.config).toHaveProperty('field');
            expect(node.config).toHaveProperty('direction');
            break;
          case 'limit':
            expect(node.config).toHaveProperty('count');
            break;
          case 'export':
            expect(node.config).toHaveProperty('format');
            break;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve position precision', () => {
    fc.assert(
      fc.property(
        nodeTypeArb,
        fc.record({
          x: fc.float({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
          y: fc.float({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true }),
        }),
        (nodeType: NodeType, position: Position) => {
          const node = createNode(nodeType, position);
          
          // Position should be preserved with reasonable precision
          expect(Math.abs(node.position.x - position.x)).toBeLessThan(0.001);
          expect(Math.abs(node.position.y - position.y)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create nodes that can be serialized and deserialized', () => {
    fc.assert(
      fc.property(nodeTypeArb, positionArb, (nodeType: NodeType, position: Position) => {
        const originalNode = createNode(nodeType, position);
        
        // Serialize and deserialize
        const serialized = JSON.stringify(originalNode);
        const deserialized = JSON.parse(serialized);
        
        // Core properties should be preserved (handle -0 vs 0)
        expect(deserialized.id).toBe(originalNode.id);
        expect(deserialized.type).toBe(originalNode.type);
        expect(deserialized.position.x).toBe(originalNode.position.x === 0 ? 0 : originalNode.position.x);
        expect(deserialized.position.y).toBe(originalNode.position.y === 0 ? 0 : originalNode.position.y);
        expect(deserialized.status).toBe(originalNode.status);
        expect(deserialized.data).toEqual(originalNode.data);
        expect(deserialized.config).toEqual(originalNode.config);
      }),
      { numRuns: 100 }
    );
  });
});