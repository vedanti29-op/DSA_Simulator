
import type { VisualizationStep } from '../types';
import { Graph } from './graph';

// A simple Priority Queue implementation for Dijkstra
class PriorityQueue {
    private elements: { item: number, priority: number }[] = [];

    enqueue(item: number, priority: number) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue(): number {
        return this.elements.shift()!.item;
    }

    isEmpty(): boolean {
        return this.elements.length === 0;
    }
}


export function generateDijkstraSteps(graph: Graph, startNodeId: number): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const distances: { [nodeId: string]: number | '∞' } = {};
    const prev: { [nodeId: string]: number | null } = {};
    const pq = new PriorityQueue();
    const visited = new Set<number>();

    steps.push({ type: 'message', message: `Starting Dijkstra's Algorithm from node ${startNodeId}.`, codeLine: 1 });

    for (const node of graph.nodes) {
        distances[node] = '∞';
        prev[node] = null;
    }
    distances[startNodeId] = 0;
    
    steps.push({ type: 'update-distances', distances: { ...distances }, message: 'Initialize all distances to infinity, and source to 0.', codeLine: 7 });

    pq.enqueue(startNodeId, 0);

    while (!pq.isEmpty()) {
        const u = pq.dequeue();
        
        if (visited.has(u)) continue;
        visited.add(u);

        steps.push({ type: 'highlight-node', nodeId: u, message: `Visiting node ${u}. Exploring neighbors.`, codeLine: 13, distances: { ...distances } });

        const neighbors = graph.adj.get(u) || [];
        for (const { target: v, weight } of neighbors) {
            steps.push({ type: 'highlight-edge', edge: { source: u, target: v }, message: `Checking edge from ${u} to ${v} with weight ${weight}.`, codeLine: 16, distances: { ...distances } });
            
            const currentDistU = distances[u];
            const currentDistV = distances[v];
            
            if (currentDistU !== '∞' && (currentDistV === '∞' || currentDistU + weight < currentDistV)) {
                const newDist = currentDistU + weight;
                distances[v] = newDist;
                prev[v] = u;
                pq.enqueue(v, newDist);
                steps.push({ type: 'update-distances', distances: { ...distances }, message: `Distance to ${v} updated to ${newDist}.`, codeLine: 19 });
            }
        }
    }
    
    steps.push({ type: 'message', message: "Dijkstra's Algorithm complete. Final distances calculated.", codeLine: 24, distances: { ...distances } });
    return steps;
}

export function generateBellmanFordSteps(graph: Graph, startNodeId: number): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const distances: { [nodeId: string]: number | '∞' } = {};
    const nodeCount = graph.nodes.size;
    
    steps.push({ type: 'message', message: `Starting Bellman-Ford Algorithm from node ${startNodeId}.`, codeLine: 1 });

    for (const node of graph.nodes) {
        distances[node] = '∞';
    }
    distances[startNodeId] = 0;

    steps.push({ type: 'update-distances', distances: { ...distances }, message: 'Initialize all distances to infinity, and source to 0.', codeLine: 6 });

    // Relax edges V-1 times
    for (let i = 0; i < nodeCount - 1; i++) {
        steps.push({ type: 'message', message: `--- Relaxation Pass ${i + 1} ---`, codeLine: 9 });
        for (const { source: u, target: v, weight } of graph.edges) {
            steps.push({ type: 'highlight-edge', edge: { source: u, target: v }, message: `Relaxing edge (${u}, ${v}) with weight ${weight}.`, codeLine: 11 });
            const distU = distances[u];
            const distV = distances[v];
            if (distU !== '∞' && (distV === '∞' || distU + weight < distV)) {
                distances[v] = distU + weight;
                steps.push({ type: 'update-distances', distances: { ...distances }, message: `Distance to ${v} updated to ${distances[v]}.`, codeLine: 12 });
            }
        }
    }

    // Check for negative weight cycles
    steps.push({ type: 'message', message: 'Checking for negative weight cycles...', codeLine: 17 });
    let negativeCycle = false;
    for (const { source: u, target: v, weight } of graph.edges) {
         const distU = distances[u];
         const distV = distances[v];
        if (distU !== '∞' && (distV === '∞' || distU + weight < distV)) {
            negativeCycle = true;
            steps.push({ type: 'highlight-edge', edge: { source: u, target: v }, message: `Negative weight cycle detected at edge (${u}, ${v})!`, codeLine: 20 });
            break;
        }
    }

    if (!negativeCycle) {
        steps.push({ type: 'message', message: 'No negative weight cycles found.', codeLine: 24, distances: { ...distances } });
    }
    
    steps.push({ type: 'message', message: 'Bellman-Ford Algorithm complete.', codeLine: 24, distances: { ...distances } });
    return steps;
}

export function generateDagShortestPathSteps(graph: Graph, startNodeId: number): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const distances: { [nodeId: string]: number | '∞' } = {};
    
    // 1. Topological Sort (using Kahn's algorithm)
    const inDegree = new Map<number, number>();
    graph.nodes.forEach(node => inDegree.set(node, 0));
    graph.edges.forEach(edge => {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const queue: number[] = [];
    graph.nodes.forEach(node => {
        if (inDegree.get(node) === 0) {
            queue.push(node);
        }
    });

    const topoSortedNodes: number[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        topoSortedNodes.push(u);
        const neighbors = graph.adj.get(u) || [];
        for (const { target: v } of neighbors) {
            inDegree.set(v, (inDegree.get(v) || 1) - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        }
    }
    
    if (topoSortedNodes.length !== graph.nodes.size) {
        steps.push({ type: 'message', message: 'Graph is not a DAG! Cannot run algorithm.', codeLine: 1 });
        return steps;
    }

    steps.push({ type: 'message', message: 'Topological sort complete. Order: ' + topoSortedNodes.join(', '), codeLine: 3 });

    // 2. Initialize distances
    for (const node of graph.nodes) {
        distances[node] = '∞';
    }
    distances[startNodeId] = 0;
    steps.push({ type: 'update-distances', distances: { ...distances }, message: 'Initialize distances.', codeLine: 8 });

    // 3. Relax edges according to topological order
    for (const u of topoSortedNodes) {
        steps.push({ type: 'highlight-node', nodeId: u, message: `Processing node ${u} from topological order.`, codeLine: 10 });
        const neighbors = graph.adj.get(u) || [];
        for (const { target: v, weight } of neighbors) {
            steps.push({ type: 'highlight-edge', edge: { source: u, target: v }, message: `Relaxing edge (${u}, ${v}).`, codeLine: 13 });
            const distU = distances[u];
            const distV = distances[v];
            if (distU !== '∞' && (distV === '∞' || distU + weight < distV)) {
                distances[v] = distU + weight;
                steps.push({ type: 'update-distances', distances: { ...distances }, message: `Distance to ${v} updated to ${distances[v]}.`, codeLine: 14 });
            }
        }
    }
    
    steps.push({ type: 'message', message: 'DAG Shortest Path complete.', codeLine: 18, distances: { ...distances } });
    return steps;
}
