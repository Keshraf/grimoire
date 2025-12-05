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

// Query keys - now use title instead of slug
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  detail: (title: string) => [...noteKeys.all, "detail", title] as const,
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

async function fetchNote(title: string): Promise<NoteWithLinks> {
  const res = await fetch(`/api/notes/${encodeURIComponent(title)}`);
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

async function updateNote(title: string, input: UpdateNoteInput): Promise<Note> {
  const res = await fetch(`/api/notes/${encodeURIComponent(title)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update note");
  return json.data;
}

async function deleteNote(title: string): Promise<void> {
  const res = await fetch(`/api/notes/${encodeURIComponent(title)}`, { method: "DELETE" });
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
export function useNote(title: string) {
  return useQuery({
    queryKey: noteKeys.detail(title),
    queryFn: () => fetchNote(title),
    enabled: !!title,
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
export function useUpdateNote(title: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(title, input),
    onSuccess: (updatedNote: Note) => {
      // Always invalidate the original title's cache
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(title) });

      // If title changed, also invalidate the new title's cache
      if (updatedNote.title !== title) {
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(updatedNote.title) });
      }

      // Invalidate all note lists and details to ensure backlinks are updated
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
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
      // Invalidate ALL note queries (lists and details) so backlink changes are reflected
      // When a note is deleted, other notes' content is updated to remove [[links]] to it
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
