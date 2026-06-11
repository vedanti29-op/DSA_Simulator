
import type { VisualizationStep } from '../types';

export function generateBubbleSortSteps(array: number[]): [VisualizationStep[], number[]] {
    const steps: VisualizationStep[] = [];
    const arr = [...array];
    const n = arr.length;

    steps.push({ type: 'message', message: `Starting Bubble Sort on array: [${arr.join(', ')}]`, codeLine: 1 });

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ type: 'compare', indices: [j, j + 1], message: `Comparing elements at index ${j} (${arr[j]}) and ${j + 1} (${arr[j+1]})`, codeLine: 5 });
            if (arr[j] > arr[j + 1]) {
                const val1 = arr[j];
                const val2 = arr[j+1];
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
                steps.push({ type: 'swap', indices: [j, j + 1], message: `${val1} > ${val2}. Swapping them.`, codeLine: 6, arrayState: [...arr] });
            } else {
                 steps.push({ type: 'message', message: `${arr[j]} <= ${arr[j+1]}. No swap needed.`, codeLine: 5 });
            }
        }
        steps.push({ type: 'sorted-boundary', boundary: n - 1 - i, message: `Element ${arr[n - 1 - i]} is now in its correct sorted position.`, codeLine: 8 });
        if(!swapped) {
            steps.push({ type: 'message', message: 'No swaps in this pass. Array is sorted.', codeLine: 8 });
            break;
        }
    }
     steps.push({ type: 'sorted-boundary', boundary: 0, message: `The entire array is now sorted.`, codeLine: 10 });
     steps.push({ type: 'message', message: `Bubble Sort complete. Final array: [${arr.join(', ')}]`, codeLine: 10 });


    return [steps, arr];
}

export function generateSelectionSortSteps(array: number[]): [VisualizationStep[], number[]] {
    const steps: VisualizationStep[] = [];
    const arr = [...array];
    const n = arr.length;

    steps.push({ type: 'message', message: `Starting Selection Sort on array: [${arr.join(', ')}]`, codeLine: 1 });
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        steps.push({ type: 'message', message: `Outer loop pass ${i+1}. Finding minimum in unsorted part starting at index ${i}.`, codeLine: 3 });
        steps.push({ type: 'path', indices: [i], message: `Current minimum assumed to be ${arr[minIndex]} at index ${minIndex}.`, codeLine: 4 });

        for (let j = i + 1; j < n; j++) {
            steps.push({ type: 'compare', indices: [j, minIndex], message: `Comparing element ${arr[j]} with current minimum ${arr[minIndex]}.`, codeLine: 6 });
            if (arr[j] < arr[minIndex]) {
                const oldMinVal = arr[minIndex];
                minIndex = j;
                steps.push({ type: 'path', indices: [j], message: `${arr[j]} < ${oldMinVal}. New minimum is ${arr[j]}.`, codeLine: 7});
            }
        }
        
        if (minIndex !== i) {
             const val1 = arr[i];
             const val2 = arr[minIndex];
             [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
             steps.push({ type: 'swap', indices: [i, minIndex], message: `Swapping minimum element ${val2} with element at start of unsorted part ${val1}.`, codeLine: 10, arrayState: [...arr] });
        } else {
             steps.push({ type: 'message', message: `Element ${arr[i]} is already in its correct position.`, codeLine: 10 });
        }
        steps.push({ type: 'sorted-boundary', boundary: i, message: `Element ${arr[i]} is now sorted.`, codeLine: 10 });
    }
    
    steps.push({ type: 'sorted-boundary', boundary: n-1, message: `The entire array is now sorted.`, codeLine: 12 });
    steps.push({ type: 'message', message: `Selection Sort complete. Final array: [${arr.join(', ')}]`, codeLine: 12 });

    return [steps, arr];
}

export function generateInsertionSortSteps(array: number[]): [VisualizationStep[], number[]] {
    const steps: VisualizationStep[] = [];
    const arr = [...array];
    const n = arr.length;
    steps.push({ type: 'message', message: `Starting Insertion Sort on array: [${arr.join(', ')}]`, codeLine: 1 });
    steps.push({ type: 'sorted-boundary', boundary: 0, message: `First element is considered sorted.`, codeLine: 1 });
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        steps.push({ type: 'path', indices: [i], message: `Selecting ${key} as the key to insert into the sorted portion.`, codeLine: 3 });
        
        if (j >= 0) {
            steps.push({ type: 'compare', indices: [j, i], message: `Comparing key ${key} with ${arr[j]}.`, codeLine: 5 });
        }
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            steps.push({ type: 'swap', indices: [j+1, j], message: `${arr[j+1]} > ${key}. Shifting ${arr[j+1]} to the right.`, codeLine: 6, arrayState: [...arr] });
            j--;
            if(j >= 0) steps.push({ type: 'compare', indices: [j, i], message: `Comparing key ${key} with ${arr[j]}.`, codeLine: 5 });
        }
        arr[j + 1] = key;
        steps.push({ type: 'swap', indices: [j+1], message: `Inserting key ${key} at its correct position.`, codeLine: 9, arrayState: [...arr] });
        steps.push({ type: 'sorted-boundary', boundary: i, message: `Elements up to index ${i} are now sorted.`, codeLine: 2 });
    }
    
    steps.push({ type: 'message', message: `Insertion Sort complete. Final array: [${arr.join(', ')}]`, codeLine: 11 });
    return [steps, arr];
}

export function generateQuickSortSteps(array: number[]): [VisualizationStep[], number[]] {
    const steps: VisualizationStep[] = [];
    const arr = [...array];
    
    steps.push({ type: 'message', message: `Starting Quick Sort on array: [${arr.join(', ')}]`, codeLine: 1 });
    
    function partition(low: number, high: number): number {
        const pivot = arr[high];
        steps.push({ type: 'set-pivot', pivotIndex: high, message: `Choosing ${pivot} as the pivot for range [${low}, ${high}].`, codeLine: 9 });
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            steps.push({ type: 'compare', indices: [j, high], message: `Comparing ${arr[j]} with pivot ${pivot}.`, codeLine: 11 });
            if (arr[j] < pivot) {
                i++;
                const val1 = arr[i];
                const val2 = arr[j];
                [arr[i], arr[j]] = [arr[j], arr[i]];
                steps.push({ type: 'swap', indices: [i, j], message: `${val2} < ${pivot}. Swapping ${val1} and ${val2}.`, codeLine: 13, arrayState: [...arr] });
            }
        }
        
        const val1 = arr[i+1];
        const val2 = arr[high];
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        steps.push({ type: 'swap', indices: [i + 1, high], message: `Placing pivot ${val2} at its final sorted position.`, codeLine: 16, arrayState: [...arr] });
        steps.push({ type: 'sorted-boundary', boundary: i + 1, message: `Pivot ${arr[i+1]} is now sorted.`, codeLine: 17 });
        return i + 1;
    }

    function quickSort(low: number, high: number) {
        if (low < high) {
            steps.push({ type: 'message', message: `Calling partition on subarray from index ${low} to ${high}.`, codeLine: 2 });
            const pi = partition(low, high);
            steps.push({ type: 'message', message: `Recursively sorting left part: [${low}, ${pi-1}]`, codeLine: 4 });
            quickSort(low, pi - 1);
            steps.push({ type: 'message', message: `Recursively sorting right part: [${pi+1}, ${high}]`, codeLine: 5 });
            quickSort(pi + 1, high);
        }
    }
    
    quickSort(0, arr.length - 1);
    
    steps.push({ type: 'message', message: `Quick Sort complete. Final array: [${arr.join(', ')}]`, codeLine: 7 });
    
    return [steps, arr];
}