import { AgentService } from './AgentService';

/**
 * System Instructions for the HOI4 Modding AI.
 * This ensures the model behaves as a Paradox Interactive script expert.
 */
const SYSTEM_INSTRUCTION = `
You are an expert Hearts of Iron 4 (HOI4) modding assistant.
You specialize in Clausewitz script syntax and historical narrative writing for mods.

GUIDELINES:
1. SCRIPT SYNTAX: Use HOI4 script syntax. Example: focus = { id = name ... completion_reward = { add_political_power = 100 } }.
2. HISTORICAL TONE: When writing descriptions, use a formal, historical, and dramatic tone consistent with HOI4.
3. CONTEXT AWARENESS: Consider the "Base Mod" context (e.g., 1936 vs Millennium Dawn).
4. EFFICIENCY: Keep responses concise and focused on the requested code block or text.
`;

export const GenerativeService = {
  /**
   * Generates a historical description for a focus node.
   */
  async generateFocusNarrative(focusName: string, baseMod: string): Promise<string> {
    try {
      const prompt = `Write a short, dramatic, and historically appropriate description for a HOI4 focus tree node titled "${focusName}". The mod's base is "${baseMod}". Output only the description text.`;
      const { response } = await AgentService.executeTask('narrative', prompt, SYSTEM_INSTRUCTION);
      return response;
    } catch (error) {
      console.error('[AI] Error generating narrative:', error);
      return 'AI failed to generate narrative. Please write manually.';
    }
  },

  /**
   * Generates a Clausewitz script block (rewards, triggers, etc.)
   */
  async generateClausewitzScript(intent: string, context: string): Promise<string> {
    try {
      const prompt = `Generate a HOI4 Clausewitz script block for the following intent: "${intent}". 
      Context: ${context}. 
      Output ONLY the code block, no markdown formatting if possible, just the script.`;

      const { response } = await AgentService.executeTask('scripting', prompt, SYSTEM_INSTRUCTION);

      // Clean up markdown if the model included it
      return response.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '');
    } catch (error) {
      console.error('[AI] Error generating script:', error);
      return '# AI failed to generate script.';
    }
  },

  /**
   * Translates text to a target language while keeping historical context.
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Translate the following Hearts of Iron 4 modding text to ${targetLanguage}. 
      Text: "${text}". 
      Maintain a historical and formal tone. Keep proper names or specialized terms if they are usually kept in that language (e.g., German military terms). 
      Output ONLY the translated text.`;

      const { response } = await AgentService.executeTask('narrative', prompt, SYSTEM_INSTRUCTION);
      return response;
    } catch (error) {
      console.error('[AI] Error translating text:', error);
      return text; // Return original on error
    }
  },
};
