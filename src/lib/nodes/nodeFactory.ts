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

export function createNode(type: NodeType, position: Position): PipelineNode {
  const definition = nodeDefinitions[type];
  
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }

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