import type { Note, GraphData, GraphNode, GraphEdge } from "@/types";
import { extractOutlinks } from "./markdown";

/**
 * Build graph data (nodes and edges) from notes
 */
export function buildGraphData(notes: Note[]): GraphData {
  const slugToNote = new Map(notes.map((n) => [n.slug, n]));
  const connectionCount = new Map<string, number>();

  // Initialize connection counts
  notes.forEach((n) => connectionCount.set(n.slug, 0));

  // Build edges and count connections
  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();

  notes.forEach((note) => {
    const outlinks = extractOutlinks(note.content);
    outlinks.forEach((target) => {
      // Only create edge if target note exists
      if (slugToNote.has(target)) {
        const edgeKey = [note.slug, target].sort().join("--");
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edges.push({ source: note.slug, target });
          connectionCount.set(
            note.slug,
            (connectionCount.get(note.slug) || 0) + 1
          );
          connectionCount.set(target, (connectionCount.get(target) || 0) + 1);
        }
      }
    });
  });

  // Build nodes
  const nodes: GraphNode[] = notes.map((note) => ({
    id: note.slug,
    title: note.title,
    connections: connectionCount.get(note.slug) || 0,
  }));

  return { nodes, edges };
}

/**
 * Get local graph filtered to direct connections of a note
 */
export function getLocalGraph(slug: string, notes: Note[]): GraphData {
  const fullGraph = buildGraphData(notes);

  // Find directly connected slugs
  const connectedSlugs = new Set<string>([slug]);
  fullGraph.edges.forEach((edge) => {
    if (edge.source === slug) connectedSlugs.add(edge.target);
    if (edge.target === slug) connectedSlugs.add(edge.source);
  });

  // Filter nodes and edges
  const nodes = fullGraph.nodes.filter((n) => connectedSlugs.has(n.id));
  const edges = fullGraph.edges.filter(
    (e) => connectedSlugs.has(e.source) && connectedSlugs.has(e.target)
  );

  return { nodes, edges };
}
