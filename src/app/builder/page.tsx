'use client';

import React, { useState, useCallback } from 'react';
import { Connection } from 'reactflow';
import { PipelineCanvasProvider } from '@/components/canvas/PipelineCanvas';
import { NodePalette } from '@/components/canvas/NodePalette';
import { PipelineNode, PipelineEdge, NodeType, Position } from '@/types';
import { createNode } from '@/lib/nodes/nodeFactory';
import { v4 as uuidv4 } from 'uuid';

export default function PipelineBuilder() {
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const [edges, setEdges] = useState<PipelineEdge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Handle adding new nodes
  const handleNodeAdd = useCallback((type: NodeType, position: Position) => {
    const newNode = createNode(type, position);
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Handle removing nodes
  const handleNodeRemove = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
  }, []);

  // Handle connecting nodes
  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const newEdge: PipelineEdge = {
        id: uuidv4(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        animated: true,
      };
      setEdges(prev => [...prev, newEdge]);
    }
  }, []);

  // Handle nodes change (position updates, etc.)
  const handleNodesChange = useCallback((updatedNodes: PipelineNode[]) => {
    setNodes(updatedNodes);
  }, []);

  // Handle edges change
  const handleEdgesChange = useCallback((updatedEdges: PipelineEdge[]) => {
    setEdges(updatedEdges);
  }, []);

  return (
    <div className="h-screen flex bg-secondary-50">
      {/* Node Palette Sidebar */}
      <NodePalette className="w-80 flex-shrink-0" />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-secondary-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-secondary-800">
                Pipeline Builder
              </h1>
              <div className="text-sm text-secondary-600">
                {nodes.length} nodes, {edges.length} connections
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors">
                Save
              </button>
              <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Execute Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <PipelineCanvasProvider
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeAdd={handleNodeAdd}
            onNodeRemove={handleNodeRemove}
            onNodeSelect={handleNodeSelect}
            onConnect={handleConnect}
          />
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-secondary-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <div className="flex items-center gap-4">
              <span>Ready</span>
              {selectedNodes.length > 0 && (
                <span>{selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>FlowForge v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}