
import type { QueueElement, VisualizationStep } from '../types';

export class Queue {
    private items: QueueElement[] = [];
    private steps: VisualizationStep[] = [];
    private nextId = 1;

    clone(): Queue {
        const newQueue = new Queue();
        newQueue.items = structuredClone(this.items);
        newQueue.nextId = this.nextId;
        return newQueue;
    }

    getQueueData(): QueueElement[] {
        return [...this.items];
    }

    clear() {
        this.items = [];
        this.steps = [];
        this.nextId = 1;
    }

    enqueue(value: number): VisualizationStep[] {
        this.steps = [];
        const newElement: QueueElement = { value, id: this.nextId++ };

        this.steps.push({ 
            type: 'message', 
            message: `Creating new element with value ${value}.`, 
            codeLine: 3 
        });
        
        this.items.push(newElement);
        
        this.steps.push({ 
            type: 'enqueue', 
            newNode: newElement, 
            message: `Adding ${value} to the rear of the queue.`, 
            codeLine: 4 
        });

        return this.steps;
    }

    dequeue(): VisualizationStep[] {
        this.steps = [];
        if (this.items.length === 0) {
            this.steps.push({ type: 'message', message: `Queue is empty. Cannot dequeue.`, codeLine: 4 });
            return this.steps;
        }

        const dequeuedElement = this.items[0];
        this.steps.push({ 
            type: 'peek', 
            nodeId: dequeuedElement.id, 
            message: `About to remove ${dequeuedElement.value} from the front.`, 
            codeLine: 7 
        });

        this.items.shift();

        this.steps.push({
            type: 'dequeue',
            nodeId: dequeuedElement.id,
            message: `Element ${dequeuedElement.value} has been removed.`,
            codeLine: 7
        });
        
        return this.steps;
    }

    peek(): VisualizationStep[] {
        this.steps = [];
        if (this.items.length === 0) {
            this.steps.push({ type: 'message', message: `Queue is empty. Cannot peek.`, codeLine: 4 });
            return this.steps;
        }

        const frontElement = this.items[0];
        this.steps.push({ 
            type: 'peek', 
            nodeId: frontElement.id, 
            message: `Peeking at the front element: ${frontElement.value}.`, 
            codeLine: 7 
        });
        
        return this.steps;
    }
}
