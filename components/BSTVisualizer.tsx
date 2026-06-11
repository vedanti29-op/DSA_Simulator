
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../types';
import { NODE_RADIUS } from '../constants';

interface BSTVisualizerProps {
  treeData: TreeNode | null;
  highlights: {
    nodeId?: number;
    targetId?: number;
    fromId?: number;
    toId?: number;
    pathId?: number;
    rotationNodeId?: number;
  };
  dimensions: { width: number; height: number };
}

// FIX: Explicitly define properties from d3.HierarchyPointNode to resolve TypeScript errors.
interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  data: TreeNode;
  x: number;
  y: number;
}
interface D3Link extends d3.HierarchyPointLink<TreeNode> {
    source: D3Node;
    target: D3Node;
}

const BSTVisualizer: React.FC<BSTVisualizerProps> = ({ treeData, highlights, dimensions }) => {
  const treeLayout = useMemo(() => d3.tree<TreeNode>().size([dimensions.width - 80, dimensions.height - 120]), [dimensions]);
  
  const root = useMemo(() => {
    if (!treeData) return null;
    return treeLayout(d3.hierarchy(treeData, d => d.children));
  }, [treeData, treeLayout]);

  const nodes = useMemo(() => root ? root.descendants() as D3Node[] : [], [root]);
  const links = useMemo(() => root ? root.links() as D3Link[] : [], [root]);

  const getNodeColor = (nodeId: number) => {
    if (highlights.rotationNodeId === nodeId) return 'fill-purple-500';
    if (highlights.nodeId === nodeId) return 'fill-highlight';
    if (highlights.targetId === nodeId) return 'fill-compare';
    if (highlights.pathId === nodeId) return 'fill-path';
    return 'fill-primary-500';
  };

  const getLinkColor = (sourceId: number, targetId: number) => {
    if (highlights.fromId === sourceId && highlights.toId === targetId) {
        return 'stroke-path';
    }
    return 'stroke-gray-400 dark:stroke-gray-600';
  }
  
  const hasAvlProperties = nodes.some(n => n.data.height !== undefined);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden">
      <svg width={dimensions.width} height={dimensions.height} className="font-sans">
        <g transform="translate(40, 60)">
          {links.map((link, i) => (
            <line
              key={`link-${i}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              className={`transition-all duration-300 ${getLinkColor(link.source.data.id, link.target.data.id)}`}
              strokeWidth={2}
            />
          ))}
          {nodes.map((node, i) => (
            <g key={`node-g-${i}`} transform={`translate(${node.x},${node.y})`} className="transition-transform duration-300">
              <circle
                r={NODE_RADIUS * (hasAvlProperties ? 1.4 : 1)}
                className={`transition-colors duration-300 ${getNodeColor(node.data.id)}`}
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                dy={hasAvlProperties ? "-0.5em" : ".3em"}
                textAnchor="middle"
                className="fill-white font-bold text-sm select-none"
              >
                {node.data.value}
              </text>
              {hasAvlProperties && (
                <>
                  <text
                    dy="0.6em"
                    dx="-12"
                    textAnchor="middle"
                    className="fill-white font-semibold text-xs select-none"
                  >
                    h: {node.data.height}
                  </text>
                  <text
                    dy="0.6em"
                    dx="12"
                    textAnchor="middle"
                    className="fill-white font-semibold text-xs select-none"
                  >
                    b: {node.data.balanceFactor}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default BSTVisualizer;