import { useModStore } from '../store/useModStore';
import { OllamaService } from './OllamaService';
import { model as geminiModel } from './firebase';

/**
 * Agent Service (Orchestrator)
 * Decides which AI provider and specialist agent to use for a given task.
 */

export type AgentTask = 'narrative' | 'scripting' | 'validation';

// ─── Keyword dictionaries for intent routing ───────────────────────────────
const SCRIPTING_KEYWORDS = [
  'script', 'code', 'syntax', 'trigger', 'effect', 'immediate', 'modifier',
  'clausewitz', 'reward', 'completion_reward', 'on_complete', 'scripted',
  '{', '}', '=', 'add_', 'set_', 'has_', 'country_event', 'news_event',
  'generate', 'write code', 'create a trigger', 'create an effect',
  'hoi4 script', 'focus script', 'event script', 'option script',
];

const VALIDATION_KEYWORDS = [
  'check', 'error', 'bug', 'fix', 'validate', 'valid', 'correct', 'broken',
  'wrong', 'debug', 'crash', 'problem', 'issue', 'review', 'syntax error',
  'this script', 'is this correct', 'find the error', 'what is wrong',
  'analyze', 'missing bracket', 'balance',
];

const NARRATIVE_KEYWORDS = [
  'story', 'narrative', 'description', 'title', 'historical', 'lore',
  'background', 'write', 'tell', 'flavor', 'immersive', 'alt-history',
  'alt history', 'event text', 'focus text', 'event name', 'generate a name',
  'suggest a name', 'how would', 'what happened', 'context',
];

export const AgentService = {
  /**
   * Identifies the most appropriate agent task for a given prompt using weighted keyword matching.
   */
  identifyTask(prompt: string): AgentTask {
    const lower = prompt.toLowerCase();

    let validationScore = 0;
    let scriptingScore = 0;
    let narrativeScore = 0;

    VALIDATION_KEYWORDS.forEach(k => { if (lower.includes(k)) validationScore++; });
    SCRIPTING_KEYWORDS.forEach(k => { if (lower.includes(k)) scriptingScore++; });
    NARRATIVE_KEYWORDS.forEach(k => { if (lower.includes(k)) narrativeScore++; });

    // Validation takes priority when checking existing code
    if (validationScore > 0 && validationScore >= scriptingScore) return 'validation';
    if (scriptingScore > narrativeScore) return 'scripting';
    return 'narrative'; // Default specialist
  },

  /**
   * Routes a request to the appropriate specialist agent.
   */
  async executeTask(
    task: AgentTask,
    prompt: string,
    systemInstruction?: string
  ): Promise<{ response: string; agent: string }> {
    const { agentSettings } = useModStore.getState();

    // Determine provider and model for this task
    let provider: string = agentSettings.narrativeProvider || 'ollama';
    let model = agentSettings.ollamaModel || 'llama3';

    if (agentSettings.teamModeEnabled) {
      if (task === 'narrative') {
        provider = agentSettings.narrativeProvider;
        model = agentSettings.narrativeModel || model;
      } else if (task === 'scripting') {
        provider = agentSettings.scriptingProvider;
        model = agentSettings.scriptingModel || model;
      } else if (task === 'validation') {
        provider = agentSettings.validationProvider;
        model = agentSettings.validationModel || model;
      }
    } else {
      // Single-agent mode uses the global ollamaModel
      model = agentSettings.ollamaModel || 'llama3';
      provider = 'ollama';
    }

    const personality = agentSettings.personalities[task];
    const displayModel = provider === 'ollama' ? model : 'Gemini';
    const agentName = `${personality?.name ?? task} · ${displayModel}`;

    // ── Ollama path ────────────────────────────────────────────────────────
    if (provider === 'ollama') {
      try {
        console.log(`[AgentService] ▶ "${task}" → Local Ollama (${model})`);
        const response = await OllamaService.generate(
          { model, prompt, system: systemInstruction },
          agentSettings.ollamaEndpoint
        );
        return { response, agent: agentName };
      } catch (error: unknown) {
        const ollamaMessage = error instanceof Error ? error.message : 'Unknown Ollama error';
        console.warn(`[AgentService] Ollama failed for "${task}":`, ollamaMessage);

        if (
          ollamaMessage.includes('Failed to fetch') ||
          ollamaMessage.includes('NetworkError') ||
          ollamaMessage.includes('CORS')
        ) {
          throw new Error(
            `❌ Cannot connect to Ollama at ${agentSettings.ollamaEndpoint}.\n\n` +
            `Make sure:\n` +
            `1. Ollama is running (ollama serve)\n` +
            `2. The env variable OLLAMA_ORIGINS="*" is set\n` +
            `3. The model "${model}" is pulled (ollama pull ${model})`
          );
        }

        // Try Gemini fallback
        try {
          console.log(`[AgentService] ⚡ Fallback → Gemini`);
          const response = await this.executeWithGemini(prompt, systemInstruction);
          return { response, agent: `Gemini (fallback from ${model})` };
        } catch (geminiError: unknown) {
          const geminiMessage = geminiError instanceof Error ? geminiError.message : 'Unknown Gemini fallback error';
          if (geminiMessage.includes('api-not-enabled')) {
            throw new Error(
              `⚠️ Both AI providers failed.\n` +
              `• Ollama: ${ollamaMessage}\n` +
              `• Gemini: Firebase AI API not enabled.\n\n` +
              `Please run Ollama locally or enable Gemini in the Firebase console.`
            );
          }
          throw geminiError;
        }
      }
    }

    // ── Gemini path ────────────────────────────────────────────────────────
    try {
      console.log(`[AgentService] ▶ "${task}" → Remote Gemini`);
      const response = await this.executeWithGemini(prompt, systemInstruction);
      return { response, agent: agentName };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      if (message.includes('api-not-enabled')) {
        throw new Error(
          '⚠️ Gemini API is not enabled in your Firebase project.\n' +
          'Please switch to Local AI (Ollama) in Settings, or enable the Firebase AI API.'
        );
      }
      throw error;
    }
  },

  /**
   * Private helper to call Gemini via Firebase AI SDK.
   */
  async executeWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
    if (!geminiModel) {
      throw new Error('Gemini model not initialized. Please check Firebase configuration.');
    }
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction,
    });
    return result.response.text().trim();
  },
};
