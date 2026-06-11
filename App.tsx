


import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { BinarySearchTree } from './lib/bst';
import { AVLTree } from './lib/avl';
import { SinglyLinkedList } from './lib/linkedList';
import { Queue } from './lib/queue';
import { Stack } from './lib/stack';
import { HashTable } from './lib/hashTable';
import { Graph } from './lib/graph';
import { generateBubbleSortSteps, generateSelectionSortSteps, generateInsertionSortSteps, generateQuickSortSteps } from './lib/sorting';
import { generateBfsSteps, generateDfsSteps } from './lib/pathfinding';
import { generateDijkstraSteps, generateBellmanFordSteps, generateDagShortestPathSteps } from './lib/sssp';
import { generateFibonacciSteps, generateFibonacciMemoizedSteps } from './lib/recursion';
import { generatePrimsSteps, generateKruskalsSteps } from './lib/mst';
import BSTVisualizer from './components/BSTVisualizer';
import SortingVisualizer from './components/SortingVisualizer';
import GridVisualizer from './components/GridVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import QueueVisualizer from './components/QueueVisualizer';
import StackVisualizer from './components/StackVisualizer';
import HashTableVisualizer from './components/HashTableVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import RecursionVisualizer from './components/RecursionVisualizer';
import { Button, Input, Card, Modal, Spinner } from './components/ui';
import { ConceptType, OperationType, TreeNode, VisualizationStep, GridNode, LinkedListNode, QueueElement, StackElement, HashTableEntry, GraphData, RecursionGraphData } from './types';
import { 
    ANIMATION_SPEEDS, INSERT_CODE, SEARCH_CODE, DELETE_CODE, BUBBLE_SORT_CODE, SELECTION_SORT_CODE, 
    INORDER_CODE, BFS_CODE, INSERTION_SORT_CODE, QUICK_SORT_CODE, DFS_CODE, LL_INSERT_HEAD_CODE,
    LL_INSERT_TAIL_CODE, LL_DELETE_CODE, LL_SEARCH_CODE, QUEUE_ENQUEUE_CODE, QUEUE_DEQUEUE_CODE, QUEUE_PEEK_CODE,
    HT_INSERT_CODE, HT_SEARCH_CODE, HT_DELETE_CODE, STACK_PUSH_CODE, STACK_POP_CODE, STACK_PEEK_CODE,
    DIJKSTRA_CODE, BELLMAN_FORD_CODE, DAG_SHORTEST_PATH_CODE, FIBONACCI_CODE, FIBONACCI_MEMOIZED_CODE,
    PRIMS_CODE, KRUSKALS_CODE, AVL_INSERT_CODE, AVL_DELETE_CODE
} from './constants';
import { getExplanationForStep, GeminiExplanation } from './services/geminiService';

const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = useCallback((value: T | ((prevState: T) => T)) => {
    const newState = typeof value === 'function' 
        ? (value as (prevState: T) => T)(state) 
        : value;

    if (JSON.stringify(newState) === JSON.stringify(state)) {
        return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [currentIndex, history, state]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [canUndo, currentIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [canRedo, currentIndex]);
  
  const reset = useCallback((newState: T) => {
      setHistory([newState]);
      setCurrentIndex(0);
  }, []);

  return { state, setState, undo, redo, canUndo, canRedo, reset };
};


const InfoIcon: React.FC<{onClick: () => void}> = ({onClick}) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 hover:text-blue-600 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const UndoIcon: React.FC<{onClick: () => void, disabled: boolean}> = ({onClick, disabled}) => (
    <svg onClick={!disabled ? onClick : undefined} xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 cursor-pointer'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
);

const RedoIcon: React.FC<{onClick: () => void, disabled: boolean}> = ({onClick, disabled}) => (
    <svg onClick={!disabled ? onClick : undefined} xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 cursor-pointer'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8m11 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SpeakerOnIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpeakerOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l-4-4m0 0l-4 4m4-4v12" />
    </svg>
);

const GRID_ROWS = 20;
const GRID_COLS = 35;

const createInitialGrid = (rows: number, cols: number): GridNode[][] => {
    const grid: GridNode[][] = [];
    for (let row = 0; row < rows; row++) {
        const currentRow: GridNode[] = [];
        for (let col = 0; col < cols; col++) {
            currentRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
            });
        }
        grid.push(currentRow);
    }
    return grid;
};

interface AppState {
    bst: BinarySearchTree;
    avl: AVLTree;
    sortingArray: number[];
    grid: GridNode[][];
    startNode: [number, number];
    endNode: [number, number];
    linkedList: SinglyLinkedList;
    queue: Queue;
    stack: Stack;
    hashTable: HashTable;
    graph: Graph;
    recursionGraph: RecursionGraphData | null;
}


const App: React.FC = () => {
    const [concept, setConcept] = useState<ConceptType>('bst');
    const [operation, setOperation] = useState<OperationType>('none');
    
    const { 
        state: dataState, 
        setState: setDataState, 
        undo: historyUndo, redo: historyRedo, canUndo, canRedo, reset: resetHistory 
    } = useHistory<AppState>({
        bst: new BinarySearchTree(),
        avl: new AVLTree(),
        sortingArray: [],
        grid: createInitialGrid(GRID_ROWS, GRID_COLS),
        startNode: [Math.floor(GRID_ROWS / 2), 5],
        endNode: [Math.floor(GRID_ROWS / 2), GRID_COLS - 6],
        linkedList: new SinglyLinkedList(),
        queue: new Queue(),
        stack: new Stack(),
        hashTable: new HashTable(),
        graph: new Graph(),
        recursionGraph: null,
    });

    const [inputValue, setInputValue] = useState('');
    const [ssspStartNode, setSsspStartNode] = useState('1');
    const [inputKey, setInputKey] = useState('');
    const [visualizationSteps, setVisualizationSteps] = useState<VisualizationStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState('Medium');
    const [explanation, setExplanation] = useState<GeminiExplanation>({ explanation: '', sources: [] });
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    
    // Voice narration state
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [speechRate, setSpeechRate] = useState(1);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [wallCreationMode, setWallCreationMode] = useState<'wall' | 'erase' | null>(null);

    const [inputMode, setInputMode] = useState<'random' | 'manual'>('random');
    const [manualInputData, setManualInputData] = useState('');

    const visualizerContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const bstData = useMemo(() => dataState.bst.getTreeData(), [dataState.bst]);
    const avlData = useMemo(() => dataState.avl.getTreeData(), [dataState.avl]);
    const llData = useMemo(() => dataState.linkedList.getListData(), [dataState.linkedList]);
    const queueData = useMemo(() => dataState.queue.getQueueData(), [dataState.queue]);
    const stackData = useMemo(() => dataState.stack.getStackData(), [dataState.stack]);
    const htData = useMemo(() => dataState.hashTable.getTableData(), [dataState.hashTable]);
    const graphData = useMemo(() => dataState.graph.getGraphData(), [dataState.graph]);

    // Effect to populate speech synthesis voices
    useEffect(() => {
        const populateVoiceList = () => {
            if (typeof speechSynthesis === 'undefined') {
                return;
            }
            const voices = speechSynthesis.getVoices();
            setAvailableVoices(voices);
            if (voices.length > 0 && !selectedVoiceURI) {
                // Set a default voice. The first one is often the system default.
                setSelectedVoiceURI(voices[0].voiceURI);
            }
        };

        populateVoiceList();
        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        return () => {
            if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [selectedVoiceURI]);


    const stopSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!isVoiceEnabled || !text || !('speechSynthesis' in window)) return;
        stopSpeech();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = speechRate;
        if (selectedVoiceURI) {
            const selectedVoice = availableVoices.find(voice => voice.voiceURI === selectedVoiceURI);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }
        
        window.speechSynthesis.speak(utterance);
    }, [isVoiceEnabled, stopSpeech, speechRate, selectedVoiceURI, availableVoices]);
    
    const undo = () => {
        if(canUndo) {
            stopSpeech();
            historyUndo();
        }
    }
    
    const redo = () => {
        if(canRedo) {
            stopSpeech();
            historyRedo();
        }
    }

    const resetDataStructures = useCallback((conceptToReset?: ConceptType) => {
        const conceptToClear = conceptToReset || concept;
        
        const initialGrid = createInitialGrid(GRID_ROWS, GRID_COLS);
        const initialState: AppState = {
            bst: new BinarySearchTree(),
            avl: new AVLTree(),
            sortingArray: [],
            grid: initialGrid,
            startNode: [Math.floor(GRID_ROWS / 2), 5],
            endNode: [Math.floor(GRID_ROWS / 2), GRID_COLS - 6],
            linkedList: new SinglyLinkedList(),
            queue: new Queue(),
            stack: new Stack(),
            hashTable: new HashTable(),
            graph: new Graph(),
            recursionGraph: null,
        };

        resetHistory({
            ...dataState,
            bst: conceptToClear === 'bst' ? initialState.bst : dataState.bst,
            avl: conceptToClear === 'avl' ? initialState.avl : dataState.avl,
            sortingArray: conceptToClear === 'sorting' ? initialState.sortingArray : dataState.sortingArray,
            grid: conceptToClear === 'pathfinding' ? initialState.grid : dataState.grid,
            startNode: conceptToClear === 'pathfinding' ? initialState.startNode : dataState.startNode,
            endNode: conceptToClear === 'pathfinding' ? initialState.endNode : dataState.endNode,
            linkedList: conceptToClear === 'linked-list' ? initialState.linkedList : dataState.linkedList,
            queue: conceptToClear === 'queue' ? initialState.queue : dataState.queue,
            stack: conceptToClear === 'stack' ? initialState.stack : dataState.stack,
            hashTable: conceptToClear === 'hash-table' ? initialState.hashTable : dataState.hashTable,
            graph: (conceptToClear === 'sssp' || conceptToClear === 'mst') ? initialState.graph : dataState.graph,
            recursionGraph: conceptToClear === 'recursion' ? initialState.recursionGraph : dataState.recursionGraph,
        });

        setVisualizationSteps([]);
        setCurrentStepIndex(-1);
        setExplanation({ explanation: '', sources: [] });
        setIsPlaying(false);
        setOperation('none');
        setInputValue('');
        setInputKey('');
    }, [concept, dataState, resetHistory]);

    useEffect(() => {
        const updateDimensions = () => {
            if (visualizerContainerRef.current) {
                const { width, height } = visualizerContainerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [concept]);


    const stopPlayback = useCallback(() => {
        setIsPlaying(false);
        stopSpeech();
    }, [stopSpeech]);

    const handleConceptChange = (newConcept: ConceptType) => {
        stopPlayback();
        setConcept(newConcept);
        resetDataStructures(newConcept);
    };

    useEffect(() => {
        if (isPlaying && currentStepIndex < visualizationSteps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStepIndex(prev => prev + 1);
            }, ANIMATION_SPEEDS[animationSpeed]);
            return () => clearTimeout(timer);
        } else {
            setIsPlaying(false);
        }
    }, [isPlaying, currentStepIndex, visualizationSteps, animationSpeed]);

    useEffect(() => {
        const fetchExplanation = async () => {
            if (currentStepIndex >= 0 && currentStepIndex < visualizationSteps.length) {
                const step = visualizationSteps[currentStepIndex];
                if (step.type === 'message' && currentStepIndex === visualizationSteps.length -1) return;
                
                setIsExplanationLoading(true);

                let contextData = '';
                switch(concept) {
                    case 'bst': contextData = JSON.stringify(bstData); break;
                    case 'avl': contextData = JSON.stringify(avlData); break;
                    case 'sorting': contextData = `[${dataState.sortingArray.join(', ')}]`; break;
                    case 'linked-list': contextData = llData.map(n => n.value).join(' -> '); break;
                    case 'queue': contextData = `Front -> [${queueData.map(e => e.value).join(', ')}] <- Rear`; break;
                    case 'stack': contextData = `[${stackData.map(e => e.value).join(', ')}] <- Top`; break;
                    case 'hash-table': contextData = `(A conceptual hash table representation)`; break;
                    case 'pathfinding': contextData = `(A grid for pathfinding)`; break;
                    case 'sssp': contextData = `(A weighted directed graph)`; break;
                    case 'mst': contextData = `(A weighted undirected graph)`; break;
                    case 'recursion': contextData = `(A recursion call tree/graph)`; break;
                }

                try {
                    const explResponse = await getExplanationForStep(concept, operation, step, contextData);
                    setExplanation(explResponse);
                    speak(explResponse.explanation);
                } catch (error) {
                    console.error("Error fetching explanation:", error);
                    setExplanation({ explanation: "Could not load explanation.", sources: [] });
                } finally {
                    setIsExplanationLoading(false);
                }
            } else {
                setExplanation({ explanation: '', sources: [] });
            }
        };
        fetchExplanation();
    }, [currentStepIndex, visualizationSteps, concept, operation, dataState, bstData, avlData, llData, queueData, stackData, speak]);

    const handlePlayPause = () => {
        if (isPlaying) {
            stopSpeech();
        }
        setIsPlaying(!isPlaying);
    }
    const handleNext = () => {
        stopSpeech();
        if (currentStepIndex < visualizationSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };
    const handlePrev = () => {
        stopSpeech();
        if (currentStepIndex > -1) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };
    const handleReset = () => {
        setCurrentStepIndex(-1);
        setIsPlaying(false);
        setExplanation({ explanation: '', sources: [] });
        stopSpeech();
    };
    
    const handleToggleVoice = () => {
        setIsVoiceEnabled(prev => {
            if (prev) { // If it was on, turn it off and stop speech
                stopSpeech();
            }
            return !prev;
        });
    };

    const handleOperation = (op: OperationType, value?: string, key?: string) => {
        stopPlayback();
        setOperation(op);
        setVisualizationSteps([]);
        setCurrentStepIndex(-1);
        
        const val = Number(value);

        switch (op) {
            // --- BST ---
            case 'insert': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newBst = s.bst.clone();
                    const newSteps = newBst.insert(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, bst: newBst };
                });
                break;
            }
            case 'search': {
                 if (isNaN(val)) return;
                 setDataState(s => {
                    const newBst = s.bst.clone();
                    const newSteps = newBst.search(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, bst: newBst };
                 });
                break;
            }
            case 'delete': {
                 if (isNaN(val)) return;
                 setDataState(s => {
                    const newBst = s.bst.clone();
                    const newSteps = newBst.delete(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, bst: newBst };
                 });
                break;
            }
            case 'inorder': {
                setDataState(s => {
                    const newBst = s.bst.clone();
                    const newSteps = newBst.inorderTraversal();
                    setVisualizationSteps(newSteps);
                    return { ...s, bst: newBst };
                });
                break;
            }
            // --- AVL ---
            case 'avl-insert': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newAvl = s.avl.clone();
                    const newSteps = newAvl.insert(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, avl: newAvl };
                });
                break;
            }
            case 'avl-delete': {
                 if (isNaN(val)) return;
                 setDataState(s => {
                    const newAvl = s.avl.clone();
                    const newSteps = newAvl.delete(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, avl: newAvl };
                 });
                break;
            }
            // --- Sorting ---
            case 'bubbleSort': {
                const [steps] = generateBubbleSortSteps(dataState.sortingArray);
                setVisualizationSteps(steps);
                break;
            }
             case 'selectionSort': {
                const [steps] = generateSelectionSortSteps(dataState.sortingArray);
                setVisualizationSteps(steps);
                break;
            }
            case 'insertionSort': {
                const [steps] = generateInsertionSortSteps(dataState.sortingArray);
                setVisualizationSteps(steps);
                break;
            }
            case 'quickSort': {
                const [steps] = generateQuickSortSteps(dataState.sortingArray);
                setVisualizationSteps(steps);
                break;
            }
            // --- Pathfinding ---
            case 'bfs': {
                const steps = generateBfsSteps(dataState.grid, dataState.startNode, dataState.endNode);
                setVisualizationSteps(steps);
                break;
            }
            case 'dfs': {
                const steps = generateDfsSteps(dataState.grid, dataState.startNode, dataState.endNode);
                setVisualizationSteps(steps);
                break;
            }
            // --- Linked List ---
            case 'll-insert-head': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newList = s.linkedList.clone();
                    const newSteps = newList.insertAtHead(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, linkedList: newList };
                });
                break;
            }
            case 'll-insert-tail': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newList = s.linkedList.clone();
                    const newSteps = newList.insertAtTail(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, linkedList: newList };
                });
                break;
            }
            case 'll-delete': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newList = s.linkedList.clone();
                    const newSteps = newList.delete(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, linkedList: newList };
                });
                break;
            }
            case 'll-search': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newList = s.linkedList.clone();
                    const newSteps = newList.search(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, linkedList: newList };
                });
                break;
            }
             // --- Queue ---
            case 'q-enqueue': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newQueue = s.queue.clone();
                    const newSteps = newQueue.enqueue(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, queue: newQueue };
                });
                break;
            }
            case 'q-dequeue': {
                setDataState(s => {
                    const newQueue = s.queue.clone();
                    const newSteps = newQueue.dequeue();
                    setVisualizationSteps(newSteps);
                    return { ...s, queue: newQueue };
                });
                break;
            }
            case 'q-peek': {
                setDataState(s => {
                    const newQueue = s.queue.clone();
                    const newSteps = newQueue.peek();
                    setVisualizationSteps(newSteps);
                    return { ...s, queue: newQueue };
                });
                break;
            }
             // --- Stack ---
            case 's-push': {
                if (isNaN(val)) return;
                setDataState(s => {
                    const newStack = s.stack.clone();
                    const newSteps = newStack.push(val);
                    setVisualizationSteps(newSteps);
                    return { ...s, stack: newStack };
                });
                break;
            }
            case 's-pop': {
                setDataState(s => {
                    const newStack = s.stack.clone();
                    const newSteps = newStack.pop();
                    setVisualizationSteps(newSteps);
                    return { ...s, stack: newStack };
                });
                break;
            }
            case 's-peek': {
                setDataState(s => {
                    const newStack = s.stack.clone();
                    const newSteps = newStack.peek();
                    setVisualizationSteps(newSteps);
                    return { ...s, stack: newStack };
                });
                break;
            }
            // --- Hash Table ---
            case 'ht-insert': {
                if (isNaN(val) || !key) return;
                setDataState(s => {
                    const newHt = s.hashTable.clone();
                    const newSteps = newHt.insert(key, val);
                    setVisualizationSteps(newSteps);
                    return { ...s, hashTable: newHt };
                });
                break;
            }
            case 'ht-search': {
                if (!key) return;
                setDataState(s => {
                    const newHt = s.hashTable.clone();
                    const newSteps = newHt.search(key);
                    setVisualizationSteps(newSteps);
                    return { ...s, hashTable: newHt };
                });
                break;
            }
            case 'ht-delete': {
                if (!key) return;
                setDataState(s => {
                    const newHt = s.hashTable.clone();
                    const newSteps = newHt.delete(key);
                    setVisualizationSteps(newSteps);
                    return { ...s, hashTable: newHt };
                });
                break;
            }
             // --- SSSP ---
            case 'dijkstra': {
                if (isNaN(val)) return;
                const newSteps = generateDijkstraSteps(dataState.graph, val);
                setVisualizationSteps(newSteps);
                break;
            }
            case 'bellmanFord': {
                if (isNaN(val)) return;
                const newSteps = generateBellmanFordSteps(dataState.graph, val);
                setVisualizationSteps(newSteps);
                break;
            }
            case 'dagShortestPath': {
                if (isNaN(val)) return;
                const newSteps = generateDagShortestPathSteps(dataState.graph, val);
                setVisualizationSteps(newSteps);
                break;
            }
            // --- Recursion / DP ---
            case 'fibonacci': {
                if (isNaN(val) || val < 0 || val > 12) return; // Add limit for performance
                const [newSteps, graph] = generateFibonacciSteps(val);
                setVisualizationSteps(newSteps);
                setDataState(s => ({ ...s, recursionGraph: graph }));
                break;
            }
            case 'fibonacci-memoized': {
                if (isNaN(val) || val < 0 || val > 30) return;
                const [newSteps, graph] = generateFibonacciMemoizedSteps(val);
                setVisualizationSteps(newSteps);
                setDataState(s => ({ ...s, recursionGraph: graph }));
                break;
            }
            // --- MST ---
            case 'prims': {
                if (isNaN(val)) return;
                const newSteps = generatePrimsSteps(dataState.graph, val);
                setVisualizationSteps(newSteps);
                break;
            }
            case 'kruskals': {
                const newSteps = generateKruskalsSteps(dataState.graph);
                setVisualizationSteps(newSteps);
                break;
            }
        }
    };
    
    const handleRandomize = () => {
        stopPlayback();
        setCurrentStepIndex(-1);
        setVisualizationSteps([]);

        switch (concept) {
            case 'bst': {
                const newBst = new BinarySearchTree();
                [50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45].forEach(v => newBst.insert(v));
                setDataState(s => ({ ...s, bst: newBst }));
                break;
            }
            case 'avl': {
                const newAvl = new AVLTree();
                [30, 20, 40, 10, 25, 35, 50].forEach(v => newAvl.insert(v));
                setDataState(s => ({ ...s, avl: newAvl }));
                break;
            }
            case 'sorting': {
                const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10);
                setDataState(s => ({ ...s, sortingArray: arr }));
                break;
            }
             case 'pathfinding': {
                const newGrid = createInitialGrid(GRID_ROWS, GRID_COLS);
                const startNode: [number, number] = [Math.floor(GRID_ROWS / 2), 5];
                const endNode: [number, number] = [Math.floor(GRID_ROWS / 2), GRID_COLS - 6];
                
                // Add some random walls
                for (let i = 0; i < (GRID_ROWS * GRID_COLS) * 0.25; i++) {
                    const row = Math.floor(Math.random() * GRID_ROWS);
                    const col = Math.floor(Math.random() * GRID_COLS);
                    const isStart = row === startNode[0] && col === startNode[1];
                    const isEnd = row === endNode[0] && col === endNode[1];
                    if (!isStart && !isEnd) {
                        newGrid[row][col].isWall = true;
                    }
                }

                setDataState(s => ({ ...s, grid: newGrid, startNode, endNode }));
                break;
            }
            case 'linked-list': {
                 const newList = new SinglyLinkedList();
                 [11, 7, 23, 42, 5].forEach(v => newList.insertAtTail(v));
                 setDataState(s => ({ ...s, linkedList: newList }));
                 break;
            }
            case 'queue': {
                const newQueue = new Queue();
                [11, 7, 23].forEach(v => newQueue.enqueue(v));
                setDataState(s => ({...s, queue: newQueue}));
                break;
            }
            case 'stack': {
                const newStack = new Stack();
                [11, 7, 23].forEach(v => newStack.push(v));
                setDataState(s => ({...s, stack: newStack}));
                break;
            }
            case 'hash-table': {
                const newHt = new HashTable();
                const items = [{key: 'apple', value: 10}, {key: 'banana', value: 20}, {key: 'orange', value: 30}, {key: 'grape', value: 40}, {key: 'mango', value: 50}, {key: 'blueberry', value: 60}];
                items.forEach(item => newHt.insert(item.key, item.value));
                setDataState(s => ({...s, hashTable: newHt}));
                break;
            }
            case 'sssp': {
                 const newGraph = new Graph();
                 const isDag = operation === 'dagShortestPath';
                 if (isDag) {
                     // Generate a DAG
                     [1, 2, 3, 4, 5, 6].forEach(id => newGraph.addNode(id));
                     newGraph.addEdge(1, 2, 5);
                     newGraph.addEdge(1, 3, 3);
                     newGraph.addEdge(2, 4, 6);
                     newGraph.addEdge(2, 3, 2);
                     newGraph.addEdge(3, 4, 7);
                     newGraph.addEdge(3, 5, 4);
                     newGraph.addEdge(3, 6, 2);
                     newGraph.addEdge(4, 5, -1);
                     newGraph.addEdge(4, 6, 1);
                     newGraph.addEdge(5, 6, -2);
                 } else {
                     // Generate a general graph (works for Dijkstra and Bellman-Ford)
                    [1, 2, 3, 4, 5].forEach(id => newGraph.addNode(id));
                    newGraph.addEdge(1, 2, 10);
                    newGraph.addEdge(1, 3, 3);
                    newGraph.addEdge(2, 3, 1);
                    newGraph.addEdge(2, 4, 2);
                    newGraph.addEdge(3, 2, 4);
                    newGraph.addEdge(3, 4, 8);
                    newGraph.addEdge(3, 5, 2);
                    newGraph.addEdge(4, 5, 5);
                 }
                setDataState(s => ({ ...s, graph: newGraph }));
                break;
            }
            case 'mst': {
                const newGraph = new Graph();
                // Generate a connected, undirected graph for MST
                [1, 2, 3, 4, 5, 6].forEach(id => newGraph.addNode(id));
                const addUndirectedEdge = (u: number, v: number, w: number) => {
                    newGraph.addEdge(u, v, w);
                    newGraph.addEdge(v, u, w);
                };
                addUndirectedEdge(1, 2, 7);
                addUndirectedEdge(1, 3, 9);
                addUndirectedEdge(1, 6, 14);
                addUndirectedEdge(2, 3, 10);
                addUndirectedEdge(2, 4, 15);
                addUndirectedEdge(3, 4, 11);
                addUndirectedEdge(3, 6, 2);
                addUndirectedEdge(4, 5, 6);
                addUndirectedEdge(5, 6, 9);
                setDataState(s => ({ ...s, graph: newGraph }));
                break;
            }
            case 'recursion': {
                 setInputValue('5'); // Default to fib(5)
                 break;
            }
        }
        handleReset();
    };

    const handleLoadManualData = () => {
        stopPlayback();
        setCurrentStepIndex(-1);
        setVisualizationSteps([]);

        const data = manualInputData.split(',').map(s => s.trim()).filter(Boolean);
        const numbers = data.map(Number).filter(n => !isNaN(n));

        switch (concept) {
            case 'bst': {
                const newBst = new BinarySearchTree();
                numbers.forEach(v => newBst.insert(v));
                setDataState(s => ({ ...s, bst: newBst }));
                break;
            }
            case 'avl': {
                const newAvl = new AVLTree();
                numbers.forEach(v => newAvl.insert(v));
                setDataState(s => ({ ...s, avl: newAvl }));
                break;
            }
            case 'sorting': {
                setDataState(s => ({ ...s, sortingArray: numbers }));
                break;
            }
            case 'linked-list': {
                 const newList = new SinglyLinkedList();
                 numbers.forEach(v => newList.insertAtTail(v));
                 setDataState(s => ({ ...s, linkedList: newList }));
                 break;
            }
            case 'queue': {
                const newQueue = new Queue();
                numbers.forEach(v => newQueue.enqueue(v));
                setDataState(s => ({...s, queue: newQueue}));
                break;
            }
            case 'stack': {
                const newStack = new Stack();
                numbers.forEach(v => newStack.push(v));
                setDataState(s => ({...s, stack: newStack}));
                break;
            }
            case 'hash-table': {
                const newHt = new HashTable();
                data.forEach(pair => {
                    const [key, valueStr] = pair.split(':');
                    const value = Number(valueStr);
                    if (key && !isNaN(value)) {
                         newHt.insert(key, value);
                    }
                });
                setDataState(s => ({...s, hashTable: newHt}));
                break;
            }
        }
        handleReset();
    };

    const handleGridInteraction = (row: number, col: number, isDragging: boolean) => {
        if (isPlaying) return;
        const currentCell = dataState.grid[row][col];
        const isStart = row === dataState.startNode[0] && col === dataState.startNode[1];
        const isEnd = row === dataState.endNode[0] && col === dataState.endNode[1];

        if (!isDragging) { // Single click
            const mode = currentCell.isWall ? 'erase' : 'wall';
            if (!isStart && !isEnd) {
                const newGrid = dataState.grid.map(r => r.map(c => ({...c})));
                newGrid[row][col].isWall = !newGrid[row][col].isWall;
                setDataState(s => ({ ...s, grid: newGrid }));
            }
            setWallCreationMode(mode);
        } else { // Dragging
             if (wallCreationMode !== null && !isStart && !isEnd) {
                const newGrid = dataState.grid.map(r => r.map(c => ({...c})));
                newGrid[row][col].isWall = wallCreationMode === 'wall';
                setDataState(s => ({ ...s, grid: newGrid }));
             }
        }
    };
    
    // --- Highlight Logic ---
    function getTreeHighlights() {
        if (currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        switch (step.type) {
            case 'compare': return { nodeId: step.nodeId as number, targetId: step.targetId };
            case 'traverse': return { fromId: step.fromId as number, toId: step.toId as number };
            case 'path':
            case 'visit': return { pathId: step.nodeId as number };
            case 'rotate-left':
            case 'rotate-right':
            case 'balance-check': return { rotationNodeId: step.nodeId as number };
            default: return {};
        }
    }

    const currentSortingArray = useMemo(() => {
        if (concept !== 'sorting' || currentStepIndex < 0) {
            return dataState.sortingArray;
        }
    
        // Find the most recent array state from the steps up to the current index
        for (let i = currentStepIndex; i >= 0; i--) {
            const step = visualizationSteps[i];
            if (step.arrayState) {
                return step.arrayState;
            }
        }
    
        // If no state found in steps so far (e.g., only compare steps), return the initial state
        return dataState.sortingArray;
    }, [concept, currentStepIndex, visualizationSteps, dataState.sortingArray]);

    function getSortingHighlights() {
        if (currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        const highlights: { compare?: (number | undefined)[], swap?: (number | undefined)[], path?: (number | undefined)[], sortedIndex?: number, pivot?: number } = {};
        
        // Find the most recent sorted boundary
        for (let i = currentStepIndex; i >= 0; i--) {
            const s = visualizationSteps[i];
            if (s.type === 'sorted-boundary') {
                highlights.sortedIndex = s.boundary;
                break;
            }
        }
        
        switch (step.type) {
            case 'compare': highlights.compare = step.indices; break;
            case 'swap': highlights.swap = step.indices; break;
            case 'path': highlights.path = step.indices; break;
            case 'set-pivot': highlights.pivot = step.pivotIndex; break;
        }
        return highlights;
    }

    const pathfindingHighlightsMemo = useMemo(() => {
        if (concept !== 'pathfinding' || currentStepIndex < 0) return { visited: new Set<string>(), path: new Set<string>(), queue: [], stack: [] };

        const visited = new Set<string>();
        const path = new Set<string>();
        let current: [number, number] | undefined;

        // Simulate algorithm up to current step
        const tempQueue: [number, number][] = operation === 'bfs' ? [dataState.startNode] : [];
        const tempStack: [number, number][] = operation === 'dfs' ? [dataState.startNode] : [];

        for (let i = 0; i <= currentStepIndex; i++) {
            const step = visualizationSteps[i];
            const cellKey = step.cell ? `${step.cell[0]},${step.cell[1]}` : '';

            switch (step.type) {
                case 'enqueue':
                    visited.add(cellKey);
                    if (operation === 'bfs') tempQueue.push(step.cell!);
                    break;
                case 'dequeue':
                    current = step.cell;
                    if(operation === 'bfs') tempQueue.shift();
                    break;
                case 'push':
                     if (operation === 'dfs') tempStack.push(step.cell!);
                    break;
                case 'pop':
                    current = step.cell;
                    visited.add(cellKey);
                     if(operation === 'dfs') tempStack.pop();
                    break;
                case 'mark-path':
                    path.add(cellKey);
                    break;
            }
        }
        
        return { visited, path, queue: tempQueue, stack: tempStack, current };
    }, [currentStepIndex, visualizationSteps, concept, operation, dataState.startNode]);

    function getPathfindingHighlights() {
        return pathfindingHighlightsMemo;
    }

    function getLinkedListHighlights() {
         if (currentStepIndex < 0) return {};
         const step = visualizationSteps[currentStepIndex];
         switch(step.type) {
            case 'compare':
            case 'traverse': return { nodeId: step.nodeId as number || step.fromId as number };
            case 'pointer-move': return { fromId: step.fromId as number, toId: step.toId as number | null };
            case 'path': return { pathId: step.nodeId as number };
            case 'll-insert': return { newNodeId: (step.newNode as LinkedListNode)?.id };
            case 'll-delete': return { deletedNodeId: step.nodeId as number };
            default: return {};
         }
    }

    function getQueueStackHighlights() {
        if (currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        switch(step.type) {
            case 'enqueue':
            case 'push':
                 return { newNodeId: (step.newNode as any)?.id };
            case 'peek': return { nodeId: step.nodeId as number };
            case 'dequeue': 
            case 'pop':
                // For dequeue/pop, we want to highlight the node *before* it's gone.
                // Find the 'peek' step that corresponds to this action.
                for (let i = currentStepIndex; i >= 0; i--) {
                    if (visualizationSteps[i].type === 'peek' && visualizationSteps[i].nodeId === step.nodeId) {
                        return { nodeId: step.nodeId as number };
                    }
                }
                return {};
            default: return {};
        }
    }

    function getHashTableHighlights() {
        if (currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        switch(step.type) {
            case 'hash-calculate':
            case 'bucket-lookup':
            case 'ht-insert':
            case 'ht-update':
                return { bucketIndex: step.bucketIndex };
            case 'chain-traverse':
            case 'ht-delete':
                return { bucketIndex: step.bucketIndex, chainNodeId: step.chainNodeId, visitedChainNodeIds: step.visitedChainNodeIds };
            case 'path':
                return { bucketIndex: step.bucketIndex, pathId: step.chainNodeId };
            default: return {};
        }
    }
    
    const ssspHighlightsMemo = useMemo(() => {
        if (concept !== 'sssp' || currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        const highlights: any = {};
        if (step.distances) highlights.distances = step.distances;
        if (step.nodeId) highlights.currentNodeId = step.nodeId;
        if (step.edge) highlights.currentEdge = step.edge;
        if (step.finalPath) highlights.finalPath = step.finalPath;

        // Persist final distances
        if (!highlights.distances) {
            for (let i = currentStepIndex - 1; i >= 0; i--) {
                if (visualizationSteps[i].distances) {
                    highlights.distances = visualizationSteps[i].distances;
                    break;
                }
            }
        }
        return highlights;
    }, [concept, currentStepIndex, visualizationSteps]);

    function getSsspHighlights() {
        return ssspHighlightsMemo;
    }

    const mstHighlightsMemo = useMemo(() => {
        if (concept !== 'mst' || currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        const highlights: any = {};
        if (step.edge) highlights.currentEdge = step.edge;
        if (step.mstEdges) highlights.mstEdges = step.mstEdges;
        if (step.type === 'form-cycle') highlights.rejectedEdge = step.edge;
        
        // Persist MST edges
        if (!highlights.mstEdges) {
            for (let i = currentStepIndex - 1; i >= 0; i--) {
                if (visualizationSteps[i].mstEdges) {
                    highlights.mstEdges = visualizationSteps[i].mstEdges;
                    break;
                }
            }
        }
        return highlights;
    }, [concept, currentStepIndex, visualizationSteps]);

    function getMstHighlights() {
        return mstHighlightsMemo;
    }
    
    const recursionHighlightsMemo = useMemo(() => {
        if (concept !== 'recursion' || currentStepIndex < 0) return {};
        const step = visualizationSteps[currentStepIndex];
        const highlights: any = {};
        // Map conceptual node ID (e.g., from a specific call instance) to the display ID (e.g., the merged label 'fib(5)')
        const mapIdToLabel = (id: string | number) => {
            const s = visualizationSteps.find(step => step.nodeId === id);
            return s?.nodeLabel || id;
        }

        switch (step.type) {
            case 'recursive-call':
                highlights.currentNodeId = operation === 'fibonacci-memoized' ? mapIdToLabel(step.nodeId!) : step.nodeId;
                break;
            case 'recursive-return':
                highlights.returnedNodeId = operation === 'fibonacci-memoized' ? mapIdToLabel(step.nodeId!) : step.nodeId;
                highlights.returnValue = step.returnValue;
                break;
            case 'memo-hit':
                 highlights.memoHitNodeId = operation === 'fibonacci-memoized' ? mapIdToLabel(step.nodeId!) : step.nodeId;
                 highlights.returnValue = step.returnValue;
                 break;
        }
        return highlights;
    }, [concept, operation, currentStepIndex, visualizationSteps]);

    function getRecursionHighlights() {
        return recursionHighlightsMemo;
    }

    const conceptMap: { [key in ConceptType]: any } = {
        bst: {
            name: 'Binary Search Tree',
            visualizer: <BSTVisualizer treeData={bstData} highlights={getTreeHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Insert', op: 'insert', needsValue: true },
                { name: 'Search', op: 'search', needsValue: true },
                { name: 'Delete', op: 'delete', needsValue: true },
                { name: 'In-order Traversal', op: 'inorder', needsValue: false },
            ],
            code: { insert: INSERT_CODE, search: SEARCH_CODE, delete: DELETE_CODE, inorder: INORDER_CODE },
            info: "A tree data structure where each node has at most two children. For each node, all values in its left subtree are less than its own value, and all values in its right subtree are greater. This property allows for efficient searching, insertion, and deletion."
        },
        avl: {
            name: 'AVL Tree',
            visualizer: <BSTVisualizer treeData={avlData} highlights={getTreeHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Insert', op: 'avl-insert', needsValue: true },
                { name: 'Delete', op: 'avl-delete', needsValue: true },
            ],
            code: { 'avl-insert': AVL_INSERT_CODE, 'avl-delete': AVL_DELETE_CODE },
            info: "An AVL Tree is a self-balancing Binary Search Tree. It maintains a balanced height by performing rotations (LL, RR, LR, RL) after insertions or deletions. This guarantees that operations like search, insert, and delete have a worst-case time complexity of O(log n)."
        },
        sorting: {
            name: 'Sorting Algorithms',
            visualizer: <SortingVisualizer arrayData={currentSortingArray} highlights={getSortingHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Bubble Sort', op: 'bubbleSort', needsValue: false },
                { name: 'Selection Sort', op: 'selectionSort', needsValue: false },
                { name: 'Insertion Sort', op: 'insertionSort', needsValue: false },
                { name: 'Quick Sort', op: 'quickSort', needsValue: false },
            ],
            code: { bubbleSort: BUBBLE_SORT_CODE, selectionSort: SELECTION_SORT_CODE, insertionSort: INSERTION_SORT_CODE, quickSort: QUICK_SORT_CODE },
            info: "Sorting algorithms are used to rearrange a given array or list of elements according to a comparison operator on the elements. The comparison operator is used to decide the new order of elements in the respective data structure."
        },
         pathfinding: {
            name: 'Pathfinding',
            visualizer: <GridVisualizer 
                grid={dataState.grid} 
                highlights={getPathfindingHighlights()} 
                dimensions={dimensions}
                onNodeClick={(r, c) => handleGridInteraction(r,c, false)}
                onNodeHover={(r, c) => isMouseDown && handleGridInteraction(r, c, true)}
                />,
            operations: [
                { name: 'Breadth-First Search (BFS)', op: 'bfs', needsValue: false },
                { name: 'Depth-First Search (DFS)', op: 'dfs', needsValue: false },
            ],
            code: { bfs: BFS_CODE, dfs: DFS_CODE },
            info: "Pathfinding algorithms explore a graph to find a path between two nodes. BFS explores layer by layer, guaranteeing the shortest path in unweighted graphs. DFS explores as far as possible along each branch before backtracking."
        },
        'linked-list': {
            name: 'Linked List',
            visualizer: <LinkedListVisualizer listData={llData} highlights={getLinkedListHighlights()} dimensions={dimensions}/>,
            operations: [
                { name: 'Insert Head', op: 'll-insert-head', needsValue: true },
                { name: 'Insert Tail', op: 'll-insert-tail', needsValue: true },
                { name: 'Delete', op: 'll-delete', needsValue: true },
                { name: 'Search', op: 'll-search', needsValue: true },
            ],
            code: { 'll-insert-head': LL_INSERT_HEAD_CODE, 'll-insert-tail': LL_INSERT_TAIL_CODE, 'll-delete': LL_DELETE_CODE, 'll-search': LL_SEARCH_CODE },
            info: "A linear data structure where elements are not stored at contiguous memory locations. The elements are linked using pointers. Each node consists of a data field and a reference (link) to the next node in the sequence."
        },
        queue: {
            name: 'Queue',
            visualizer: <QueueVisualizer queueData={queueData} highlights={getQueueStackHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Enqueue', op: 'q-enqueue', needsValue: true },
                { name: 'Dequeue', op: 'q-dequeue', needsValue: false },
                { name: 'Peek', op: 'q-peek', needsValue: false },
            ],
            code: { 'q-enqueue': QUEUE_ENQUEUE_CODE, 'q-dequeue': QUEUE_DEQUEUE_CODE, 'q-peek': QUEUE_PEEK_CODE },
            info: "A linear data structure that follows the First-In-First-Out (FIFO) principle. Elements are added at the rear (enqueue) and removed from the front (dequeue)."
        },
        stack: {
            name: 'Stack',
            visualizer: <StackVisualizer stackData={stackData} highlights={getQueueStackHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Push', op: 's-push', needsValue: true },
                { name: 'Pop', op: 's-pop', needsValue: false },
                { name: 'Peek', op: 's-peek', needsValue: false },
            ],
            code: { 's-push': STACK_PUSH_CODE, 's-pop': STACK_POP_CODE, 's-peek': STACK_PEEK_CODE },
            info: "A linear data structure that follows the Last-In-First-Out (LIFO) principle. Elements are added (pushed) and removed (popped) from the same end, called the top."
        },
        'hash-table': {
            name: 'Hash Table',
            visualizer: <HashTableVisualizer hashTableData={htData} highlights={getHashTableHighlights()} dimensions={dimensions}/>,
            operations: [
                { name: 'Insert', op: 'ht-insert', needsValue: true, needsKey: true },
                { name: 'Search', op: 'ht-search', needsValue: false, needsKey: true },
                { name: 'Delete', op: 'ht-delete', needsValue: false, needsKey: true },
            ],
            code: { 'ht-insert': HT_INSERT_CODE, 'ht-search': HT_SEARCH_CODE, 'ht-delete': HT_DELETE_CODE },
            info: "A data structure that implements an associative array abstract data type, a structure that can map keys to values. A hash table uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found."
        },
        sssp: {
            name: 'SSSP',
            visualizer: <GraphVisualizer graphData={graphData} highlights={getSsspHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Dijkstra', op: 'dijkstra', needsValue: true, valueLabel: "Start Node ID" },
                { name: 'Bellman-Ford', op: 'bellmanFord', needsValue: true, valueLabel: "Start Node ID" },
                { name: 'DAG Shortest Path', op: 'dagShortestPath', needsValue: true, valueLabel: "Start Node ID" },
            ],
            code: { 'dijkstra': DIJKSTRA_CODE, 'bellmanFord': BELLMAN_FORD_CODE, 'dagShortestPath': DAG_SHORTEST_PATH_CODE },
            info: "Single-Source Shortest Path algorithms find the path with the lowest cost (or shortest distance) from a single source node to all other nodes in a weighted graph. Dijkstra is efficient for graphs with non-negative weights, while Bellman-Ford can handle negative weights and detect negative cycles."
        },
        recursion: {
            name: 'Recursion / DP',
            visualizer: <RecursionVisualizer graphData={dataState.recursionGraph} highlights={getRecursionHighlights()} dimensions={dimensions} />,
            operations: [
                { name: 'Fibonacci (Recursive)', op: 'fibonacci', needsValue: true, valueLabel: "n (e.g., 5)" },
                { name: 'Fibonacci (Memoized)', op: 'fibonacci-memoized', needsValue: true, valueLabel: "n (e.g., 8)" },
            ],
            code: { 'fibonacci': FIBONACCI_CODE, 'fibonacci-memoized': FIBONACCI_MEMOIZED_CODE },
            info: "Recursion is a programming technique where a function calls itself to solve a problem. Dynamic Programming (DP) is an optimization technique, often using memoization (caching results) to avoid recomputing the same subproblems, which is common in recursive algorithms like Fibonacci."
        },
        mst: {
            name: 'MST',
            visualizer: <GraphVisualizer graphData={graphData} highlights={getMstHighlights()} dimensions={dimensions} isMST={true} />,
            operations: [
                { name: "Prim's Algorithm", op: 'prims', needsValue: true, valueLabel: "Start Node ID" },
                { name: "Kruskal's Algorithm", op: 'kruskals', needsValue: false },
            ],
            code: { 'prims': PRIMS_CODE, 'kruskals': KRUSKALS_CODE },
            info: "A Minimum Spanning Tree (MST) is a subset of the edges of a connected, edge-weighted undirected graph that connects all the vertices together, without any cycles and with the minimum possible total edge weight."
        }
    };
    
    const currentConcept = conceptMap[concept];
    const currentCode = (currentConcept.code as any)[operation] || `// Select an operation to see the code`;
    const currentStepMessage = visualizationSteps[currentStepIndex]?.message || (operation !== 'none' ? 'Ready to visualize.' : 'Select an operation.');

    return (
        <div className="flex flex-col h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900" onMouseUp={() => setIsMouseDown(false)} onMouseDown={() => setIsMouseDown(true)}>
            <header className="bg-white dark:bg-gray-800 shadow-md p-2 flex justify-between items-center z-10">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">🌳 Algorithm Visualizer</h1>
                    <nav className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex-wrap">
                        {Object.keys(conceptMap).map(key => (
                            <button key={key} onClick={() => handleConceptChange(key as ConceptType)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${concept === key ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                {conceptMap[key as ConceptType].name}
                            </button>
                        ))}
                    </nav>
                </div>
                 <div className="flex items-center space-x-4">
                     <button onClick={handleToggleVoice} title="Toggle Voice Narration" className={`p-1.5 rounded-full transition-colors ${isVoiceEnabled ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                         {isVoiceEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                     </button>

                     <div className={`flex items-center space-x-3 transition-opacity duration-300 ${isVoiceEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <select
                            id="voice-select"
                            value={selectedVoiceURI || ''}
                            onChange={e => setSelectedVoiceURI(e.target.value)}
                            disabled={!isVoiceEnabled}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 max-w-[150px] truncate"
                            aria-label="Select voice"
                        >
                            {availableVoices.length === 0 && <option>Loading voices...</option>}
                            {availableVoices.map((voice) => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                        
                        <div className="flex items-center space-x-1">
                            <label htmlFor="speech-rate" className="text-sm text-gray-500">Rate:</label>
                            <input
                                id="speech-rate"
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={speechRate}
                                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                disabled={!isVoiceEnabled}
                                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                                aria-label="Speech rate"
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <span className="text-sm text-gray-500">Animation:</span>
                    <select value={animationSpeed} onChange={e => setAnimationSpeed(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        {Object.keys(ANIMATION_SPEEDS).map(speed => <option key={speed} value={speed}>{speed}</option>)}
                    </select>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden p-4 gap-4">
                {/* Left Panel - Controls */}
                <div className="flex flex-col w-80 space-y-4">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Controls</h2>
                             <div className="flex items-center space-x-3">
                                <UndoIcon onClick={undo} disabled={!canUndo}/>
                                <RedoIcon onClick={redo} disabled={!canRedo}/>
                             </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold text-gray-700 dark:text-gray-300">Initialize Data</h3>
                             <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-0.5">
                                 <button onClick={() => setInputMode('random')} className={`px-3 py-1 text-xs rounded-full ${inputMode === 'random' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}>Random</button>
                                 <button onClick={() => setInputMode('manual')} className={`px-3 py-1 text-xs rounded-full ${inputMode === 'manual' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}>Manual</button>
                             </div>
                        </div>

                        {inputMode === 'random' ? (
                            <div className="space-y-2">
                                <Button onClick={handleRandomize} className="w-full" disabled={concept === 'recursion'}>
                                     {concept === 'pathfinding' ? 'Generate Random Maze' : 
                                      (concept === 'sssp' || concept === 'mst') ? 'Generate Sample Graph' : 'Generate Random Data'}
                                </Button>
                                {concept === 'pathfinding' && <Button onClick={() => resetDataStructures()} className="w-full" variant="secondary">Clear Walls</Button>}
                            </div>
                        ) : (
                           <div className="space-y-2">
                                <textarea 
                                    value={manualInputData}
                                    onChange={e => setManualInputData(e.target.value)}
                                    placeholder={
                                        concept === 'hash-table' ? "key1:val1, key2:val2" : "e.g., 50, 30, 70"
                                    }
                                    className="block w-full text-sm p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows={2}
                                    disabled={concept === 'pathfinding' || concept === 'sssp' || concept === 'mst' || concept === 'recursion'}
                                />
                                <Button onClick={handleLoadManualData} className="w-full" disabled={concept === 'pathfinding' || concept === 'sssp' || concept === 'mst' || concept === 'recursion'}>Load Data</Button>
                           </div>
                        )}
                    </Card>

                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Operations</h3>
                            <InfoIcon onClick={() => setIsInfoModalOpen(true)} />
                        </div>
                        <div className="space-y-2">
                            {(currentConcept.operations as any[]).map((opInfo) => (
                                <div key={opInfo.op} className="flex flex-col space-y-1">
                                    {opInfo.needsKey && (
                                        <Input
                                            type="text"
                                            placeholder="Enter Key (e.g., apple)"
                                            value={inputKey}
                                            onChange={e => setInputKey(e.target.value)}
                                            disabled={isPlaying}
                                        />
                                    )}
                                    {opInfo.needsValue && (
                                        <Input
                                            type="number"
                                            placeholder={opInfo.valueLabel || "Enter Value"}
                                            value={concept === 'sssp' || concept === 'mst' ? ssspStartNode : inputValue}
                                            onChange={e => concept === 'sssp' || concept === 'mst' ? setSsspStartNode(e.target.value) : setInputValue(e.target.value)}
                                            disabled={isPlaying}
                                        />
                                    )}
                                    <Button onClick={() => handleOperation(opInfo.op, concept === 'sssp' || concept === 'mst' ? ssspStartNode : inputValue, inputKey)} disabled={isPlaying}>
                                        {opInfo.name}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Playback</h3>
                        <div className="flex items-center justify-center space-x-4">
                           <Button onClick={handlePrev} disabled={currentStepIndex <= -1 || isPlaying}>Prev</Button>
                           <Button onClick={handlePlayPause} disabled={visualizationSteps.length === 0}>
                               {isPlaying ? 'Pause' : 'Play'}
                           </Button>
                           <Button onClick={handleNext} disabled={currentStepIndex >= visualizationSteps.length - 1 || isPlaying}>Next</Button>
                        </div>
                        <Button onClick={handleReset} variant="secondary" className="w-full mt-2">Reset Playback</Button>
                    </Card>
                </div>

                {/* Middle Panel - Visualizer */}
                <div className="flex-1 flex flex-col">
                    <div ref={visualizerContainerRef} className="flex-1 w-full h-full relative">
                        {currentConcept.visualizer}
                    </div>
                    <div className="h-16 bg-white dark:bg-gray-800 shadow-inner rounded-b-lg p-2 flex items-center justify-center text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{currentStepMessage}</p>
                    </div>
                </div>

                {/* Right Panel - Explanation & Code */}
                <div className="w-96 flex flex-col space-y-4">
                    <Card className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🤖 Gemini Explanation</h3>
                        <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-y-auto">
                           {isExplanationLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Spinner />
                                </div>
                            ) : (
                               <>
                                <p className="whitespace-pre-wrap">{explanation.explanation || 'Play the visualization to see step-by-step explanations.'}</p>
                                {explanation.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-xs mb-1">Sources:</h4>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {explanation.sources.map((source, index) => (
                                                <li key={index} className="text-xs truncate">
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline" title={source.web.title}>
                                                        {source.web.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                               </>
                            )}
                        </div>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Code Snippet</h3>
                        <div className="bg-gray-900 rounded p-2 flex-1 overflow-auto">
                            <pre className="text-sm text-white">
                                <code className="language-js">
                                    {currentCode.split('\n').map((line: string, index: number) => (
                                        <span key={index} className={`block px-2 rounded ${visualizationSteps[currentStepIndex]?.codeLine === index + 1 ? 'bg-blue-800' : ''}`}>
                                            {line}
                                        </span>
                                    ))}
                                </code>
                            </pre>
                        </div>
                    </Card>
                </div>
            </main>

            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={`About ${currentConcept.name}`}>
                <p className="text-gray-600 dark:text-gray-300">{currentConcept.info}</p>
            </Modal>
        </div>
    );
};

export default App;