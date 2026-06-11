
import type { LinkedListNode, VisualizationStep } from '../types';

class LLNode {
    value: number;
    next: LLNode | null;
    id: number;

    constructor(value: number, id: number) {
        this.value = value;
        this.next = null;
        this.id = id;
    }
}

export class SinglyLinkedList {
    head: LLNode | null = null;
    steps: VisualizationStep[] = [];
    private nextId = 1;

    clone(): SinglyLinkedList {
        const newList = new SinglyLinkedList();
        newList.nextId = this.nextId;
        if (this.head === null) {
            return newList;
        }

        newList.head = new LLNode(this.head.value, this.head.id);
        let currentNew = newList.head;
        let currentOld = this.head.next;

        while (currentOld !== null) {
            currentNew.next = new LLNode(currentOld.value, currentOld.id);
            currentNew = currentNew.next;
            currentOld = currentOld.next;
        }
        
        return newList;
    }

    private toPlainObject(node: LLNode): LinkedListNode {
        return {
            id: node.id,
            value: node.value,
            next: node.next?.id ?? null,
        };
    }
    
    getListData(): LinkedListNode[] {
        const data: LinkedListNode[] = [];
        let current = this.head;
        while (current) {
            data.push(this.toPlainObject(current));
            current = current.next;
        }
        return data;
    }

    insertAtHead(value: number): VisualizationStep[] {
        this.steps = [];
        const newNode = new LLNode(value, this.nextId++);
        this.steps.push({ type: 'message', message: `Creating new node with value ${value}.`, codeLine: 2 });
        this.steps.push({ type: 'll-insert', newNode: this.toPlainObject(newNode), message: `New node ${value} is created.`, codeLine: 2 });
        
        this.steps.push({ type: 'pointer-move', fromId: newNode.id, toId: this.head?.id, message: `Set new node's next to point to current head.`, codeLine: 3 });
        newNode.next = this.head;

        this.steps.push({ type: 'll-set-head', nodeId: newNode.id, message: `Set head to be the new node.`, codeLine: 4 });
        this.head = newNode;

        return this.steps;
    }

    insertAtTail(value: number): VisualizationStep[] {
        this.steps = [];
        const newNode = new LLNode(value, this.nextId++);
        this.steps.push({ type: 'message', message: `Creating new node with value ${value}.`, codeLine: 2 });
        this.steps.push({ type: 'll-insert', newNode: this.toPlainObject(newNode), message: `New node ${value} created.`, codeLine: 2 });
        
        if (this.head === null) {
            this.steps.push({ type: 'll-set-head', nodeId: newNode.id, message: `List is empty. Setting new node as head.`, codeLine: 4 });
            this.head = newNode;
            return this.steps;
        }

        let current = this.head;
        this.steps.push({ type: 'traverse', nodeId: current.id, message: `Starting from head to find the tail.`, codeLine: 8 });
        
        while (current.next !== null) {
            this.steps.push({ type: 'traverse', fromId: current.id, toId: current.next.id, message: `Moving to next node.`, codeLine: 10 });
            current = current.next;
        }
        
        this.steps.push({ type: 'path', nodeId: current.id, message: `Found the tail node: ${current.value}.`, codeLine: 9 });
        this.steps.push({ type: 'pointer-move', fromId: current.id, toId: newNode.id, message: `Set tail's next to point to the new node.`, codeLine: 12 });
        current.next = newNode;
        
        return this.steps;
    }

    delete(value: number): VisualizationStep[] {
        this.steps = [];
        if (this.head === null) {
            this.steps.push({ type: 'message', message: `List is empty. Cannot delete.`, codeLine: 2 });
            return this.steps;
        }

        this.steps.push({ type: 'compare', nodeId: this.head.id, message: `Checking if head node ${this.head.value} is the one to delete.`, codeLine: 4 });
        if (this.head.value === value) {
            const deletedId = this.head.id;
            this.steps.push({ type: 'll-delete', nodeId: deletedId, message: `Head is ${value}. Deleting head.`, codeLine: 5 });
            this.head = this.head.next;
            return this.steps;
        }

        let current = this.head;
        this.steps.push({ type: 'traverse', nodeId: current.id, message: `Starting search from head.`, codeLine: 9 });

        while (current.next !== null && current.next.value !== value) {
            this.steps.push({ type: 'compare', nodeId: current.next.id, message: `Checking next node ${current.next.value}.`, codeLine: 10 });
            this.steps.push({ type: 'traverse', fromId: current.id, toId: current.next.id, message: `Moving to next node.`, codeLine: 11 });
            current = current.next;
        }
        
        if (current.next !== null) {
            this.steps.push({ type: 'compare', nodeId: current.next.id, message: `Found node to delete: ${current.next.value}.`, codeLine: 10 });
            const deletedId = current.next.id;
            this.steps.push({ type: 'pointer-move', fromId: current.id, toId: current.next.next?.id, message: `Bypassing node ${current.next.value} to delete it.`, codeLine: 15 });
            current.next = current.next.next;
            this.steps.push({ type: 'll-delete', nodeId: deletedId, message: `Node ${value} deleted.`, codeLine: 15 });
        } else {
            this.steps.push({ type: 'message', message: `Value ${value} not found in the list.`, codeLine: 14 });
        }

        return this.steps;
    }

    search(value: number): VisualizationStep[] {
        this.steps = [];
        let current = this.head;
        this.steps.push({ type: 'message', message: `Starting search for value ${value}.`, codeLine: 2 });

        while (current !== null) {
            this.steps.push({ type: 'compare', nodeId: current.id, message: `Comparing with node ${current.value}.`, codeLine: 4 });
            if (current.value === value) {
                this.steps.push({ type: 'path', nodeId: current.id, message: `Found ${value}!`, codeLine: 5 });
                return this.steps;
            }
            this.steps.push({ type: 'traverse', fromId: current.id, toId: current.next?.id, message: `Moving to next node.`, codeLine: 7 });
            current = current.next;
        }

        this.steps.push({ type: 'message', message: `Value ${value} not found. Reached end of list.`, codeLine: 9 });
        return this.steps;
    }
}
