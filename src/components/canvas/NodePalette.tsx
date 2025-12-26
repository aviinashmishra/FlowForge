'use client';

import React, { useState } from 'react';
import { NodeType } from '@/types';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  category: 'source' | 'transform' | 'output';
  icon: string;
}

const nodeDefinitions: NodePaletteItem[] = [
  // Source Nodes
  {
    type: 'api-fetch',
    label: 'API Fetch',
    description: 'Fetch data from REST APIs',
    category: 'source',
    icon: '🌐',
  },
  {
    type: 'csv-upload',
    label: 'CSV Upload',
    description: 'Upload and parse CSV files',
    category: 'source',
    icon: '📄',
  },
  {
    type: 'json-parser',
    label: 'JSON Parser',
    description: 'Parse JSON data',
    category: 'source',
    icon: '📋',
  },

  // Transform Nodes
  {
    type: 'filter',
    label: 'Filter',
    description: 'Filter rows based on conditions',
    category: 'transform',
    icon: '🔍',
  },
  {
    type: 'map',
    label: 'Map',
    description: 'Transform data fields',
    category: 'transform',
    icon: '🔄',
  },
  {
    type: 'reduce',
    label: 'Reduce',
    description: 'Reduce data to single values',
    category: 'transform',
    icon: '📊',
  },
  {
    type: 'aggregate',
    label: 'Aggregate',
    description: 'Aggregate data with functions',
    category: 'transform',
    icon: '📈',
  },
  {
    type: 'join',
    label: 'Join',
    description: 'Join multiple data sources',
    category: 'transform',
    icon: '🔗',
  },
  {
    type: 'sort',
    label: 'Sort',
    description: 'Sort data by fields',
    category: 'transform',
    icon: '📶',
  },
  {
    type: 'limit',
    label: 'Limit',
    description: 'Limit number of rows',
    category: 'transform',
    icon: '✂️',
  },
  {
    type: 'rename-fields',
    label: 'Rename Fields',
    description: 'Rename data fields',
    category: 'transform',
    icon: '🏷️',
  },
  {
    type: 'math-transform',
    label: 'Math Transform',
    description: 'Mathematical operations',
    category: 'transform',
    icon: '🧮',
  },
  {
    type: 'group-by',
    label: 'Group By',
    description: 'Group data by fields',
    category: 'transform',
    icon: '📦',
  },

  // Output Nodes
  {
    type: 'preview',
    label: 'Preview',
    description: 'Preview data output',
    category: 'output',
    icon: '👁️',
  },
  {
    type: 'export',
    label: 'Export',
    description: 'Export data to files',
    category: 'output',
    icon: '💾',
  },
];

const categoryColors = {
  source: 'bg-green-50 border-green-500 text-green-800',
  transform: 'bg-primary-100 border-primary-300 text-primary-800',
  output: 'bg-orange-50 border-orange-500 text-orange-800',
};

const categoryLabels = {
  source: 'Data Sources',
  transform: 'Transformations',
  output: 'Outputs',
};

interface NodePaletteProps {
  className?: string;
}

export function NodePalette({ className = '' }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter nodes based on search and category
  const filteredNodes = nodeDefinitions.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group nodes by category
  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodePaletteItem[]>);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`bg-white border-r border-secondary-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-800 mb-3">Node Palette</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            All
          </button>
          {Object.keys(categoryLabels).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-secondary-700 mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {nodes.map(node => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className={`
                    p-3 rounded-lg border cursor-move transition-all duration-200
                    ${categoryColors[node.category]}
                    hover:shadow-md hover:scale-105 active:scale-95
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{node.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm">{node.label}</h4>
                      <p className="text-xs opacity-75 mt-1">{node.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8 text-secondary-500">
            <svg className="mx-auto h-12 w-12 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <p className="text-sm">No nodes found</p>
            <p className="text-xs mt-1">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <p className="text-xs text-secondary-600">
          💡 Drag nodes from the palette to the canvas to build your pipeline
        </p>
      </div>
    </div>
  );
}