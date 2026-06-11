
import type { HashTableEntry, VisualizationStep } from '../types';

export class HashTable {
    private table: HashTableEntry[][];
    private size: number;
    steps: VisualizationStep[] = [];

    constructor(size = 10) {
        this.size = size;
        this.table = Array(size).fill(null).map(() => []);
    }

    clone(): HashTable {
        const newHashTable = new HashTable(this.size);
        newHashTable.table = structuredClone(this.table);
        return newHashTable;
    }

    clear() {
        this.table = Array(this.size).fill(null).map(() => []);
    }

    private hash(key: string): number {
        let hashValue = 0;
        for (let i = 0; i < key.length; i++) {
            hashValue = (hashValue + key.charCodeAt(i) * (i + 1)) % this.size;
        }
        return hashValue;
    }

    getTableData(): HashTableEntry[][] {
        // Return a deep copy to avoid mutation issues
        return JSON.parse(JSON.stringify(this.table));
    }
    
    insert(key: string, value: number): VisualizationStep[] {
        this.steps = [];
        if (!key) {
            this.steps.push({ type: 'message', message: `Key cannot be empty.`, codeLine: 0});
            return this.steps;
        }

        const index = this.hash(key);
        this.steps.push({ type: 'hash-calculate', key, bucketIndex: index, message: `Hashing key "${key}"... Result index: ${index}.`, codeLine: 2 });
        
        const bucket = this.table[index];
        this.steps.push({ type: 'bucket-lookup', bucketIndex: index, message: `Accessing bucket at index ${index}.`, codeLine: 3 });

        const visitedInThisChain: string[] = [];
        for (let i = 0; i < bucket.length; i++) {
            this.steps.push({ type: 'chain-traverse', bucketIndex: index, chainNodeId: bucket[i].id, visitedChainNodeIds: [...visitedInThisChain], message: `Checking chain. Is key "${bucket[i].key}" equal to "${key}"?`, codeLine: 6 });
            if (bucket[i].key === key) {
                const oldValue = bucket[i].value;
                bucket[i].value = value;
                this.steps.push({ type: 'ht-update', bucketIndex: index, key, value, chainNodeId: bucket[i].id, message: `Key "${key}" already exists. Updating value from ${oldValue} to ${value}.`, codeLine: 7 });
                return this.steps;
            }
            visitedInThisChain.push(bucket[i].id);
        }
        
        const newEntry: HashTableEntry = { id: key, key, value };
        bucket.push(newEntry);
        this.steps.push({ type: 'ht-insert', bucketIndex: index, newNode: newEntry, message: `Key "${key}" not found in chain. Inserting new entry.`, codeLine: 12 });
        
        return this.steps;
    }

    search(key: string): VisualizationStep[] {
        this.steps = [];
        if (!key) {
            this.steps.push({ type: 'message', message: `Key cannot be empty.`, codeLine: 0});
            return this.steps;
        }
        
        const index = this.hash(key);
        this.steps.push({ type: 'hash-calculate', key, bucketIndex: index, message: `Hashing key "${key}"... Result index: ${index}.`, codeLine: 2 });
        
        const bucket = this.table[index];
        this.steps.push({ type: 'bucket-lookup', bucketIndex: index, message: `Accessing bucket at index ${index}.`, codeLine: 3 });

        const visitedInThisChain: string[] = [];
        for (let i = 0; i < bucket.length; i++) {
            this.steps.push({ type: 'chain-traverse', bucketIndex: index, chainNodeId: bucket[i].id, visitedChainNodeIds: [...visitedInThisChain], message: `Checking chain. Is key "${bucket[i].key}" equal to "${key}"?`, codeLine: 6 });
            if (bucket[i].key === key) {
                this.steps.push({ type: 'path', bucketIndex: index, chainNodeId: bucket[i].id, message: `Found key "${key}" with value ${bucket[i].value}.`, codeLine: 7 });
                return this.steps;
            }
            visitedInThisChain.push(bucket[i].id);
        }

        this.steps.push({ type: 'message', message: `Key "${key}" not found in the hash table.`, codeLine: 11 });
        return this.steps;
    }

    delete(key: string): VisualizationStep[] {
        this.steps = [];
        if (!key) {
            this.steps.push({ type: 'message', message: `Key cannot be empty.`, codeLine: 0});
            return this.steps;
        }

        const index = this.hash(key);
        this.steps.push({ type: 'hash-calculate', key, bucketIndex: index, message: `Hashing key "${key}"... Result index: ${index}.`, codeLine: 2 });

        const bucket = this.table[index];
        this.steps.push({ type: 'bucket-lookup', bucketIndex: index, message: `Accessing bucket at index ${index}.`, codeLine: 3 });

        const visitedInThisChain: string[] = [];
        for (let i = 0; i < bucket.length; i++) {
            this.steps.push({ type: 'chain-traverse', bucketIndex: index, chainNodeId: bucket[i].id, visitedChainNodeIds: [...visitedInThisChain], message: `Checking chain. Is key "${bucket[i].key}" equal to "${key}"?`, codeLine: 6 });
            if (bucket[i].key === key) {
                const deletedEntry = bucket[i];
                this.steps.push({ type: 'ht-delete', bucketIndex: index, chainNodeId: deletedEntry.id, message: `Found key "${key}". Deleting entry.`, codeLine: 7 });
                bucket.splice(i, 1);
                return this.steps;
            }
            visitedInThisChain.push(bucket[i].id);
        }

        this.steps.push({ type: 'message', message: `Key "${key}" not found. Nothing to delete.`, codeLine: 6 });
        return this.steps;
    }
}
