import type { Note, GraphData, GraphNode, GraphEdge } from "@/types";
import { extractOutlinks } from "./markdown";

/**
 * Build graph data (nodes and edges) from notes
 */
export function buildGraphData(notes: Note[]): GraphData {
  const titleToNote = new Map(notes.map((n) => [n.title, n]));
  const connectionCount = new Map<string, number>();

  // Initialize connection counts
  notes.forEach((n) => connectionCount.set(n.title, 0));

  // Build edges and count connections
  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();

  notes.forEach((note) => {
    const outlinks = extractOutlinks(note.content);
    outlinks.forEach((target) => {
      // Only create edge if target note exists
      if (titleToNote.has(target)) {
        const edgeKey = [note.title, target].sort().join("--");
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edges.push({ source: note.title, target });
          connectionCount.set(
            note.title,
            (connectionCount.get(note.title) || 0) + 1
          );
          connectionCount.set(target, (connectionCount.get(target) || 0) + 1);
        }
      }
    });
  });

  // Build nodes (use title as the id)
  const nodes: GraphNode[] = notes.map((note) => ({
    id: note.title,
    title: note.title,
    connections: connectionCount.get(note.title) || 0,
  }));

  return { nodes, edges };
}

/**
 * Get local graph filtered to direct connections of a note
 */
export function getLocalGraph(title: string, notes: Note[]): GraphData {
  const fullGraph = buildGraphData(notes);

  // Find directly connected titles
  const connectedTitles = new Set<string>([title]);
  fullGraph.edges.forEach((edge) => {
    if (edge.source === title) connectedTitles.add(edge.target);
    if (edge.target === title) connectedTitles.add(edge.source);
  });

  // Filter nodes and edges
  const nodes = fullGraph.nodes.filter((n) => connectedTitles.has(n.id));
  const edges = fullGraph.edges.filter(
    (e) => connectedTitles.has(e.source) && connectedTitles.has(e.target)
  );

  return { nodes, edges };
}
