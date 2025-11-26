"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GraphData, GraphNode } from "@/types";

interface LocalGraphProps {
  graph: GraphData;
  currentSlug: string;
  onNodeClick: (slug: string) => void;
  expanded: boolean;
  onToggle: () => void;
  height?: number;
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

interface EdgePosition {
  source: string;
  target: string;
}

const NODE_RADIUS = 8;
const CURRENT_NODE_RADIUS = 12;
const LINK_DISTANCE = 80;
const REPULSION_STRENGTH = 500;
const CENTER_STRENGTH = 0.05;
const DAMPING = 0.9;
const ITERATIONS = 100;

export function LocalGraph({
  graph,
  currentSlug,
  onNodeClick,
  expanded,
  onToggle,
  height = 200,
}: LocalGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<NodePosition[]>([]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [height]);

  // Simple force-directed layout simulation
  const simulateLayout = useCallback(
    (
      nodes: GraphNode[],
      edges: EdgePosition[],
      width: number,
      height: number
    ): NodePosition[] => {
      if (nodes.length === 0) return [];

      const centerX = width / 2;
      const centerY = height / 2;

      // Initialize positions in a circle around center
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

      // Place current node at center
      const currentNode = nodePositions.find((n) => n.isCurrent);
      if (currentNode) {
        currentNode.x = centerX;
        currentNode.y = centerY;
      }

      // Run simulation iterations
      for (let iter = 0; iter < ITERATIONS; iter++) {
        // Apply repulsion between all nodes
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

        // Apply attraction along edges
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

        // Apply centering force and update positions
        nodePositions.forEach((node) => {
          // Keep current node more centered
          const strength = node.isCurrent
            ? CENTER_STRENGTH * 3
            : CENTER_STRENGTH;
          node.vx += (centerX - node.x) * strength;
          node.vy += (centerY - node.y) * strength;

          // Apply velocity with damping
          node.vx *= DAMPING;
          node.vy *= DAMPING;
          node.x += node.vx;
          node.y += node.vy;

          // Keep within bounds
          const padding = 20;
          node.x = Math.max(padding, Math.min(width - padding, node.x));
          node.y = Math.max(padding, Math.min(height - padding, node.y));
        });
      }

      return nodePositions;
    },
    [currentSlug]
  );

  // Compute layout when graph or dimensions change
  useEffect(() => {
    if (graph.nodes.length > 0 && dimensions.width > 0) {
      const newPositions = simulateLayout(
        graph.nodes,
        graph.edges,
        dimensions.width,
        dimensions.height
      );
      setPositions(newPositions);
    }
  }, [graph, dimensions, simulateLayout]);

  // Memoize edge positions for rendering
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

  if (graph.nodes.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-white/10">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Local Graph
        </span>
        <span className="text-xs text-white/50">
          {graph.nodes.length} nodes
        </span>
      </button>

      {/* Graph container */}
      {expanded && (
        <div
          ref={containerRef}
          className="w-full bg-black/20"
          style={{ height }}
        >
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Edges */}
            {edgeLines.map(({ source, target, key }) => (
              <line
                key={key}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(255, 255, 255, 0.2)"
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
                  {/* Node circle */}
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
                    onClick={() => onNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={node.x - node.title.length * 4}
                        y={node.y - displayRadius - 28}
                        width={node.title.length * 8 + 12}
                        height={22}
                        rx={4}
                        fill="rgba(0, 0, 0, 0.85)"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth={1}
                      />
                      <text
                        x={node.x}
                        y={node.y - displayRadius - 13}
                        textAnchor="middle"
                        fill="white"
                        fontSize={12}
                        fontFamily="Inter, sans-serif"
                      >
                        {node.title}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
