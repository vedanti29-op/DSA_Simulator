import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { RecursionGraphData } from '../types';

// FIX: Explicitly define properties from d3.SimulationNodeDatum to resolve TypeScript errors.
interface D3Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    x?: number;
    y?: number;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    source: D3Node | string;
    target: D3Node | string;
}

interface RecursionVisualizerProps {
    graphData: RecursionGraphData | null;
    highlights: {
        currentNodeId?: string;
        returnedNodeId?: string;
        memoHitNodeId?: string;
        returnValue?: number;
    };
    dimensions: { width: number; height: number };
}

const NODE_RADIUS_X = 40;
const NODE_RADIUS_Y = 25;

const RecursionVisualizer: React.FC<RecursionVisualizerProps> = ({ graphData, highlights, dimensions }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const nodes: D3Node[] = useMemo(() => graphData?.nodes.map(n => ({ ...n })) || [], [graphData]);
    const links: D3Link[] = useMemo(() => graphData?.links.map(l => ({ ...l })) || [], [graphData]);

    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0 || !graphData || nodes.length === 0) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            return;
        };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = dimensions.width;
        const height = dimensions.height;
        
        const simulation = d3.forceSimulation<D3Node>(nodes)
            .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-450))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g').selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#9ca3af') // gray-400
            .attr('stroke-width', 2);

        const node = svg.append('g').selectAll('g')
            .data(nodes)
            .enter().append('g');
            
        node.append('ellipse')
            .attr('rx', NODE_RADIUS_X)
            .attr('ry', NODE_RADIUS_Y)
            .attr('class', (d: D3Node) => {
                 const id = d.id;
                 if(highlights.currentNodeId === id) return 'fill-highlight';
                 if(highlights.memoHitNodeId === id) return 'fill-path'; // green
                 if(highlights.returnedNodeId === id) return 'fill-blue-500';
                 return 'fill-primary-500';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        node.append('text')
            .attr('dy', (d: D3Node) => {
                const highlight = highlights.returnedNodeId === d.id || highlights.memoHitNodeId === d.id;
                return highlight ? '-0.4em' : '.3em';
            })
            .attr('text-anchor', 'middle')
            .attr('class', 'fill-white font-bold text-sm select-none')
            .text((d: D3Node) => d.label);
            
        node.append('text')
            .attr('dy', '1.2em')
            .attr('text-anchor', 'middle')
            .attr('class', 'fill-white font-semibold text-xs select-none')
            .text((d: D3Node) => {
                 if (highlights.returnedNodeId === d.id && highlights.returnValue !== undefined) return `ret: ${highlights.returnValue}`;
                 if (highlights.memoHitNodeId === d.id && highlights.returnValue !== undefined) return `ret: ${highlights.returnValue}`;
                 return '';
            });

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as D3Node).x!)
                .attr('y1', d => (d.source as D3Node).y!)
                .attr('x2', d => (d.target as D3Node).x!)
                .attr('y2', d => (d.target as D3Node).y!);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

    }, [nodes, links, dimensions, highlights, graphData]);

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
    );
};

export default RecursionVisualizer;