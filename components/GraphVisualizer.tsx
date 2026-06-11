
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphEdge } from '../types';

// FIX: Explicitly define properties from d3.SimulationNodeDatum to resolve TypeScript errors.
interface D3Node extends d3.SimulationNodeDatum, GraphNode {
    id: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    source: D3Node | number | string;
    target: D3Node | number | string;
    weight: number;
}

interface GraphVisualizerProps {
    graphData: GraphData;
    highlights: {
        currentNodeId?: number;
        currentEdge?: { source: number; target: number };
        distances?: { [nodeId: string]: number | '∞' };
        finalPath?: number[];
        mstEdges?: { source: number, target: number }[];
        rejectedEdge?: { source: number, target: number };
    };
    dimensions: { width: number; height: number };
    isMST?: boolean;
}

const NODE_RADIUS = 25;

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ graphData, highlights, dimensions, isMST = false }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const nodes: D3Node[] = useMemo(() => graphData.nodes.map(n => ({ ...n })), [graphData.nodes]);
    const links: D3Link[] = useMemo(() => graphData.edges.map(e => ({ ...e })), [graphData.edges]);
    
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous render

        const width = dimensions.width;
        const height = dimensions.height;
        
        const simulation = d3.forceSimulation<D3Node>(nodes)
            .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2));
        
        // --- Marker for arrowheads ---
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', NODE_RADIUS + 13)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#9ca3af') // gray-400
            .style('stroke', 'none');

        // --- Links ---
        const link = svg.append('g').selectAll('path')
            .data(links)
            .enter().append('path')
            .attr('stroke', d => {
                const sourceId = (d.source as D3Node).id;
                const targetId = (d.target as D3Node).id;
                
                if (isMST) {
                    if (highlights.mstEdges?.some(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId))) return '#4ade80'; // green-400
                    if (highlights.currentEdge?.source === sourceId && highlights.currentEdge?.target === targetId) return '#facc15'; // yellow-400
                    if (highlights.rejectedEdge?.source === sourceId && highlights.rejectedEdge?.target === targetId) return '#ef4444'; // red-500
                } else { // SSSP
                    if (highlights.currentEdge?.source === sourceId && highlights.currentEdge?.target === targetId) return '#f97316'; // orange-500
                }
                return '#9ca3af'; // gray-400
            })
            .attr('stroke-width', d => {
                 const sourceId = (d.source as D3Node).id;
                 const targetId = (d.target as D3Node).id;
                 if (isMST && highlights.mstEdges?.some(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId))) return 5;
                 return 3;
            })
            .attr('marker-end', isMST ? '' : 'url(#arrowhead)');
            
        // --- Link Weights ---
        const linkText = svg.append("g").selectAll("text")
            .data(links)
            .enter().append("text")
            .attr("class", "dark:fill-gray-300 fill-gray-700 font-sans font-semibold text-sm")
            .text(d => d.weight);

        // FIX: Moved drag function definition before its usage to resolve the "used before its declaration" error.
        const drag = (simulation: d3.Simulation<D3Node, undefined>) => {
            function dragstarted(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x!;
                d.fy = d.y!;
            }
            function dragged(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>, d: D3Node) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag<SVGCircleElement, D3Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

        // --- Nodes ---
        const node = svg.append('g').selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', NODE_RADIUS)
            .attr('class', d => {
                if (highlights.currentNodeId === d.id) return 'fill-highlight';
                return 'fill-primary-500';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .call(drag(simulation) as any);

        // --- Node IDs ---
        const nodeIdText = svg.append("g").selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("text-anchor", "middle")
            .attr("dy", isMST ? ".3em" : "-0.2em")
            .attr("class", "fill-white font-bold text-lg select-none")
            .text(d => d.id);
        
        // --- Node Distances (for SSSP) ---
        let nodeDistText: d3.Selection<d3.BaseType, D3Node, SVGGElement, unknown> | null = null;
        if (!isMST) {
            nodeDistText = svg.append("g").selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "1.2em")
                .attr("class", "fill-white font-semibold text-sm select-none")
                .text(d => `d: ${highlights.distances ? highlights.distances[d.id] : '∞'}`);
        }

        simulation.on('tick', () => {
            link.attr('d', d => {
                const source = d.source as D3Node;
                const target = d.target as D3Node;
                return `M${source.x},${source.y} L${target.x},${target.y}`;
            });
            node.attr('cx', d => d.x!).attr('cy', d => d.y!);
            
            nodeIdText.attr("x", d => d.x!).attr("y", d => d.y!);
            
            linkText
                .attr("x", d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
                .attr("y", d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

            if (nodeDistText) {
                nodeDistText.attr("x", d => d.x!).attr("y", d => d.y!);
            }
        });

    }, [nodes, links, dimensions, highlights, isMST]);

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
    );
};

export default GraphVisualizer;