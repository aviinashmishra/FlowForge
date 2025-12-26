'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType, NodeStatus, NodeData, NodeConfig, DataPreview } from '@/types';

interface CustomNodeData extends NodeData {
  config: NodeConfig;
  status: NodeStatus;
  preview?: DataPreview;
  onRemove: () => void;
}

const nodeIcons: Record<NodeType, string> = {
  'api-fetch': '🌐',
  'csv-upload': '📄',
  'json-parser': '📋',
  'filter': '🔍',
  'map': '🔄',
  'reduce': '📊',
  'aggregate': '📈',
  'join': '🔗',
  'sort': '📶',
  'limit': '✂️',
  'rename-fields': '🏷️',
  'math-transform': '🧮',
  'group-by': '📦',
  'preview': '👁️',
  'export': '💾',
};

const nodeColors: Record<string, string> = {
  source: 'bg-green-50 border-green-500 text-green-800',
  transform: 'bg-primary-100 border-primary-300 text-primary-800',
  output: 'bg-orange-50 border-orange-500 text-orange-800',
};

const statusColors: Record<NodeStatus, string> = {
  idle: 'border-secondary-300',
  processing: 'border-primary-500 animate-pulse',
  success: 'border-green-500',
  error: 'border-red-500',
};

export const CustomNode = memo(function CustomNode({ data, selected, type }: NodeProps<CustomNodeData>) {
  const nodeType = type as NodeType;
  const icon = nodeIcons[nodeType] || '⚙️';
  const categoryColor = nodeColors[data.category] || nodeColors.transform;
  const statusColor = statusColors[data.status] || statusColors.idle;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onRemove();
  };

  return (
    <div 
      className={`
        relative min-w-[200px] rounded-lg border-2 shadow-lg transition-all duration-200
        ${categoryColor} ${statusColor}
        ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
        hover:shadow-xl
      `}
    >
      {/* Input Handle */}
      {data.category !== 'source' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-secondary-400 border-2 border-white"
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-current/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            {data.description && (
              <p className="text-xs opacity-75 mt-1">{data.description}</p>
            )}
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {data.status === 'processing' && (
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          )}
          {data.status === 'success' && (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          {data.status === 'error' && (
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          )}
          
          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-colors text-xs flex items-center justify-center"
            title="Remove node"
          >
            ×
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {/* Configuration Summary */}
        {Object.keys(data.config).length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium opacity-75 mb-1">Configuration:</div>
            <div className="text-xs opacity-60 space-y-1">
              {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                <div key={key} className="truncate">
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
              {Object.keys(data.config).length > 3 && (
                <div className="text-xs opacity-50">
                  +{Object.keys(data.config).length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {data.preview && (
          <div className="mt-2 pt-2 border-t border-current/20">
            <div className="text-xs font-medium opacity-75 mb-1">
              Data Preview ({data.preview.totalRows} rows):
            </div>
            <div className="text-xs opacity-60">
              {data.preview.schema.fields.slice(0, 3).map(field => (
                <div key={field.name} className="truncate">
                  {field.name}: {field.type}
                </div>
              ))}
              {data.preview.schema.fields.length > 3 && (
                <div className="opacity-50">
                  +{data.preview.schema.fields.length - 3} more fields...
                </div>
              )}
            </div>
            
            {/* Error Messages */}
            {data.preview.errors && data.preview.errors.length > 0 && (
              <div className="mt-1 text-xs text-red-600">
                {data.preview.errors.slice(0, 2).map((error, index) => (
                  <div key={index} className="truncate">⚠️ {error}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      {data.category !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-secondary-400 border-2 border-white"
        />
      )}
    </div>
  );
});