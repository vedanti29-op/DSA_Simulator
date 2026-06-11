
import type { VisualizationStep } from '../types';
import { Graph } from './graph';

// Disjoint Set Union for Kruskal's
class DSU {
    private parent: number[];
    constructor(n: number) {
        this.parent = Array.from({ length: n + 1 }, (_, i) => i);
    }
    find(i: number): number {
        if (this.parent[i] === i) return i;
        return this.parent[i] = this.find(this.parent[i]);
    }
    union(i: number, j: number): boolean {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            this.parent[rootI] = rootJ;
            return true;
        }
        return false;
    }
}

// Simple Priority Queue for Prim's
class MinPriorityQueue {
    private elements: { source: number, target: number, weight: number }[] = [];

    add(edge: { source: number, target: number, weight: number }) {
        this.elements.push(edge);
        this.elements.sort((a, b) => a.weight - b.weight);
    }

    poll(): { source: number, target: number, weight: number } {
        return this.elements.shift()!;
    }

    isEmpty(): boolean {
        return this.elements.length === 0;
    }
}

export function generatePrimsSteps(graph: Graph, startNodeId: number): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    if (!graph.nodes.has(startNodeId)) {
        steps.push({ type: 'message', message: `Start node ${startNodeId} not in graph.`, codeLine: 0 });
        return steps;
    }

    const mst: { source: number, target: number }[] = [];
    const visited = new Set<number>([startNodeId]);
    const pq = new MinPriorityQueue();
    
    steps.push({ type: 'message', message: `Starting Prim's Algorithm from node ${startNodeId}.`, codeLine: 1 });
    
    (graph.adj.get(startNodeId) || []).forEach(edge => pq.add({ source: startNodeId, ...edge }));
    steps.push({ type: 'message', message: `Adding all edges from node ${startNodeId} to the priority queue.`, codeLine: 6 });

    while (!pq.isEmpty() && visited.size < graph.nodes.size) {
        const edge = pq.poll();
        steps.push({ type: 'highlight-edge', edge, message: `Extracting min edge (${edge.source}, ${edge.target}) with weight ${edge.weight} from PQ.`, codeLine: 10 });
        
        if (visited.has(edge.target)) {
            steps.push({ type: 'form-cycle', edge, message: `Node ${edge.target} is already in the MST. Skipping to avoid a cycle.`, codeLine: 12 });
            continue;
        }

        visited.add(edge.target);
        mst.push({source: edge.source, target: edge.target});
        steps.push({ type: 'add-to-mst', edge, mstEdges: [...mst], message: `Adding edge (${edge.source}, ${edge.target}) to the MST.`, codeLine: 15 });
        
        (graph.adj.get(edge.target) || []).forEach(neighborEdge => {
            if (!visited.has(neighborEdge.target)) {
                pq.add({ source: edge.target, ...neighborEdge });
            }
        });
        steps.push({ type: 'message', message: `Adding outgoing edges from new node ${edge.target} to PQ.`, codeLine: 18 });
    }
    
    steps.push({ type: 'message', message: `Prim's Algorithm complete.`, mstEdges: [...mst], codeLine: 24 });
    return steps;
}


export function generateKruskalsSteps(graph: Graph): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    const mst: { source: number, target: number }[] = [];
    
    const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
    const maxNodeId = Math.max(0, ...Array.from(graph.nodes));
    const dsu = new DSU(maxNodeId);

    steps.push({ type: 'message', message: `Starting Kruskal's Algorithm. Edges sorted by weight.`, codeLine: 1 });

    for (const edge of sortedEdges) {
        steps.push({ type: 'highlight-edge', edge, message: `Considering edge (${edge.source}, ${edge.target}) with weight ${edge.weight}.`, codeLine: 5 });

        if (dsu.union(edge.source, edge.target)) {
            mst.push({source: edge.source, target: edge.target});
            steps.push({ type: 'add-to-mst', edge, mstEdges: [...mst], message: `Nodes ${edge.source} and ${edge.target} are not connected. Adding edge to MST.`, codeLine: 7 });
        } else {
            steps.push({ type: 'form-cycle', edge, mstEdges: [...mst], message: `Edge (${edge.source}, ${edge.target}) would form a cycle. Skipping.`, codeLine: 6 });
        }
        
        if (mst.length === graph.nodes.size - 1) break;
    }
    
    steps.push({ type: 'message', message: `Kruskal's Algorithm complete.`, mstEdges: [...mst], codeLine: 10 });
    return steps;
}
