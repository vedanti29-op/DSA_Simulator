
import type { VisualizationStep, GridNode } from '../types';

export function generateBfsSteps(grid: GridNode[][], start: [number, number], end: [number, number]): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const rows = grid.length;
    const cols = grid[0].length;
    
    const queue: [number, number][] = [start];
    const visited = new Set<string>([`${start[0]},${start[1]}`]);
    const parentMap = new Map<string, [number, number]>();

    steps.push({ type: 'message', message: 'Starting Breadth-First Search (BFS).', codeLine: 1 });
    steps.push({ type: 'enqueue', cell: start, message: `Adding start node (${start[0]}, ${start[1]}) to the queue.`, codeLine: 2 });

    let pathFound = false;

    while (queue.length > 0) {
        const [row, col] = queue.shift()!;
        steps.push({ type: 'dequeue', cell: [row, col], message: `Dequeued node (${row}, ${col}). Exploring its neighbors.`, codeLine: 7 });

        if (row === end[0] && col === end[1]) {
            pathFound = true;
            steps.push({ type: 'message', message: `End node (${row}, ${col}) found! Reconstructing path.`, codeLine: 9 });
            break;
        }

        const neighbors = [
            [row - 1, col], // Up
            [row + 1, col], // Down
            [row, col - 1], // Left
            [row, col + 1], // Right
        ];

        for (const [nRow, nCol] of neighbors) {
            const neighborKey = `${nRow},${nCol}`;
            if (
                nRow >= 0 && nRow < rows &&
                nCol >= 0 && nCol < cols &&
                !grid[nRow][nCol].isWall &&
                !visited.has(neighborKey)
            ) {
                visited.add(neighborKey);
                parentMap.set(neighborKey, [row, col]);
                queue.push([nRow, nCol]);
                steps.push({ type: 'enqueue', cell: [nRow, nCol], message: `Visiting and enqueuing neighbor (${nRow}, ${nCol}).`, codeLine: 15 });
            }
        }
    }

    if (pathFound) {
        let current = end;
        const path: [number, number][] = [];
        while (current) {
            path.unshift(current);
            const key = `${current[0]},${current[1]}`;
            current = parentMap.get(key)!;
        }
        
        for(const cell of path) {
             steps.push({ type: 'mark-path', cell, message: `Marking (${cell[0]}, ${cell[1]}) as part of the shortest path.`, codeLine: 9 });
        }
    } else {
        steps.push({ type: 'message', message: 'No path found to the end node.', codeLine: 18 });
    }
    
    steps.push({ type: 'message', message: 'BFS Complete.', codeLine: 19 });

    return steps;
}

export function generateDfsSteps(grid: GridNode[][], start: [number, number], end: [number, number]): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const rows = grid.length;
    const cols = grid[0].length;

    const stack: [number, number][] = [start];
    const visited = new Set<string>();
    const parentMap = new Map<string, [number, number]>();

    steps.push({ type: 'message', message: 'Starting Depth-First Search (DFS).', codeLine: 1 });
    steps.push({ type: 'push', cell: start, message: `Pushing start node (${start[0]}, ${start[1]}) onto the stack.`, codeLine: 2 });
    
    let pathFound = false;

    while (stack.length > 0) {
        const [row, col] = stack.pop()!;
        const key = `${row},${col}`;

        if(visited.has(key)) {
            steps.push({ type: 'message', message: `Node (${row}, ${col}) already visited. Skipping.`, codeLine: 7 });
            continue;
        }
        
        visited.add(key);
        steps.push({ type: 'pop', cell: [row, col], message: `Popped node (${row}, ${col}). Marking as visited.`, codeLine: 5 });

        if (row === end[0] && col === end[1]) {
            pathFound = true;
            steps.push({ type: 'message', message: `End node (${row}, ${col}) found!`, codeLine: 11 });
            break;
        }

        const neighbors = [
            [row + 1, col], // Down
            [row, col + 1], // Right
            [row - 1, col], // Up
            [row, col - 1], // Left
        ];

        for (const [nRow, nCol] of neighbors) {
            const neighborKey = `${nRow},${nCol}`;
            if (
                nRow >= 0 && nRow < rows &&
                nCol >= 0 && nCol < cols &&
                !grid[nRow][nCol].isWall &&
                !visited.has(neighborKey)
            ) {
                parentMap.set(neighborKey, [row, col]);
                stack.push([nRow, nCol]);
                steps.push({ type: 'push', cell: [nRow, nCol], message: `Pushing neighbor (${nRow}, ${nCol}) onto the stack.`, codeLine: 15 });
            }
        }
    }

     if (pathFound) {
        let current = end;
        const path: [number, number][] = [];
        while (current) {
            path.unshift(current);
            const key = `${current[0]},${current[1]}`;
            current = parentMap.get(key)!;
        }
        for(const cell of path) {
             steps.push({ type: 'mark-path', cell, message: `Marking (${cell[0]}, ${cell[1]}) as part of the path.`, codeLine: 11 });
        }
    } else {
        steps.push({ type: 'message', message: 'No path found to the end node.', codeLine: 18 });
    }

    steps.push({ type: 'message', message: 'DFS Complete.', codeLine: 19 });

    return steps;
}
