// Core type definitions for FlowForge Pipeline Builder

export interface Position {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Node Types - All supported transformation node types
export type NodeType = 
  | 'api-fetch' | 'csv-upload' | 'json-parser'
  | 'filter' | 'map' | 'reduce' | 'aggregate'
  | 'join' | 'sort' | 'limit' | 'rename-fields'
  | 'math-transform' | 'group-by' | 'preview' | 'export';

// Node Status
export type NodeStatus = 'idle' | 'processing' | 'success' | 'error';

// Data Schema Types
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  nullable: boolean;
}

export interface DataSchema {
  fields: SchemaField[];
}

export interface DataPreview {
  sample: unknown[];
  totalRows: number;
  schema: DataSchema;
  errors?: string[];
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Node Configuration Types
export interface BaseNodeConfig {
  [key: string]: unknown;
}

export interface ApiNodeConfig extends BaseNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export interface FilterNodeConfig extends BaseNodeConfig {
  condition: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
  value: unknown;
}

export interface MapNodeConfig extends BaseNodeConfig {
  transformations: Array<{
    sourceField: string;
    targetField: string;
    expression: string;
  }>;
}

export interface JoinNodeConfig extends BaseNodeConfig {
  joinType: 'inner' | 'left' | 'right' | 'full';
  leftKey: string;
  rightKey: string;
}

export interface SortNodeConfig extends BaseNodeConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface LimitNodeConfig extends BaseNodeConfig {
  count: number;
  offset?: number;
}

export interface RenameFieldsNodeConfig extends BaseNodeConfig {
  mappings: Record<string, string>;
}

export interface MathTransformNodeConfig extends BaseNodeConfig {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'abs';
  field: string;
  value?: number;
  targetField?: string;
}

export interface GroupByNodeConfig extends BaseNodeConfig {
  groupBy: string[];
  aggregations: Array<{
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    alias?: string;
  }>;
}

export interface ExportNodeConfig extends BaseNodeConfig {
  format: 'json' | 'csv';
  filename?: string;
}

export type NodeConfig = 
  | ApiNodeConfig
  | FilterNodeConfig
  | MapNodeConfig
  | JoinNodeConfig
  | SortNodeConfig
  | LimitNodeConfig
  | RenameFieldsNodeConfig
  | MathTransformNodeConfig
  | GroupByNodeConfig
  | ExportNodeConfig
  | BaseNodeConfig;

// Node Data Interface
export interface NodeData {
  label: string;
  description?: string;
  category: 'source' | 'transform' | 'output';
  icon?: string;
  color?: string;
}

// Core Pipeline Node Interface
export interface PipelineNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  config: NodeConfig;
  status: NodeStatus;
  preview?: DataPreview;
}

// Pipeline Edge Interface
export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

// Pipeline Interface
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Execution Types
export interface ExecutionResult {
  success: boolean;
  results: Map<string, unknown[]>;
  errors: Map<string, string>;
  executionTime: number;
}

// Node Processor Interface
export interface NodeProcessor {
  validate(config: NodeConfig): ValidationResult;
  execute(data: unknown[], config: NodeConfig): Promise<unknown[]>;
  getSchema(config: NodeConfig): DataSchema;
  getPreview(data: unknown[], config: NodeConfig): DataPreview;
}

// Canvas Interface
export interface PipelineCanvas {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  viewport: Viewport;
  selectedNodes: string[];
  
  addNode(type: NodeType, position: Position): void;
  removeNode(nodeId: string): void;
  connectNodes(sourceId: string, targetId: string): void;
  updateNodeConfig(nodeId: string, config: NodeConfig): void;
}

// Execution Engine Interface
export interface ExecutionEngine {
  executeNode(node: PipelineNode, inputData: unknown[]): Promise<unknown[]>;
  executePipeline(pipeline: Pipeline): Promise<ExecutionResult>;
  validatePipeline(pipeline: Pipeline): ValidationResult;
  
  registerNodeProcessor(type: NodeType, processor: NodeProcessor): void;
}

// Collaboration Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export interface CRDTOperation {
  id: string;
  type: 'add_node' | 'remove_node' | 'update_node' | 'add_edge' | 'remove_edge' | 'update_edge';
  payload: unknown;
  timestamp: number;
  userId: string;
}

export interface PipelineChange {
  operation: CRDTOperation;
  pipelineId: string;
}

export interface CollaborationState {
  sessionId: string;
  activeUsers: User[];
  cursors: Map<string, Position>;
  pendingOperations: CRDTOperation[];
  lastSyncTimestamp: number;
}

// Collaboration Manager Interface
export interface CollaborationManager {
  joinSession(pipelineId: string): Promise<void>;
  leaveSession(): void;
  broadcastChange(change: PipelineChange): void;
  applyCRDTOperation(operation: CRDTOperation): void;
  
  onUserJoined(callback: (user: User) => void): void;
  onUserLeft(callback: (userId: string) => void): void;
  onCursorMove(callback: (userId: string, position: Position) => void): void;
}

// Version Control Types
export interface PipelineVersion {
  id: string;
  pipelineId: string;
  version: number;
  snapshot: Pipeline;
  createdAt: Date;
  createdBy: string;
  description?: string;
}

export interface VersionComparison {
  added: PipelineNode[];
  removed: PipelineNode[];
  modified: Array<{
    before: PipelineNode;
    after: PipelineNode;
    changes: string[];
  }>;
  edgeChanges: {
    added: PipelineEdge[];
    removed: PipelineEdge[];
  };
}

// Code Export Types
export interface CodeExportOptions {
  language: 'javascript' | 'python' | 'sql';
  includeComments: boolean;
  includeMetadata: boolean;
  formatCode: boolean;
}

export interface CodeExportResult {
  code: string;
  metadata: Pipeline;
  warnings: string[];
  unsupportedOperations: string[];
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  selectedTool: 'select' | 'pan' | 'zoom';
  showGrid: boolean;
  snapToGrid: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Error Types
export interface FlowForgeError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  nodeId?: string;
  pipelineId?: string;
}

// Web Worker Message Types
export interface WorkerMessage {
  id: string;
  type: 'execute_node' | 'execute_pipeline' | 'validate_pipeline';
  payload: unknown;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

// Store Types for Zustand
export interface PipelineStore {
  currentPipeline: Pipeline | null;
  pipelines: Pipeline[];
  selectedNodes: string[];
  clipboard: PipelineNode[];
  
  // Actions
  createPipeline: (name: string) => void;
  loadPipeline: (id: string) => void;
  savePipeline: () => void;
  addNode: (type: NodeType, position: Position) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<PipelineNode>) => void;
  addEdge: (edge: PipelineEdge) => void;
  removeEdge: (edgeId: string) => void;
  selectNodes: (nodeIds: string[]) => void;
  copyNodes: (nodeIds: string[]) => void;
  pasteNodes: (position: Position) => void;
}

export interface ExecutionStore {
  isExecuting: boolean;
  executionResults: Map<string, unknown[]>;
  executionErrors: Map<string, string>;
  
  // Actions
  executeNode: (nodeId: string) => Promise<void>;
  executePipeline: () => Promise<void>;
  clearResults: () => void;
}

export interface CollaborationStore {
  isConnected: boolean;
  sessionId: string | null;
  activeUsers: User[];
  cursors: Map<string, Position>;
  
  // Actions
  connect: (pipelineId: string) => Promise<void>;
  disconnect: () => void;
  updateCursor: (position: Position) => void;
  broadcastChange: (change: PipelineChange) => void;
}

export interface UIStore {
  sidebarOpen: boolean;
  selectedTool: 'select' | 'pan' | 'zoom';
  showGrid: boolean;
  snapToGrid: boolean;
  notifications: Notification[];
  
  // Actions
  toggleSidebar: () => void;
  setSelectedTool: (tool: 'select' | 'pan' | 'zoom') => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}