
import React from 'react';
import { LinkedListNode } from '../types';

interface LinkedListVisualizerProps {
  listData: LinkedListNode[];
  highlights: {
    nodeId?: number;
    pathId?: number;
    fromId?: number;
    toId?: number;
    newNodeId?: number;
    deletedNodeId?: number;
  };
  dimensions: { width: number; height: number };
}

const NODE_WIDTH = 60;
const NODE_HEIGHT = 40;
const NODE_SPACING = 80;

const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({ listData, highlights, dimensions }) => {

  const getNodeColor = (nodeId: number) => {
    if (highlights.newNodeId === nodeId) return 'fill-path'; // Green for new node
    if (highlights.deletedNodeId === nodeId) return 'fill-delete'; // Red for deleted node
    if (highlights.nodeId === nodeId) return 'fill-highlight'; // Yellow for traverse/compare
    if (highlights.pathId === nodeId) return 'fill-path'; // Green for found path
    return 'fill-primary-500';
  };
  
  const getLinkColor = (sourceId: number, targetId: number | null) => {
    if (highlights.fromId === sourceId && highlights.toId === targetId) {
        return 'stroke-path';
    }
    return 'stroke-gray-400 dark:stroke-gray-600';
  }

  const nodePositions = React.useMemo(() => {
    const positions = new Map<number, { x: number, y: number }>();
    const yCenter = dimensions.height / 2;
    listData.forEach((node, index) => {
        positions.set(node.id, {
            x: index * (NODE_WIDTH + NODE_SPACING) + NODE_SPACING,
            y: yCenter
        });
    });
    return positions;
  }, [listData, dimensions.height]);
  
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-auto">
        <svg width={Math.max(dimensions.width, listData.length * (NODE_WIDTH + NODE_SPACING) + NODE_SPACING)} height={dimensions.height} className="font-sans">
            <g>
                {listData.map((node, index) => {
                    const pos = nodePositions.get(node.id);
                    const nextPos = node.next ? nodePositions.get(node.next) : null;
                    if (!pos) return null;
                    
                    return (
                        <g key={`node-g-${node.id}`}>
                            {nextPos && (
                                <path 
                                    d={`M ${pos.x + NODE_WIDTH / 2},${pos.y} C ${pos.x + NODE_WIDTH / 2 + NODE_SPACING / 2},${pos.y} ${nextPos.x - NODE_WIDTH / 2 - NODE_SPACING / 2},${nextPos.y} ${nextPos.x - NODE_WIDTH / 2},${nextPos.y}`}
                                    className={`transition-all duration-300 ${getLinkColor(node.id, node.next)}`}
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrow)"
                                />
                            )}
                            <rect
                                x={pos.x - NODE_WIDTH / 2}
                                y={pos.y - NODE_HEIGHT / 2}
                                width={NODE_WIDTH}
                                height={NODE_HEIGHT}
                                rx={8}
                                className={`transition-colors duration-300 ${getNodeColor(node.id)}`}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                            <text
                                x={pos.x}
                                y={pos.y}
                                dy=".3em"
                                textAnchor="middle"
                                className="fill-white font-bold text-sm select-none"
                            >
                                {node.value}
                            </text>
                        </g>
                    );
                })}
            </g>
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-400 dark:fill-gray-600" />
                </marker>
            </defs>
        </svg>
    </div>
  );
};

export default LinkedListVisualizer;
