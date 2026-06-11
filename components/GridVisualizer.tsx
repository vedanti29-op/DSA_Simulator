
import React from 'react';
import { GridNode } from '../types';

interface GridVisualizerProps {
  grid: GridNode[][];
  onNodeClick: (row: number, col: number) => void;
  onNodeHover: (row: number, col: number) => void;
  highlights: {
    queue?: [number, number][]; // For BFS
    stack?: [number, number][]; // For DFS
    visited?: Set<string>;
    path?: Set<string>;
    current?: [number, number];
  };
  dimensions: { width: number; height: number };
}

const GridVisualizer: React.FC<GridVisualizerProps> = ({ grid, onNodeClick, onNodeHover, highlights, dimensions }) => {
    
  const getNodeColor = (node: GridNode) => {
    const key = `${node.row},${node.col}`;
    if (node.isStart) return 'bg-green-500';
    if (node.isEnd) return 'bg-red-500';
    if (highlights.path?.has(key)) return 'bg-yellow-400';
    if (highlights.current && highlights.current[0] === node.row && highlights.current[1] === node.col) return 'bg-pink-500';
    if (highlights.queue?.some(c => c[0] === node.row && c[1] === node.col)) return 'bg-blue-400'; // BFS Frontier
    if (highlights.stack?.some(c => c[0] === node.row && c[1] === node.col)) return 'bg-teal-400'; // DFS Frontier
    if (highlights.visited?.has(key)) return 'bg-blue-200 dark:bg-blue-800';
    if (node.isWall) return 'bg-gray-600 dark:bg-gray-800';
    return 'bg-gray-50 dark:bg-gray-700';
  };
  
  const nodeSize = Math.min(
    Math.floor((dimensions.width - 20) / grid[0].length),
    Math.floor((dimensions.height - 20) / grid.length)
  );

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-900 rounded-lg shadow-inner flex justify-center items-center p-2">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, ${nodeSize}px)`, gap: '1px' }}>
        {grid.map((row, rowIndex) =>
          row.map((node, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`transition-colors duration-200 ${getNodeColor(node)}`}
              style={{ width: `${nodeSize}px`, height: `${nodeSize}px` }}
              onMouseDown={() => onNodeClick(rowIndex, colIndex)}
              onMouseEnter={() => onNodeHover(rowIndex, colIndex)}
              title={`(${rowIndex}, ${colIndex})`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GridVisualizer;
