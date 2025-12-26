import { Pipeline, PipelineNode, PipelineEdge } from '@/types';

/**
 * Serializes a pipeline to JSON string
 */
export function serializePipeline(pipeline: Pipeline): string {
  return JSON.stringify(pipeline, (key, value) => {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Handle Map objects
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    // Handle NaN values
    if (typeof value === 'number' && isNaN(value)) {
      return { __type: 'NaN' };
    }
    // Handle Infinity values
    if (value === Infinity) {
      return { __type: 'Infinity' };
    }
    if (value === -Infinity) {
      return { __type: '-Infinity' };
    }
    return value;
  });
}

/**
 * Deserializes a pipeline from JSON string
 */
export function deserializePipeline(json: string): Pipeline {
  const parsed = JSON.parse(json, (key, value) => {
    // Handle special number values
    if (value && typeof value === 'object' && value.__type) {
      switch (value.__type) {
        case 'NaN':
          return NaN;
        case 'Infinity':
          return Infinity;
        case '-Infinity':
          return -Infinity;
      }
    }
    return value;
  });
  
  // Convert date strings back to Date objects
  if (parsed.createdAt) {
    parsed.createdAt = new Date(parsed.createdAt);
  }
  if (parsed.updatedAt) {
    parsed.updatedAt = new Date(parsed.updatedAt);
  }
  
  return parsed as Pipeline;
}

/**
 * Validates that two pipelines are equivalent
 */
export function pipelinesEqual(a: Pipeline, b: Pipeline): boolean {
  // Compare basic properties
  if (a.id !== b.id || a.name !== b.name || a.version !== b.version) {
    return false;
  }
  
  // Compare dates (allowing for small differences due to serialization)
  if (Math.abs(a.createdAt.getTime() - b.createdAt.getTime()) > 1000) {
    return false;
  }
  if (Math.abs(a.updatedAt.getTime() - b.updatedAt.getTime()) > 1000) {
    return false;
  }
  
  // Compare nodes
  if (a.nodes.length !== b.nodes.length) {
    return false;
  }
  
  for (let i = 0; i < a.nodes.length; i++) {
    if (!nodesEqual(a.nodes[i], b.nodes[i])) {
      return false;
    }
  }
  
  // Compare edges
  if (a.edges.length !== b.edges.length) {
    return false;
  }
  
  for (let i = 0; i < a.edges.length; i++) {
    if (!edgesEqual(a.edges[i], b.edges[i])) {
      return false;
    }
  }
  
  return true;
}

function nodesEqual(a: PipelineNode, b: PipelineNode): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    (Number.isNaN(a.position.x) ? Number.isNaN(b.position.x) : a.position.x === b.position.x) &&
    (Number.isNaN(a.position.y) ? Number.isNaN(b.position.y) : a.position.y === b.position.y) &&
    a.status === b.status &&
    JSON.stringify(a.data) === JSON.stringify(b.data) &&
    JSON.stringify(a.config) === JSON.stringify(b.config)
  );
}

function edgesEqual(a: PipelineEdge, b: PipelineEdge): boolean {
  return (
    a.id === b.id &&
    a.source === b.source &&
    a.target === b.target &&
    a.sourceHandle === b.sourceHandle &&
    a.targetHandle === b.targetHandle
  );
}