
import React from 'react';
import { HashTableEntry } from '../types';

interface HashTableVisualizerProps {
  hashTableData: HashTableEntry[][];
  highlights: {
    bucketIndex?: number;
    chainNodeId?: string;
    pathId?: string;
    visitedChainNodeIds?: string[];
  };
  dimensions: { width: number; height: number };
}

const BUCKET_WIDTH = 80;
const NODE_HEIGHT = 30;
const CHAIN_NODE_WIDTH = 120;

const HashTableVisualizer: React.FC<HashTableVisualizerProps> = ({ hashTableData, highlights, dimensions }) => {
  const getBucketColor = (index: number) => {
    return highlights.bucketIndex === index ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700';
  };

  const getChainNodeColor = (nodeId: string) => {
    if (highlights.pathId === nodeId) return 'bg-path text-white';
    if (highlights.chainNodeId === nodeId) return 'bg-highlight text-black';
    if (highlights.visitedChainNodeIds?.includes(nodeId)) return 'bg-gray-400 dark:bg-gray-500 text-white';
    return 'bg-primary-500 text-white';
  };
  
  const totalWidth = hashTableData.length * (BUCKET_WIDTH + 10);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-auto p-4 font-sans">
      <div className="relative flex justify-center" style={{ minWidth: totalWidth }}>
        {/* Render Buckets */}
        <div className="flex flex-row items-start gap-2">
          {hashTableData.map((bucket, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-t w-full h-10 border-b-2 border-gray-400 font-semibold transition-colors duration-300 ${getBucketColor(index)}`}
                style={{ width: BUCKET_WIDTH }}
              >
                {index}
              </div>
              
              {/* Render Chain */}
              <div className="flex flex-col items-center mt-2 space-y-2">
                {bucket.map((entry, entryIndex) => (
                  <React.Fragment key={entry.id}>
                    {/* Link */}
                    {entryIndex > 0 && <div className="h-4 w-0.5 bg-gray-400" />}
                    {/* Node */}
                    <div
                      className={`flex items-center justify-center p-1 rounded shadow-md text-xs transition-colors duration-300 ${getChainNodeColor(entry.id)}`}
                      style={{ height: NODE_HEIGHT, width: CHAIN_NODE_WIDTH }}
                    >
                       <span className="font-bold mr-2">{entry.key}:</span> {entry.value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HashTableVisualizer;
