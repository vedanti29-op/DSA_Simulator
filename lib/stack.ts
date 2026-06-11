
import type { StackElement, VisualizationStep } from '../types';

export class Stack {
    private items: StackElement[] = [];
    private steps: VisualizationStep[] = [];
    private nextId = 1;

    clone(): Stack {
        const newStack = new Stack();
        newStack.items = structuredClone(this.items);
        newStack.nextId = this.nextId;
        return newStack;
    }

    getStackData(): StackElement[] {
        return [...this.items];
    }

    clear() {
        this.items = [];
        this.steps = [];
        this.nextId = 1;
    }

    push(value: number): VisualizationStep[] {
        this.steps = [];
        const newElement: StackElement = { value, id: this.nextId++ };

        this.steps.push({
            type: 'message',
            message: `Creating new element with value ${value}.`,
            codeLine: 3
        });

        this.items.push(newElement);

        this.steps.push({
            type: 'push',
            newNode: newElement,
            message: `Pushing ${value} onto the top of the stack.`,
            codeLine: 4
        });

        return this.steps;
    }

    pop(): VisualizationStep[] {
        this.steps = [];
        if (this.items.length === 0) {
            this.steps.push({ type: 'message', message: `Stack is empty. Cannot pop.`, codeLine: 4 });
            return this.steps;
        }

        const poppedElement = this.items[this.items.length - 1];
        this.steps.push({
            type: 'peek',
            nodeId: poppedElement.id,
            message: `About to pop ${poppedElement.value} from the top.`,
            codeLine: 7
        });

        this.items.pop();

        this.steps.push({
            type: 'pop',
            nodeId: poppedElement.id,
            message: `Element ${poppedElement.value} has been popped.`,
            codeLine: 7
        });

        return this.steps;
    }

    peek(): VisualizationStep[] {
        this.steps = [];
        if (this.items.length === 0) {
            this.steps.push({ type: 'message', message: `Stack is empty. Cannot peek.`, codeLine: 4 });
            return this.steps;
        }

        const topElement = this.items[this.items.length - 1];
        this.steps.push({
            type: 'peek',
            nodeId: topElement.id,
            message: `Peeking at the top element: ${topElement.value}.`,
            codeLine: 7
        });

        return this.steps;
    }
}
