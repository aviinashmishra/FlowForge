import { v4 as uuidv4 } from 'uuid';
import { 
  NodeType, 
  Position, 
  PipelineNode, 
  ValidationResult,
  ApiNodeConfig,
  FilterNodeConfig,
  JoinNodeConfig,
  SortNodeConfig,
  LimitNodeConfig,
  ExportNodeConfig,
  BaseNodeConfig
} from '@/types';

/**
 * Node type definitions with metadata
 */
const nodeDefinitions = {
  'api-fetch': {
    label: 'API Fetch',
    description: 'Fetch data from REST APIs',
    category: 'source' as const,
    icon: '🌐',
    defaultConfig: (): ApiNodeConfig => ({
      url: '',
      method: 'GET',
      headers: {},
      authentication: { type: 'none' },
    }),
  },
  'csv-upload': {
    label: 'CSV Upload',
    description: 'Upload and parse CSV files',
    category: 'source' as const,
    icon: '📄',
    defaultConfig: (): BaseNodeConfig => ({
      hasHeaders: true,
      delimiter: ',',
      encoding: 'utf-8',
    }),
  },
  'json-parser': {
    label: 'JSON Parser',
    description: 'Parse JSON data',
    category: 'source' as const,
    icon: '📋',
    defaultConfig: (): BaseNodeConfig => ({
      jsonPath: '$',
      validateSchema: false,
    }),
  },
  'filter': {
    label: 'Filter',
    description: 'Filter rows based on conditions',
    category: 'transform' as const,
    icon: '🔍',
    defaultConfig: (): FilterNodeConfig => ({
      condition: '',
      field: '',
      operator: 'equals',
      value: '',
    }),
  },
  'map': {
    label: 'Map',
    description: 'Transform data fields',
    category: 'transform' as const,
    icon: '🔄',
    defaultConfig: (): BaseNodeConfig => ({
      transformations: [],
    }),
  },
  'reduce': {
    label: 'Reduce',
    description: 'Reduce data to single values',
    category: 'transform' as const,
    icon: '📊',
    defaultConfig: (): BaseNodeConfig => ({
      operation: 'sum',
      field: '',
      initialValue: 0,
    }),
  },
  'aggregate': {
    label: 'Aggregate',
    description: 'Aggregate data with functions',
    category: 'transform' as const,
    icon: '📈',
    defaultConfig: (): BaseNodeConfig => ({
      aggregations: [],
    }),
  },
  'join': {
    label: 'Join',
    description: 'Join multiple data sources',
    category: 'transform' as const,
    icon: '🔗',
    defaultConfig: (): JoinNodeConfig => ({
      joinType: 'inner',
      leftKey: '',
      rightKey: '',
    }),
  },
  'sort': {
    label: 'Sort',
    description: 'Sort data by fields',
    category: 'transform' as const,
    icon: '📶',
    defaultConfig: (): SortNodeConfig => ({
      field: '',
      direction: 'asc',
    }),
  },
  'limit': {
    label: 'Limit',
    description: 'Limit number of rows',
    category: 'transform' as const,
    icon: '✂️',
    defaultConfig: (): LimitNodeConfig => ({
      count: 100,
      offset: 0,
    }),
  },
  'rename-fields': {
    label: 'Rename Fields',
    description: 'Rename data fields',
    category: 'transform' as const,
    icon: '🏷️',
    defaultConfig: (): BaseNodeConfig => ({
      mappings: {},
    }),
  },
  'math-transform': {
    label: 'Math Transform',
    description: 'Mathematical operations',
    category: 'transform' as const,
    icon: '🧮',
    defaultConfig: (): BaseNodeConfig => ({
      operation: 'add',
      field: '',
      value: 0,
    }),
  },
  'group-by': {
    label: 'Group By',
    description: 'Group data by fields',
    category: 'transform' as const,
    icon: '📦',
    defaultConfig: (): BaseNodeConfig => ({
      groupBy: [],
      aggregations: [],
    }),
  },
  'preview': {
    label: 'Preview',
    description: 'Preview data output',
    category: 'output' as const,
    icon: '👁️',
    defaultConfig: (): BaseNodeConfig => ({
      maxRows: 100,
      showSchema: true,
    }),
  },
  'export': {
    label: 'Export',
    description: 'Export data to files',
    category: 'output' as const,
    icon: '💾',
    defaultConfig: (): ExportNodeConfig => ({
      format: 'json',
      filename: 'output',
    }),
  },
};

/**
 * Creates a new pipeline node with default configuration
 */
export function createNode(type: NodeType, position: Position): PipelineNode {
  const definition = nodeDefinitions[type];
  
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }

  // Normalize position to handle infinite values
  const normalizedPosition: Position = {
    x: isFinite(position.x) ? position.x : 0,
    y: isFinite(position.y) ? position.y : 0,
  };

  return {
    id: uuidv4(),
    type,
    position: normalizedPosition,
    data: {
      label: definition.label,
      description: definition.description,
      category: definition.category,
      icon: definition.icon,
    },
    config: definition.defaultConfig(),
    status: 'idle',
  };
}

/**
 * Validates a node position
 */
export function validateNodePosition(position: Position): ValidationResult {
  const errors: string[] = [];

  if (typeof position.x !== 'number' || isNaN(position.x)) {
    errors.push('Position x must be a valid number');
  }

  if (typeof position.y !== 'number' || isNaN(position.y)) {
    errors.push('Position y must be a valid number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the default configuration for a node type
 */
export function getDefaultNodeConfig(type: NodeType): BaseNodeConfig {
  const definition = nodeDefinitions[type];
  
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }

  return definition.defaultConfig();
}

/**
 * Gets node metadata (label, description, etc.)
 */
export function getNodeMetadata(type: NodeType) {
  const definition = nodeDefinitions[type];
  
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }

  return {
    label: definition.label,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
  };
}

/**
 * Gets all available node types grouped by category
 */
export function getAvailableNodeTypes() {
  const grouped = {
    source: [] as NodeType[],
    transform: [] as NodeType[],
    output: [] as NodeType[],
  };

  Object.entries(nodeDefinitions).forEach(([type, definition]) => {
    grouped[definition.category].push(type as NodeType);
  });

  return grouped;
}

/**
 * Validates a node configuration
 */
export function validateNodeConfig(type: NodeType, config: BaseNodeConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type-specific validation
  switch (type) {
    case 'api-fetch':
      const apiConfig = config as ApiNodeConfig;
      if (!apiConfig.url) {
        errors.push('URL is required');
      } else {
        try {
          new URL(apiConfig.url);
        } catch {
          errors.push('Invalid URL format');
        }
      }
      break;

    case 'filter':
      const filterConfig = config as FilterNodeConfig;
      if (!filterConfig.field) {
        errors.push('Field is required');
      }
      if (!filterConfig.condition && !filterConfig.value) {
        errors.push('Either condition or value is required');
      }
      break;

    case 'join':
      const joinConfig = config as JoinNodeConfig;
      if (!joinConfig.leftKey) {
        errors.push('Left key is required');
      }
      if (!joinConfig.rightKey) {
        errors.push('Right key is required');
      }
      break;

    case 'sort':
      const sortConfig = config as SortNodeConfig;
      if (!sortConfig.field) {
        errors.push('Field is required');
      }
      break;

    case 'limit':
      const limitConfig = config as LimitNodeConfig;
      if (limitConfig.count <= 0) {
        errors.push('Count must be greater than 0');
      }
      if (limitConfig.offset && limitConfig.offset < 0) {
        errors.push('Offset must be non-negative');
      }
      break;

    case 'export':
      const exportConfig = config as ExportNodeConfig;
      if (!exportConfig.format) {
        errors.push('Format is required');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}