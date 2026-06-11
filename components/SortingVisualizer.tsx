
import React from 'react';

interface SortingVisualizerProps {
  arrayData: number[];
  highlights: {
    compare?: (number | undefined)[];
    swap?: (number | undefined)[];
    path?: (number | undefined)[];
    sortedIndex?: number;
    pivot?: number;
  };
  dimensions: { width: number; height: number };
}

const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ arrayData, highlights, dimensions }) => {
  const maxValue = React.useMemo(() => Math.max(...arrayData, 1), [arrayData]);

  const getBarColor = (index: number) => {
    if (highlights.swap?.includes(index)) return 'bg-delete'; // red-500
    if (highlights.pivot === index) return 'bg-purple-500';
    if (highlights.compare?.includes(index)) return 'bg-compare'; // orange-500
    if (highlights.path?.includes(index)) return 'bg-yellow-400';
    if (highlights.sortedIndex !== undefined && (index <= highlights.sortedIndex || index >= highlights.sortedIndex)) {
        // This condition works for both left-to-right (Insertion/Selection) and right-to-left (Bubble) sorted boundaries
        // and for QuickSort's finalized pivots.
        return 'bg-path'; // green-400
    }
    return 'bg-primary-500';
  };
  
  const barWidth = Math.max(4, dimensions.width / (arrayData.length * 1.5));

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden flex justify-center items-end p-4 gap-1">
      {arrayData.map((value, index) => (
        <div
          key={index}
          className={`flex items-start justify-center rounded-t-md transition-all duration-300 ${getBarColor(index)}`}
          style={{
            height: `${Math.max((value / maxValue) * 98, 5)}%`,
            width: `${barWidth}px`
          }}
          title={`${value}`}
        >
           {arrayData.length < 40 && barWidth > 15 && <span className="text-white text-xs font-bold mt-1">{value}</span>}
        </div>
      ))}
    </div>
  );
};

export default SortingVisualizer;
