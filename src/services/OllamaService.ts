/**
 * Ollama Service
 * Handles communication with the local Ollama AI instance.
 */

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  system?: string;
  options?: Record<string, unknown>;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export const OllamaService = {
  /**
   * Generates a response using the Ollama API.
   */
  async generate(request: OllamaRequest, endpoint: string = 'http://localhost:11434'): Promise<string> {
    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false, // Default to non-streaming for simplicity in this version
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response.trim();
    } catch (_err) {
      console.error("[Ollama] Error communicating with local AI:", _err);
      throw _err;
    }
  },

  /**
   * Verifies if Ollama is running and accessible.
   */
  async checkStatus(endpoint: string = 'http://localhost:11434'): Promise<boolean> {
    try {
      const response = await fetch(`${endpoint}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Lists available models from the local Ollama instance.
   */
  async listModels(endpoint: string = 'http://localhost:11434'): Promise<string[]> {
    try {
      const response = await fetch(`${endpoint}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json() as { models?: Array<{ name: string }> };
      return data.models?.map((m) => m.name) || [];
    } catch (_err) {
      console.error("[Ollama] Error listing models:", _err);
      return [];
    }
  },

  /**
   * Chat interaction with the local AI.
   */
  async chat(messages: { role: string, content: string }[], model: string, endpoint: string = 'http://localhost:11434'): Promise<string> {
    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false
        }),
      });

      if (!response.ok) throw new Error(`Ollama Chat error: ${response.statusText}`);

      const data = await response.json();
      return data.message.content.trim();
    } catch (_err) {
      console.error("[Ollama] Error in chat session:", _err);
      throw _err;
    }
  }
};
