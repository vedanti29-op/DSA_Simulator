
import React from 'react';
import { QueueElement } from '../types';

interface QueueVisualizerProps {
  queueData: QueueElement[];
  highlights: {
    nodeId?: number; // For peek/dequeue
    newNodeId?: number; // for enqueue
  };
  dimensions: { width: number; height: number };
}

const ELEMENT_WIDTH = 60;
const ELEMENT_HEIGHT = 40;

const QueueVisualizer: React.FC<QueueVisualizerProps> = ({ queueData, highlights, dimensions }) => {

  const getElementColor = (elementId: number) => {
    if (highlights.nodeId === elementId) return 'bg-delete'; // Dequeue/Peek is red
    if (highlights.newNodeId === elementId) return 'bg-path'; // Enqueue is green
    return 'bg-primary-500';
  };
  
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-auto relative font-sans p-4 flex items-center justify-center">
        <div className="flex items-center space-x-5">
            {queueData.map((el, index) => (
                <div key={el.id} className="flex flex-col items-center">
                    <div
                        className={`flex items-center justify-center rounded-lg shadow-md transition-all duration-300 text-white font-bold text-lg ${getElementColor(el.id)}`}
                        style={{ width: ELEMENT_WIDTH, height: ELEMENT_HEIGHT }}
                    >
                        {el.value}
                    </div>
                    {index === 0 && <div className="mt-2 font-semibold text-gray-600 dark:text-gray-300">Front</div>}
                    {index === queueData.length - 1 && index !== 0 && <div className="mt-2 font-semibold text-gray-600 dark:text-gray-300">Rear</div>}
                </div>
            ))}
        </div>
         {queueData.length === 0 && (
             <div className="text-gray-400 text-2xl">Queue is empty</div>
         )}
    </div>
  );
};

export default QueueVisualizer;