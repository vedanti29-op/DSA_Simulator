
import type { GraphNode, GraphEdge, GraphData } from '../types';

export class Graph {
    // Adjacency list: Map<nodeId, Array<{target: nodeId, weight: number}>>
    public adj: Map<number, { target: number, weight: number }[]>;
    public nodes: Set<number>;
    public edges: GraphEdge[];

    constructor() {
        this.adj = new Map();
        this.nodes = new Set();
        this.edges = [];
    }

    clone(): Graph {
        const newGraph = new Graph();
        // Use structuredClone for a deep copy
        newGraph.adj = structuredClone(this.adj);
        newGraph.nodes = structuredClone(this.nodes);
        newGraph.edges = structuredClone(this.edges);
        return newGraph;
    }

    addNode(id: number) {
        if (!this.nodes.has(id)) {
            this.nodes.add(id);
            this.adj.set(id, []);
        }
    }

    addEdge(source: number, target: number, weight: number) {
        this.addNode(source);
        this.addNode(target);
        this.adj.get(source)?.push({ target, weight });
        this.edges.push({ source, target, weight });
    }

    getGraphData(): GraphData {
        const nodes: GraphNode[] = Array.from(this.nodes).map(id => ({ id }));
        return { nodes, edges: this.edges };
    }
}
