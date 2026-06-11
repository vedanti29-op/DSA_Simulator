
import type { TreeNode, VisualizationStep } from '../types';

class AVLNode {
    value: number;
    id: number;
    height: number;
    left: AVLNode | null;
    right: AVLNode | null;

    constructor(value: number) {
        this.value = value;
        this.id = value; // For simplicity, use value as ID. Assumes unique values.
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

export class AVLTree {
    root: AVLNode | null = null;
    steps: VisualizationStep[] = [];

    clone(): AVLTree {
        const newTree = new AVLTree();
        newTree.root = this._cloneNode(this.root);
        return newTree;
    }

    private _cloneNode(node: AVLNode | null): AVLNode | null {
        if (node === null) return null;
        const newNode = new AVLNode(node.value);
        newNode.id = node.id;
        newNode.height = node.height;
        newNode.left = this._cloneNode(node.left);
        newNode.right = this._cloneNode(node.right);
        return newNode;
    }

    private getHeight(node: AVLNode | null): number {
        return node ? node.height : 0;
    }

    private getBalanceFactor(node: AVLNode | null): number {
        if (node === null) return 0;
        return this.getHeight(node.left) - this.getHeight(node.right);
    }
    
    private updateHeight(node: AVLNode) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    private rightRotate(y: AVLNode): AVLNode {
        this.steps.push({ type: 'rotate-right', nodeId: y.id, message: `Performing Right Rotation on node ${y.value}.`, codeLine: 20 });
        const x = y.left!;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);
        this.steps.push({ type: 'update-height', nodeId: y.id, message: `Updated heights after rotation.`, codeLine: 11});
        this.steps.push({ type: 'update-height', nodeId: x.id, message: ``, codeLine: 11});

        return x;
    }

    private leftRotate(x: AVLNode): AVLNode {
        this.steps.push({ type: 'rotate-left', nodeId: x.id, message: `Performing Left Rotation on node ${x.value}.`, codeLine: 18 });
        const y = x.right!;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);
        this.steps.push({ type: 'update-height', nodeId: x.id, message: `Updated heights after rotation.`, codeLine: 11});
        this.steps.push({ type: 'update-height', nodeId: y.id, message: ``, codeLine: 11});


        return y;
    }

    insert(value: number): VisualizationStep[] {
        this.steps = [];
        this.root = this._insertNode(this.root, value);
        return this.steps;
    }

    private _insertNode(node: AVLNode | null, value: number): AVLNode {
        // 1. Standard BST insertion
        if (node === null) {
            this.steps.push({ type: 'insert', nodeId: value, newNode: this.toPlainObject(new AVLNode(value)), message: `Node inserted.`, codeLine: 3 });
            return new AVLNode(value);
        }
        
        this.steps.push({ type: 'compare', nodeId: node.id, message: `Comparing ${value} with ${node.value}.`, codeLine: 4 });

        if (value < node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.left?.id, message: `Going left.`, codeLine: 5 });
            node.left = this._insertNode(node.left, value);
        } else if (value > node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.right?.id, message: `Going right.`, codeLine: 6 });
            node.right = this._insertNode(node.right, value);
        } else {
            this.steps.push({ type: 'message', message: `${value} already exists.`, codeLine: 7 });
            return node;
        }

        // 2. Update height of the current node
        this.updateHeight(node);
        this.steps.push({ type: 'update-height', nodeId: node.id, message: `Updating height of ${node.value} as we backtrack.`, codeLine: 10 });
        
        // 3. Get the balance factor
        const balance = this.getBalanceFactor(node);
        this.steps.push({ type: 'balance-check', nodeId: node.id, message: `Balance factor of ${node.value} is ${balance}.`, codeLine: 13 });
        
        // 4. If unbalanced, perform rotations
        
        // Left Left Case
        if (balance > 1 && value < node.left!.value) {
            this.steps.push({ type: 'message', message: `Tree unbalanced (Left-Left Case).`, codeLine: 16 });
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && value > node.right!.value) {
            this.steps.push({ type: 'message', message: `Tree unbalanced (Right-Right Case).`, codeLine: 18 });
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && value > node.left!.value) {
            this.steps.push({ type: 'message', message: `Tree unbalanced (Left-Right Case).`, codeLine: 20 });
            node.left = this.leftRotate(node.left!);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && value < node.right!.value) {
            this.steps.push({ type: 'message', message: `Tree unbalanced (Right-Left Case).`, codeLine: 25 });
            node.right = this.rightRotate(node.right!);
            return this.leftRotate(node);
        }
        
        return node;
    }
    
    delete(value: number): VisualizationStep[] {
        this.steps = [];
        this.root = this._deleteNode(this.root, value);
        return this.steps;
    }

    private _minValueNode(node: AVLNode): AVLNode {
        let current = node;
        while (current.left !== null) {
            current = current.left;
        }
        return current;
    }

    private _deleteNode(node: AVLNode | null, value: number): AVLNode | null {
         // 1. Standard BST delete
        if (node === null) {
            this.steps.push({ type: 'message', message: `Value ${value} not found.`, codeLine: 3 });
            return node;
        }
        this.steps.push({ type: 'compare', nodeId: node.id, message: `Searching for ${value}, current: ${node.value}.`, codeLine: 4 });

        if (value < node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.left?.id, message: `Going left.`, codeLine: 5 });
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            this.steps.push({ type: 'traverse', fromId: node.id, toId: node.right?.id, message: `Going right.`, codeLine: 6 });
            node.right = this._deleteNode(node.right, value);
        } else {
            this.steps.push({ type: 'path', nodeId: node.id, message: `Found ${value}.`, codeLine: 7 });
            if (node.left === null || node.right === null) {
                const temp = node.left ? node.left : node.right;
                if (temp === null) { // No child
                    node = null;
                } else { // One child
                    node = temp;
                }
            } else {
                const successor = this._minValueNode(node.right);
                this.steps.push({ type: 'replace', nodeId: node.id, replacementValue: successor.value, message: `Replacing with inorder successor ${successor.value}.`, codeLine: 9 });
                node.value = successor.value;
                node.id = successor.id;
                node.right = this._deleteNode(node.right, successor.value);
            }
        }

        if (node === null) return node;

        // 2. Update height
        this.updateHeight(node);
        this.steps.push({ type: 'update-height', nodeId: node.id, message: `Updating height of ${node.value} as we backtrack.`, codeLine: 14 });

        // 3. Get balance factor
        const balance = this.getBalanceFactor(node);
        this.steps.push({ type: 'balance-check', nodeId: node.id, message: `Balance factor of ${node.value} is ${balance}.`, codeLine: 17 });
        
        // 4. Rebalance
        // Left Left Case
        if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
            return this.rightRotate(node);
        }
        // Left Right Case
        if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
            node.left = this.leftRotate(node.left!);
            return this.rightRotate(node);
        }
        // Right Right Case
        if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
            return this.leftRotate(node);
        }
        // Right Left Case
        if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
            node.right = this.rightRotate(node.right!);
            return this.leftRotate(node);
        }

        return node;
    }


    getTreeData(): TreeNode | null {
        return this.toPlainObject(this.root);
    }

    private toPlainObject(node: AVLNode | null): TreeNode | null {
        if (node === null) return null;
        const plainNode: TreeNode = {
            id: node.id,
            value: node.value,
            height: node.height,
            balanceFactor: this.getBalanceFactor(node),
            children: [],
        };
        const leftChild = this.toPlainObject(node.left);
        const rightChild = this.toPlainObject(node.right);
        if (leftChild) plainNode.children.push(leftChild);
        if (rightChild) plainNode.children.push(rightChild);
        return plainNode;
    }
}
