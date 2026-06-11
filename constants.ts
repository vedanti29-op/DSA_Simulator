
export const NODE_RADIUS = 20;

export const ANIMATION_SPEEDS: { [key: string]: number } = {
  'Slow': 1000,
  'Medium': 500,
  'Fast': 200,
};

// --- BST ---
export const INSERT_CODE = `
function insert(node, value) {
  if (node === null) {
    return new TreeNode(value);
  }

  if (value < node.value) {
    node.left = insert(node.left, value);
  } else if (value > node.value) {
    node.right = insert(node.right, value);
  }

  return node;
}
`;

export const SEARCH_CODE = `
function search(node, value) {
  if (node === null || node.value === value) {
    return node;
  }

  if (value < node.value) {
    return search(node.left, value);
  }
  
  return search(node.right, value);
}
`;

export const DELETE_CODE = `
function deleteNode(root, value) {
  if (root === null) return root;

  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    if (root.left === null) {
      return root.right;
    } else if (root.right === null) {
      return root.left;
    }
    
    let successor = minValueNode(root.right);
    root.value = successor.value;
    root.right = deleteNode(root.right, successor.value);
  }
  return root;
}
`;

export const INORDER_CODE = `
function inorderTraversal(node) {
  if (node !== null) {
    inorderTraversal(node.left);
    visit(node);
    inorderTraversal(node.right);
  }
}
`;

// --- AVL Tree ---
export const AVL_INSERT_CODE = `
function insert(node, value) {
  // 1. Standard BST insertion
  if (node === null) return new Node(value);
  if (value < node.value) node.left = insert(node.left, value);
  else if (value > node.value) node.right = insert(node.right, value);
  else return node; // Duplicate values not allowed

  // 2. Update height of the ancestor node
  node.height = 1 + max(getHeight(node.left), getHeight(node.right));

  // 3. Get the balance factor
  let balance = getBalance(node);

  // 4. If unbalanced, perform rotations
  // LL Case
  if (balance > 1 && value < node.left.value) return rightRotate(node);
  // RR Case
  if (balance < -1 && value > node.right.value) return leftRotate(node);
  // LR Case
  if (balance > 1 && value > node.left.value) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }
  // RL Case
  if (balance < -1 && value < node.right.value) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }

  // Return the (possibly new) node pointer
  return node;
}
`;

export const AVL_DELETE_CODE = `
function deleteNode(root, value) {
  // 1. Standard BST delete
  if (root === null) return root;
  if (value < root.value) root.left = deleteNode(root.left, value);
  else if (value > root.value) root.right = deleteNode(root.right, value);
  else {
    // ... standard BST deletion logic for 0, 1, or 2 children
  }
  
  if (root == null) return root;

  // 2. Update height
  root.height = 1 + max(getHeight(root.left), getHeight(root.right));

  // 3. Get balance factor
  let balance = getBalance(root);
  
  // 4. If unbalanced, perform rotations
  // LL Case
  if (balance > 1 && getBalance(root.left) >= 0) return rightRotate(root);
  // LR Case
  if (balance > 1 && getBalance(root.left) < 0) {
      root.left = leftRotate(root.left);
      return rightRotate(root);
  }
  // RR Case
  if (balance < -1 && getBalance(root.right) <= 0) return leftRotate(root);
  // RL Case
  if (balance < -1 && getBalance(root.right) > 0) {
      root.right = rightRotate(root.right);
      return leftRotate(root);
  }

  return root;
}
`;

// --- Sorting ---
export const BUBBLE_SORT_CODE = `
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
  }
  return arr;
}
`;

export const SELECTION_SORT_CODE = `
function selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}
`;

export const INSERTION_SORT_CODE = `
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}
`;

export const QUICK_SORT_CODE = `
function quickSort(arr, low, high) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}
function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
  return i + 1;
}
`;


// --- Pathfinding ---
export const BFS_CODE = `
function bfs(grid, startNode, endNode) {
  let queue = [startNode];
  let visited = new Set();
  visited.add(startNode);

  while (queue.length > 0) {
    let currentNode = queue.shift();

    if (currentNode === endNode) {
      return "Path found!";
    }

    for (let neighbor of getNeighbors(currentNode)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return "No path found.";
}
`;

export const DFS_CODE = `
function dfs(grid, startNode, endNode) {
  let stack = [startNode];
  let visited = new Set();
  
  while (stack.length > 0) {
    let currentNode = stack.pop();

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    if (currentNode === endNode) {
      return "Path found!";
    }

    for (let neighbor of getNeighbors(currentNode)) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  return "No path found.";
}
`;

// --- Linked List ---
export const LL_INSERT_HEAD_CODE = `
function insertAtHead(value) {
  let newNode = new Node(value);
  newNode.next = this.head;
  this.head = newNode;
}
`;

export const LL_INSERT_TAIL_CODE = `
function insertAtTail(value) {
  let newNode = new Node(value);
  if (this.head === null) {
    this.head = newNode;
    return;
  }
  let current = this.head;
  while (current.next !== null) {
    current = current.next;
  }
  current.next = newNode;
}
`;

export const LL_DELETE_CODE = `
function delete(value) {
  if (this.head === null) return;

  if (this.head.value === value) {
    this.head = this.head.next;
    return;
  }

  let current = this.head;
  while (current.next !== null && current.next.value !== value) {
    current = current.next;
  }

  if (current.next !== null) {
    current.next = current.next.next;
  }
}
`;

export const LL_SEARCH_CODE = `
function search(value) {
  let current = this.head;
  while (current !== null) {
    if (current.value === value) {
      return current; // Found
    }
    current = current.next;
  }
  return null; // Not found
}
`;

// --- Queue ---
export const QUEUE_ENQUEUE_CODE = `
class Queue {
  enqueue(element) {
    // Adds an element to the back of the queue
    this.items.push(element);
  }
}
`;

export const QUEUE_DEQUEUE_CODE = `
class Queue {
  dequeue() {
    // Removes the element from the front of the queue
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.shift();
  }
}
`;

export const QUEUE_PEEK_CODE = `
class Queue {
  peek() {
    // Returns the front element without removing it
    if (this.isEmpty()) {
      return "No elements in Queue";
    }
    return this.items[0];
  }
}
`;

// --- Hash Table ---
export const HT_INSERT_CODE = `
function insert(key, value) {
  let index = hash(key);
  let bucket = this.table[index];

  for (let i = 0; i < bucket.length; i++) {
    if (bucket[i].key === key) {
      bucket[i].value = value; // Update
      return;
    }
  }

  bucket.push({ key, value });
}
`;

export const HT_SEARCH_CODE = `
function search(key) {
  let index = hash(key);
  let bucket = this.table[index];

  for (let i = 0; i < bucket.length; i++) {
    if (bucket[i].key === key) {
      return bucket[i].value; // Found
    }
  }

  return null; // Not found
}
`;

export const HT_DELETE_CODE = `
function delete(key) {
  let index = hash(key);
  let bucket = this.table[index];

  for (let i = 0; i < bucket.length; i++) {
    if (bucket[i].key === key) {
      bucket.splice(i, 1); // Remove
      return;
    }
  }
}
`;

// --- Stack ---
export const STACK_PUSH_CODE = `
class Stack {
  push(element) {
    // Adds an element to the top of the stack
    this.items.push(element);
  }
}
`;

export const STACK_POP_CODE = `
class Stack {
  pop() {
    // Removes the element from the top of the stack
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.pop();
  }
}
`;

export const STACK_PEEK_CODE = `
class Stack {
  peek() {
    // Returns the top element without removing it
    if (this.isEmpty()) {
      return "No elements in Stack";
    }
    return this.items[this.items.length - 1];
  }
}
`;

// --- SSSP ---
export const DIJKSTRA_CODE = `
function dijkstra(graph, startNode) {
  let distances = {};
  let pq = new PriorityQueue();
  
  // Initialize distances and PQ
  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;
  pq.enqueue(startNode, 0);

  while (!pq.isEmpty()) {
    let { element: u } = pq.dequeue();
    
    graph[u].forEach(neighbor => {
      let { node: v, weight } = neighbor;
      let newDist = distances[u] + weight;

      if (newDist < distances[v]) {
        distances[v] = newDist;
        pq.enqueue(v, newDist);
      }
    });
  }
  return distances;
}
`;

export const BELLMAN_FORD_CODE = `
function bellmanFord(graph, startNode) {
  let distances = {};
  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  // Relax edges |V| - 1 times
  for (let i = 0; i < graph.nodes.length - 1; i++) {
    for (let edge of graph.edges) {
      let { u, v, weight } = edge;
      if (distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
      }
    }
  }

  // Check for negative weight cycles
  for (let edge of graph.edges) {
    let { u, v, weight } = edge;
    if (distances[u] + weight < distances[v]) {
      return "Graph contains a negative weight cycle";
    }
  }

  return distances;
}
`;

export const DAG_SHORTEST_PATH_CODE = `
function dagShortestPath(graph, startNode) {
  let distances = {};
  let topoSortedNodes = topologicalSort(graph);

  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  for (let u of topoSortedNodes) {
    if (distances[u] !== Infinity) {
      graph[u].forEach(neighbor => {
        let { node: v, weight } = neighbor;
        if (distances[u] + weight < distances[v]) {
          distances[v] = distances[u] + weight;
        }
      });
    }
  }
  
  return distances;
}
`;

// --- Recursion / DP ---
export const FIBONACCI_CODE = `
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }

  // Recursive calls
  let fib_n_1 = fibonacci(n - 1);
  let fib_n_2 = fibonacci(n - 2);
  
  return fib_n_1 + fib_n_2;
}
`;

export const FIBONACCI_MEMOIZED_CODE = `
function fibonacci(n, memo = {}) {
  if (n in memo) {
    return memo[n];
  }
  if (n <= 1) {
    return n;
  }

  // Recursive calls
  let fib_n_1 = fibonacci(n - 1, memo);
  let fib_n_2 = fibonacci(n - 2, memo);
  
  memo[n] = fib_n_1 + fib_n_2;
  return memo[n];
}
`;

// --- MST ---
export const PRIMS_CODE = `
function prim(graph, startNode) {
  const mst = [];
  const visited = new Set([startNode]);
  const pq = new PriorityQueue();

  // Add all edges from the start node to the priority queue
  graph.getEdges(startNode).forEach(edge => pq.add(edge));

  while (!pq.isEmpty() && visited.size < graph.nodeCount) {
    const edge = pq.poll(); // Get the edge with the minimum weight

    if (visited.has(edge.to)) {
      continue; // Skip if it creates a cycle
    }

    visited.add(edge.to);
    mst.push(edge);

    // Add all edges from the newly visited node
    graph.getEdges(edge.to).forEach(nextEdge => {
      if (!visited.has(nextEdge.to)) {
        pq.add(nextEdge);
      }
    });
  }
  return mst;
}
`;

export const KRUSKALS_CODE = `
function kruskals(graph) {
  const mst = [];
  // Sort all edges by weight in ascending order
  const sortedEdges = graph.edges.sort((a, b) => a.weight - b.weight);
  const dsu = new DSU(graph.nodeCount);

  for (const edge of sortedEdges) {
    // If the two nodes of the edge are not already connected
    if (dsu.union(edge.from, edge.to)) {
      mst.push(edge);
    }
  }
  return mst;
}
`;