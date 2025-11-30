"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GraphData, GraphNode } from "@/types";

interface FloatingGraphProps {
  graph: GraphData;
  currentSlug: string;
  onNodeClick: (slug: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

interface NodePosition {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isCurrent: boolean;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const NODE_RADIUS = 6;
const CURRENT_NODE_RADIUS = 10;
const LINK_DISTANCE = 60;
const REPULSION_STRENGTH = 400;
const CENTER_STRENGTH = 0.05;
const DAMPING = 0.9;
const ITERATIONS = 100;

const EXPANDED_WIDTH = 220;
const EXPANDED_HEIGHT = 160;
const COLLAPSED_SIZE = 40;

export function FloatingGraph({
  graph,
  currentSlug,
  onNodeClick,
  expanded,
  onToggle,
}: FloatingGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Simple force-directed layout simulation
  const simulateLayout = useCallback(
    (
      nodes: GraphNode[],
      edges: { source: string; target: string }[],
      width: number,
      height: number
    ): NodePosition[] => {
      if (nodes.length === 0) return [];

      const centerX = width / 2;
      const centerY = height / 2;

      const nodePositions: NodePosition[] = nodes.map((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length;
        const radius = Math.min(width, height) / 4;
        return {
          id: node.id,
          title: node.title,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          vx: 0,
          vy: 0,
          isCurrent: node.id === currentSlug,
        };
      });

      const currentNode = nodePositions.find((n) => n.isCurrent);
      if (currentNode) {
        currentNode.x = centerX;
        currentNode.y = centerY;
      }

      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < nodePositions.length; i++) {
          for (let j = i + 1; j < nodePositions.length; j++) {
            const nodeA = nodePositions[i];
            const nodeB = nodePositions[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = REPULSION_STRENGTH / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            nodeA.vx -= fx;
            nodeA.vy -= fy;
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }

        edges.forEach((edge) => {
          const source = nodePositions.find((n) => n.id === edge.source);
          const target = nodePositions.find((n) => n.id === edge.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - LINK_DISTANCE) * 0.1;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        nodePositions.forEach((node) => {
          const strength = node.isCurrent ? CENTER_STRENGTH * 3 : CENTER_STRENGTH;
          node.vx += (centerX - node.x) * strength;
          node.vy += (centerY - node.y) * strength;

          node.vx *= DAMPING;
          node.vy *= DAMPING;
          node.x += node.vx;
          node.y += node.vy;

          const padding = 15;
          node.x = Math.max(padding, Math.min(width - padding, node.x));
          node.y = Math.max(padding, Math.min(height - padding, node.y));
        });
      }

      return nodePositions;
    },
    [currentSlug]
  );

  useEffect(() => {
    if (graph.nodes.length > 0 && expanded) {
      const newPositions = simulateLayout(
        graph.nodes,
        graph.edges,
        EXPANDED_WIDTH,
        EXPANDED_HEIGHT
      );
      setPositions(newPositions);
    }
  }, [graph, expanded, simulateLayout]);

  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [currentSlug]);

  const edgeLines = useMemo(() => {
    return graph.edges
      .map((edge) => {
        const source = positions.find((p) => p.id === edge.source);
        const target = positions.find((p) => p.id === edge.target);
        if (source && target) {
          return { source, target, key: `${edge.source}-${edge.target}` };
        }
        return null;
      })
      .filter(Boolean) as {
      source: NodePosition;
      target: NodePosition;
      key: string;
    }[];
  }, [graph.edges, positions]);

  const handleReset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      }
    },
    [transform.x, transform.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setTransform((t) => ({
          ...t,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        }));
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.5, Math.min(3, t.scale * delta)),
    }));
  }, []);

  if (graph.nodes.length === 0) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-4 right-4 rounded-lg shadow-xl border border-white/20 overflow-hidden transition-all duration-200 bg-black/70 backdrop-blur-sm`}
      style={{
        width: expanded ? EXPANDED_WIDTH : COLLAPSED_SIZE,
        height: expanded ? EXPANDED_HEIGHT : COLLAPSED_SIZE,
      }}
    >
      {expanded ? (
        <>
          {/* Graph area */}
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className="overflow-visible"
            >
              <g
                transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
                style={{ transformOrigin: "center center" }}
              >
                {/* Edges */}
                {edgeLines.map(({ source, target, key }) => (
                  <line
                    key={key}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth={1}
                  />
                ))}

                {/* Nodes */}
                {positions.map((node) => {
                  const isHovered = hoveredNode === node.id;
                  const radius = node.isCurrent ? CURRENT_NODE_RADIUS : NODE_RADIUS;
                  const displayRadius = isHovered ? radius * 1.3 : radius;

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={displayRadius}
                        fill={node.isCurrent ? "#7b2cbf" : "#4a4a6a"}
                        stroke={
                          isHovered
                            ? "#c77dff"
                            : node.isCurrent
                            ? "#c77dff"
                            : "transparent"
                        }
                        strokeWidth={2}
                        className="cursor-pointer transition-all duration-150"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNodeClick(node.id);
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      />

                      {isHovered && (
                        <g>
                          <rect
                            x={node.x - node.title.length * 3}
                            y={node.y - displayRadius - 20}
                            width={node.title.length * 6 + 8}
                            height={16}
                            rx={3}
                            fill="rgba(0, 0, 0, 0.9)"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth={1}
                          />
                          <text
                            x={node.x}
                            y={node.y - displayRadius - 9}
                            textAnchor="middle"
                            fill="white"
                            fontSize={9}
                            fontFamily="Inter, sans-serif"
                          >
                            {node.title}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Floating controls inside the graph */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={handleReset}
              className="p-1.5 bg-black/50 hover:bg-black/70 text-white/60 hover:text-white rounded transition-colors"
              title="Reset view"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 bg-black/50 hover:bg-black/70 text-white/60 hover:text-white rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        /* Collapsed state */
        <button
          onClick={onToggle}
          className="w-full h-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
          title="Expand graph"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <circle cx="6" cy="9" r="2" strokeWidth={1.5} />
            <circle cx="18" cy="9" r="2" strokeWidth={1.5} />
            <circle cx="6" cy="15" r="2" strokeWidth={1.5} />
            <circle cx="18" cy="15" r="2" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeWidth={1} d="M8 10l2 1M16 10l-2 1M8 14l2-1M16 14l-2-1" />
          </svg>
        </button>
      )}
    </div>
  );
}
