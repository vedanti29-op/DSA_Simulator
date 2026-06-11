
export interface TreeNode {
  id: number;
  value: number;
  children: TreeNode[];
  x?: number;
  y?: number;
  height?: number;
  balanceFactor?: number;
}

export interface GridNode {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isWall: boolean;
}

export interface LinkedListNode {
    id: number;
    value: number;
    next: number | null;
}

export interface QueueElement {
    id: number;
    value: number;
}

export interface StackElement {
    id: number;
    value: number;
}

export interface HashTableEntry {
    id: string; // key
    key: string;
    value: number;
}

export interface GraphNode {
  id: number;
}

export interface GraphEdge {
  source: number;
  target: number;
  weight: number;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface RecursionGraphData {
    nodes: { id: string; label: string; returnValue?: number }[];
    links: { source: string; target: string; isMemo?: boolean }[];
}


export type ConceptType = 'bst' | 'avl' | 'sorting' | 'pathfinding' | 'linked-list' | 'queue' | 'hash-table' | 'stack' | 'sssp' | 'recursion' | 'mst';

export type OperationType = 
  // BST / AVL
  'insert' | 'search' | 'delete' | 'inorder' | 
  'avl-insert' | 'avl-delete' |
  // Sorting
  'bubbleSort' | 'selectionSort' | 'insertionSort' | 'quickSort' |
  // Pathfinding
  'bfs' | 'dfs' |
  // Linked List
  'll-insert-head' | 'll-insert-tail' | 'll-delete' | 'll-search' |
  // Queue
  'q-enqueue' | 'q-dequeue' | 'q-peek' |
  // Hash Table
  'ht-insert' | 'ht-search' | 'ht-delete' |
  // Stack
  's-push' | 's-pop' | 's-peek' |
  // SSSP
  'dijkstra' | 'bellmanFord' | 'dagShortestPath' |
  // Recursion
  'fibonacci' | 'fibonacci-memoized' |
  // MST
  'prims' | 'kruskals' |
  // General
  'none';

export interface VisualizationStep {
  type: 'compare' | 'traverse' | 'insert' | 'delete' | 'replace' | 'set-root' | 'message' | 'path' | 'swap' | 'sorted-boundary' | 'visit' | 'enqueue' | 'dequeue' | 'mark-path' | 'push' | 'pop' | 'set-pivot' | 'partition-boundary' |
  // Linked List specific
  'pointer-move' | 'll-insert' | 'll-delete' | 'll-set-head' |
  // Queue/Stack specific
  'peek' |
  // Hash Table specific
  'hash-calculate' | 'bucket-lookup' | 'chain-traverse' | 'ht-insert' | 'ht-delete' | 'ht-update' |
  // SSSP specific
  'highlight-node' | 'highlight-edge' | 'update-distances' |
  // Recursion specific
  'recursive-call' | 'recursive-return' | 'memo-hit' |
  // MST specific
  'add-to-mst' | 'form-cycle' | 'select-edge' | // Re-using highlight-edge for considering edges
  // AVL Tree specific
  'update-height' | 'balance-check' | 'rotate-left' | 'rotate-right';
  
  // For BST / AVL
  nodeId?: number | string;
  targetId?: number;
  fromId?: number | string;
  toId?: number | string | null;
  newNode?: TreeNode | LinkedListNode | QueueElement | HashTableEntry | StackElement;
  replacementValue?: number;
  
  // For Sorting
  indices?: (number | undefined)[];
  boundary?: number;
  pivotIndex?: number;
  arrayState?: number[];

  // For Pathfinding
  cell?: [number, number];
  
  // For Hash Table
  bucketIndex?: number;
  key?: string;
  value?: number;
  chainNodeId?: string; // key as id
  visitedChainNodeIds?: string[];
  
  // For SSSP, MST
  edge?: { source: number; target: number };
  distances?: { [nodeId: string]: number | '∞' };
  finalPath?: number[];
  mstEdges?: { source: number, target: number }[];

  // For Recursion
  nodeLabel?: string;
  returnValue?: number;

  message: string;
  codeLine: number;
}