
import React from 'react';
import { StackElement } from '../types';

interface StackVisualizerProps {
  stackData: StackElement[];
  highlights: {
    nodeId?: number; // For peek/pop
    newNodeId?: number; // for push
  };
  dimensions: { width: number; height: number };
}

const ELEMENT_WIDTH = 80;
const ELEMENT_HEIGHT = 40;

const StackVisualizer: React.FC<StackVisualizerProps> = ({ stackData, highlights, dimensions }) => {

  const getElementColor = (elementId: number) => {
    if (highlights.nodeId === elementId) return 'bg-delete'; // Pop/Peek is red
    if (highlights.newNodeId === elementId) return 'bg-path'; // Push is green
    return 'bg-primary-500';
  };
  
  const reversedData = React.useMemo(() => [...stackData].reverse(), [stackData]);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-auto relative font-sans p-4 flex items-center justify-center">
        <div className="flex flex-col-reverse items-center space-y-2 space-y-reverse">
            {reversedData.map((el, index) => (
                <div key={el.id} className="flex items-center space-x-4">
                    <div
                        className={`flex items-center justify-center rounded-lg shadow-md transition-all duration-300 text-white font-bold text-lg ${getElementColor(el.id)}`}
                        style={{ width: ELEMENT_WIDTH, height: ELEMENT_HEIGHT }}
                    >
                        {el.value}
                    </div>
                     {index === 0 && <div className="font-semibold text-gray-600 dark:text-gray-300 text-lg">← Top</div>}
                </div>
            ))}
        </div>
         {stackData.length === 0 && (
             <div className="text-gray-400 text-2xl">Stack is empty</div>
         )}
    </div>
  );
};

export default StackVisualizer;