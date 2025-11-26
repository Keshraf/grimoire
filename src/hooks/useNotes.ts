import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { Note, NoteWithLinks } from "@/types";
import { extractOutlinks, renderMarkdown } from "@/lib/markdown";

// Re-export for provider setup
export { QueryClient, QueryClientProvider };

// Query keys
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  detail: (slug: string) => [...noteKeys.all, "detail", slug] as const,
};

// API response types
interface NotesResponse {
  data: Note[];
  error?: string;
}

interface NoteResponse {
  data: Note & { backlinks?: string[] };
  error?: string;
}

// Input types for mutations
export interface CreateNoteInput {
  title: string;
  content?: string;
  slug?: string;
  tags?: string[];
  section?: string;
  order?: number;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  section?: string;
  order?: number;
}

// API functions
async function fetchNotes(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  const json: NotesResponse = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch notes");
  return json.data;
}

async function fetchNote(slug: string): Promise<NoteWithLinks> {
  const res = await fetch(`/api/notes/${slug}`);
  const json: NoteResponse = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch note");

  const note = json.data;
  const outlinks = extractOutlinks(note.content);
  const html = await renderMarkdown(note.content);

  return {
    ...note,
    outlinks,
    backlinks: note.backlinks || [],
    html,
  };
}

async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create note");
  return json.data;
}

async function updateNote(slug: string, input: UpdateNoteInput): Promise<Note> {
  const res = await fetch(`/api/notes/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update note");
  return json.data;
}

async function deleteNote(slug: string): Promise<void> {
  const res = await fetch(`/api/notes/${slug}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to delete note");
  }
}

/**
 * Fetch all notes
 */
export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: fetchNotes,
  });
}

/**
 * Fetch single note with backlinks and rendered HTML
 */
export function useNote(slug: string) {
  return useQuery({
    queryKey: noteKeys.detail(slug),
    queryFn: () => fetchNote(slug),
    enabled: !!slug,
  });
}

/**
 * Create a new note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/**
 * Update an existing note
 */
export function useUpdateNote(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/**
 * Delete a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
