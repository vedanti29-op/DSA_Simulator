
import type { TreeNode, VisualizationStep } from '../types';

class BSTNode {
    value: number;
    left: BSTNode | null;
    right: BSTNode | null;
    id: number;

    constructor(value: number) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.id = value; // For simplicity, use value as ID. Assumes unique values.
    }
}

export class BinarySearchTree {
    root: BSTNode | null = null;
    steps: VisualizationStep[] = [];

    clone(): BinarySearchTree {
        const newTree = new BinarySearchTree();
        newTree.root = this._cloneNode(this.root);
        return newTree;
    }

    private _cloneNode(node: BSTNode | null): BSTNode | null {
        if (node === null) return null;
        const newNode = new BSTNode(node.value);
        newNode.id = node.id;
        newNode.left = this._cloneNode(node.left);
        newNode.right = this._cloneNode(node.right);
        return newNode;
    }

    insert(value: number): VisualizationStep[] {
        this.steps = [];
        if (this.root === null) {
             this.root = new BSTNode(value);
             this.steps.push({ type: 'set-root', newNode: this.toPlainObject(this.root), message: `Tree is empty. Setting ${value} as the root.`, codeLine: 2 });
        } else {
            this._insertNode(this.root, value);
        }
        return this.steps;
    }

    private _insertNode(node: BSTNode, value: number): BSTNode {
        this.steps.push({ type: 'compare', nodeId: node.id, message: `Comparing new value ${value} with node ${node.value}.`, codeLine: 1 });

        if (value < node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.left?.id, message: `${value} < ${node.value}, so we go left.`, codeLine: 6});
            if (node.left === null) {
                node.left = new BSTNode(value);
                this.steps.push({ type: 'insert', nodeId: node.id, newNode: this.toPlainObject(node.left), message: `Left child is null. Inserting ${value} here.`, codeLine: 2 });
                return node;
            }
            return this._insertNode(node.left, value);
        } else if (value > node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.right?.id, message: `${value} > ${node.value}, so we go right.`, codeLine: 8});
            if (node.right === null) {
                node.right = new BSTNode(value);
                this.steps.push({ type: 'insert', nodeId: node.id, newNode: this.toPlainObject(node.right), message: `Right child is null. Inserting ${value} here.`, codeLine: 2 });
                return node;
            }
            return this._insertNode(node.right, value);
        }
        // Value already exists
        this.steps.push({ type: 'message', message: `Value ${value} already exists in the tree. No changes made.`, codeLine: 10 });
        return node;
    }

    search(value: number): VisualizationStep[] {
        this.steps = [];
        this._searchNode(this.root, value);
        return this.steps;
    }

    private _searchNode(node: BSTNode | null, value: number): BSTNode | null {
        if (node === null) {
            this.steps.push({ type: 'message', message: `Reached a null node. Value ${value} not found.`, codeLine: 2 });
            return null;
        }

        this.steps.push({ type: 'compare', nodeId: node.id, message: `Comparing target ${value} with node ${node.value}.`, codeLine: 2 });

        if (node.value === value) {
            this.steps.push({ type: 'path', nodeId: node.id, message: `Found ${value}!`, codeLine: 2 });
            return node;
        }

        if (value < node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.left?.id, message: `${value} < ${node.value}, searching left.`, codeLine: 6 });
            return this._searchNode(node.left, value);
        }
        
        this.steps.push({ type: 'traverse', fromId: node.id, toId: node.right?.id, message: `${value} > ${node.value}, searching right.`, codeLine: 10 });
        return this._searchNode(node.right, value);
    }
    
    delete(value: number): VisualizationStep[] {
        this.steps = [];
        this.root = this._deleteNode(this.root, value);
        if(this.steps.length === 0 || this.steps[this.steps.length - 1].type !== 'message') {
            this.steps.push({ type: 'message', message: `Deletion of ${value} complete.`, codeLine: 0 });
        }
        return this.steps;
    }

    private _deleteNode(node: BSTNode | null, value: number): BSTNode | null {
        if (node === null) {
            this.steps.push({ type: 'message', message: `Value ${value} not found for deletion.`, codeLine: 2 });
            return null;
        }
        this.steps.push({ type: 'compare', nodeId: node.id, message: `Searching for ${value} to delete. Current node: ${node.value}.`, codeLine: 1 });

        if (value < node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.left?.id, message: `${value} < ${node.value}, going left.`, codeLine: 4 });
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.right?.id, message: `${value} > ${node.value}, going right.`, codeLine: 6 });
            node.right = this._deleteNode(node.right, value);
        } else { // Found the node
            this.steps.push({ type: 'path', nodeId: node.id, message: `Found node ${value} to delete.`, codeLine: 7 });

            if (node.left === null) {
                this.steps.push({ type: 'delete', nodeId: node.id, message: `Node has no left child. Replaced with right child.`, codeLine: 9 });
                return node.right;
            }
            if (node.right === null) {
                this.steps.push({ type: 'delete', nodeId: node.id, message: `Node has no right child. Replaced with left child.`, codeLine: 11 });
                return node.left;
            }
            
            // Node with two children
            const successor = this._minValueNode(node.right);
            this.steps.push({ type: 'compare', nodeId: successor.id, targetId: node.id, message: `Found inorder successor: ${successor.value}.`, codeLine: 15 });
            this.steps.push({ type: 'replace', nodeId: node.id, replacementValue: successor.value, message: `Replacing ${node.value} with ${successor.value}.`, codeLine: 16 });
            node.value = successor.value;
            node.id = successor.value; // Update ID as well

            this.steps.push({ type: 'message', message: `Now, deleting the original successor node ${successor.value} from the right subtree.`, codeLine: 17 });
            node.right = this._deleteNode(node.right, successor.value);
        }
        return node;
    }

    private _minValueNode(node: BSTNode): BSTNode {
        let current = node;
        this.steps.push({ type: 'compare', nodeId: current.id, message: `Finding minimum value in subtree. Start at ${current.value}.`, codeLine: 15 });
        while (current.left !== null) {
            this.steps.push({ type: 'traverse', fromId: current.id, toId: current.left.id, message: `Going left to find minimum.`, codeLine: 15 });
            current = current.left;
        }
        return current;
    }

    inorderTraversal(): VisualizationStep[] {
        this.steps = [];
        this.steps.push({ type: 'message', message: 'Starting In-order Traversal.', codeLine: 1 });
        this._inorder(this.root);
        this.steps.push({ type: 'message', message: 'In-order Traversal complete.', codeLine: 6 });
        return this.steps;
    }

    private _inorder(node: BSTNode | null) {
        if (node !== null) {
            this.steps.push({ type: 'message', message: `Recursively calling on left child of ${node.value}.`, codeLine: 3 });
            this._inorder(node.left);
            
            this.steps.push({ type: 'visit', nodeId: node.id, message: `Visiting node ${node.value}.`, codeLine: 4 });
            
            this.steps.push({ type: 'message', message: `Recursively calling on right child of ${node.value}.`, codeLine: 5 });
            this._inorder(node.right);
        }
    }

    getTreeData(): TreeNode | null {
        return this.toPlainObject(this.root);
    }

    private toPlainObject(node: BSTNode | null): TreeNode | null {
        if (node === null) return null;
        const plainNode: TreeNode = {
            id: node.id,
            value: node.value,
            children: [],
        };
        const leftChild = this.toPlainObject(node.left);
        const rightChild = this.toPlainObject(node.right);
        if (leftChild) plainNode.children.push(leftChild);
        if (rightChild) plainNode.children.push(rightChild);
        return plainNode;
    }
}
