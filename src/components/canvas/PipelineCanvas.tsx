'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PipelineNode, PipelineEdge, NodeType, Position } from '@/types';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';

// Define custom node types
const nodeTypes: NodeTypes = {
  'api-fetch': CustomNode,
  'csv-upload': CustomNode,
  'json-parser': CustomNode,
  'filter': CustomNode,
  'map': CustomNode,
  'reduce': CustomNode,
  'aggregate': CustomNode,
  'join': CustomNode,
  'sort': CustomNode,
  'limit': CustomNode,
  'rename-fields': CustomNode,
  'math-transform': CustomNode,
  'group-by': CustomNode,
  'preview': CustomNode,
  'export': CustomNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

interface PipelineCanvasProps {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  onNodesChange: (nodes: PipelineNode[]) => void;
  onEdgesChange: (edges: PipelineEdge[]) => void;
  onNodeAdd: (type: NodeType, position: Position) => void;
  onNodeRemove: (nodeId: string) => void;
  onNodeSelect: (nodeIds: string[]) => void;
  onConnect: (connection: Connection) => void;
  className?: string;
}

export function PipelineCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeAdd,
  onNodeRemove,
  onNodeSelect,
  onConnect,
  className = '',
}: PipelineCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Convert our pipeline nodes/edges to ReactFlow format
  const reactFlowNodes: Node[] = nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      config: node.config,
      status: node.status,
      preview: node.preview,
      onRemove: () => onNodeRemove(node.id),
    },
    selected: false,
  }));

  const reactFlowEdges: Edge[] = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    animated: edge.animated || false,
    style: edge.style,
    type: 'default',
  }));

  const [rfNodes, setNodes, onNodesChangeInternal] = useNodesState(reactFlowNodes);
  const [rfEdges, setEdges, onEdgesChangeInternal] = useEdgesState(reactFlowEdges);

  // Update ReactFlow nodes when props change
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update ReactFlow edges when props change
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node changes and convert back to our format
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    
    // Convert back to our pipeline node format
    const updatedNodes: PipelineNode[] = rfNodes.map(rfNode => {
      const originalNode = nodes.find(n => n.id === rfNode.id);
      if (!originalNode) return originalNode!;
      
      return {
        ...originalNode,
        position: rfNode.position,
      };
    }).filter(Boolean);
    
    onNodesChange(updatedNodes);
  }, [onNodesChangeInternal, rfNodes, nodes, onNodesChange]);

  // Handle edge changes and convert back to our format
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    
    // Convert back to our pipeline edge format
    const updatedEdges: PipelineEdge[] = rfEdges.map(rfEdge => {
      const originalEdge = edges.find(e => e.id === rfEdge.id);
      if (!originalEdge) return originalEdge!;
      
      return {
        ...originalEdge,
        animated: rfEdge.animated,
        style: rfEdge.style as Record<string, unknown> | undefined,
      };
    }).filter(Boolean);
    
    onEdgesChange(updatedEdges);
  }, [onEdgesChangeInternal, rfEdges, edges, onEdgesChange]);

  // Handle new connections
  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      onConnect(connection);
    }
  }, [onConnect]);

  // Handle node selection
  const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    const selectedIds = selectedNodes.map(node => node.id);
    onNodeSelect(selectedIds);
  }, [onNodeSelect]);

  // Handle drag over for drop functionality
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to add new nodes
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow');

    if (!nodeType || !reactFlowBounds || !reactFlowInstance) {
      return;
    }

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    onNodeAdd(nodeType as NodeType, position);
  }, [reactFlowInstance, onNodeAdd]);

  return (
    <div className={`w-full h-full ${className}`} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={handleSelectionChange}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-left"
        className="bg-secondary-50"
      >
        <Controls 
          className="bg-white border border-secondary-200 rounded-lg shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap 
          className="bg-white border border-secondary-200 rounded-lg shadow-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'api-fetch':
              case 'csv-upload':
              case 'json-parser':
                return '#10b981'; // green for source nodes
              case 'preview':
              case 'export':
                return '#f97316'; // orange for output nodes
              default:
                return '#a855f7'; // primary color for transform nodes
            }
          }}
          maskColor="rgba(255, 255, 255, 0.2)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
      </ReactFlow>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function PipelineCanvasProvider(props: PipelineCanvasProps) {
  return (
    <ReactFlowProvider>
      <PipelineCanvas {...props} />
    </ReactFlowProvider>
  );
}