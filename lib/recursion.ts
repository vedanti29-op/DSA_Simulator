
import type { VisualizationStep, RecursionGraphData } from '../types';

interface RecursionNode {
    id: string; // e.g., "fib-5-call1"
    label: string; // e.g., "fib(5)"
    value: number;
    returnValue?: number;
    children: RecursionNode[];
}

let callCounter = 0;

function buildFibonacciTree(n: number, steps: VisualizationStep[], memo: { [key: number]: number } = {}, isMemoized = false): { node: RecursionNode, returnValue: number } {
    const callId = `fib-${n}-${callCounter++}`;
    const node: RecursionNode = { id: callId, label: `fib(${n})`, value: n, children: [] };
    
    steps.push({ type: 'recursive-call', nodeId: node.id, nodeLabel: node.label, message: `Calling fib(${n}).`, codeLine: 2 });
    
    if (isMemoized && memo[n] !== undefined) {
        steps.push({ type: 'memo-hit', nodeId: node.id, nodeLabel: node.label, returnValue: memo[n], message: `fib(${n}) found in memo. Returning ${memo[n]}.`, codeLine: 3 });
        return { node, returnValue: memo[n] };
    }

    if (n <= 1) {
        steps.push({ type: 'recursive-return', nodeId: node.id, nodeLabel: node.label, returnValue: n, message: `Base case: fib(${n}) returns ${n}.`, codeLine: isMemoized ? 6 : 3 });
        if (isMemoized) memo[n] = n;
        return { node, returnValue: n };
    }

    steps.push({ type: 'message', message: `Calculating fib(${n-1}) + fib(${n-2})`, codeLine: isMemoized ? 9 : 6 });
    const leftResult = buildFibonacciTree(n - 1, steps, memo, isMemoized);
    node.children.push(leftResult.node);

    const rightResult = buildFibonacciTree(n - 2, steps, memo, isMemoized);
    node.children.push(rightResult.node);

    const result = leftResult.returnValue + rightResult.returnValue;
    if (isMemoized) memo[n] = result;
    
    steps.push({ type: 'recursive-return', nodeId: node.id, nodeLabel: node.label, returnValue: result, message: `fib(${n}) returns ${leftResult.returnValue} + ${rightResult.returnValue} = ${result}.`, codeLine: isMemoized ? 11 : 8 });
    
    return { node, returnValue: result };
}

function treeToGraphData(root: RecursionNode, isMemoized = false): RecursionGraphData {
    const graph: RecursionGraphData = { nodes: [], links: [] };
    const processedNodes = new Map<string, { id: string, label: string }>();

    function traverse(node: RecursionNode) {
        let nodeId = node.id;
        
        graph.nodes.push({ id: nodeId, label: node.label });
        
        for (const child of node.children) {
            const childId = traverse(child);
            graph.links.push({ source: nodeId, target: childId });
        }
        return nodeId;
    }
    
    if (isMemoized) {
        const memoNodes = new Map<string, {id: string, label: string}>();
        const links = new Set<string>();

        function buildMemoGraph(node: RecursionNode) {
            const nodeId = node.label; // Use label as ID for memoized to merge nodes
            if(!memoNodes.has(nodeId)) {
                memoNodes.set(nodeId, {id: nodeId, label: node.label});
            }

            for(const child of node.children) {
                const childId = child.label;
                const linkKey = `${nodeId}->${childId}`;
                if(!links.has(linkKey)) {
                    links.add(linkKey);
                    graph.links.push({source: nodeId, target: childId});
                }
                buildMemoGraph(child);
            }
        }
        buildMemoGraph(root);
        graph.nodes = Array.from(memoNodes.values());

    } else {
        traverse(root);
    }
    
    return graph;
}


export function generateFibonacciSteps(n: number): [VisualizationStep[], RecursionGraphData] {
    callCounter = 0;
    const steps: VisualizationStep[] = [];
    const { node: treeRoot } = buildFibonacciTree(n, steps, {}, false);
    const graphData = treeToGraphData(treeRoot, false);
    return [steps, graphData];
}

export function generateFibonacciMemoizedSteps(n: number): [VisualizationStep[], RecursionGraphData] {
    callCounter = 0;
    const steps: VisualizationStep[] = [];
    const memo: { [key: number]: number } = {};
    const { node: treeRoot } = buildFibonacciTree(n, steps, memo, true);
    const graphData = treeToGraphData(treeRoot, true);
    
    return [steps, graphData];
}
