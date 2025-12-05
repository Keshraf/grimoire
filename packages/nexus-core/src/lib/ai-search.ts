import type { Note, AISearchResult, SearchResult } from "@/types";

export interface AISearchOptions {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  maxTokens?: number;
}

const MAX_CONTEXT_CHARS = 12000; // ~4000 tokens

function buildContext(notes: Note[]): string {
  let context = "";
  for (const note of notes) {
    const noteText = `## ${note.title}\n${note.content}\n\n`;
    if (context.length + noteText.length > MAX_CONTEXT_CHARS) break;
    context += noteText;
  }
  return context;
}

function buildSystemPrompt(context: string): string {
  return `You are a helpful assistant that answers questions based ONLY on the provided notes. 
If the answer cannot be found in the notes, say "I couldn't find information about that in your notes."
Always be concise and cite which note(s) you used.

Here are the notes:

${context}`;
}

export async function aiSearch(
  question: string,
  relevantNotes: Note[],
  options: AISearchOptions
): Promise<AISearchResult> {
  const { provider, apiKey, maxTokens = 500 } = options;

  if (!relevantNotes.length) {
    return {
      answer: "No relevant notes found to answer your question.",
      sources: [],
    };
  }

  // Take top 5 most relevant notes
  const topNotes = relevantNotes.slice(0, 5);
  const context = buildContext(topNotes);
  const systemPrompt = buildSystemPrompt(context);

  try {
    let answer: string;

    if (provider === "openai") {
      answer = await callOpenAI(systemPrompt, question, apiKey, maxTokens);
    } else if (provider === "gemini") {
      answer = await callGemini(systemPrompt, question, apiKey, maxTokens);
    } else {
      answer = await callAnthropic(systemPrompt, question, apiKey, maxTokens);
    }

    // Build sources from the notes used
    const sources: SearchResult[] = topNotes.map((note, index) => ({
      title: note.title,
      excerpt: note.content.slice(0, 100) + "...",
      score: 1 - index * 0.1,
    }));

    return { answer, sources };
  } catch (error) {
    console.error("AI search error:", error);
    throw new Error("Failed to generate AI answer");
  }
}

async function callOpenAI(
  systemPrompt: string,
  question: string,
  apiKey: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated.";
}

async function callAnthropic(
  systemPrompt: string,
  question: string,
  apiKey: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "No response generated.";
}

async function callGemini(
  systemPrompt: string,
  question: string,
  apiKey: string,
  maxTokens: number
): Promise<string> {
  const model = "gemini-2.0-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nQuestion: ${question}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."
  );
}
