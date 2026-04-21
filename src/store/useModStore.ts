import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges
} from 'reactflow';
import type {
  Node, 
  Edge, 
  Connection, 
  NodeChange,
  EdgeChange
} from 'reactflow';
import type { BaseModType } from '../data/modDictionaries';
import type { Language } from '../data/translations';

// ---- Tipos para Eventos ----
export interface EventOption {
  id?: string;
  name: string;
  effect: string;
}

export interface HoiEvent {
  id: string;
  title: string;
  desc: string;
  picture: string;
  isTriggeredOnly: boolean;
  fireOnlyOnce?: boolean;
  hidden?: boolean;
  mtth?: number; // mean_time_to_happen in days
  trigger?: string;
  immediate?: string;
  options: EventOption[];
}

// ---- Tipos para Ideas Nacionales ----
export interface Modifier {
  id: string;
  type: string;
  value: string;
}

export interface NationalSpirit {
  id: string;
  name: string;
  picture: string; // ID o base64
  modifiers: Modifier[];
}

// ---- Tipos para Decisiones ----
export interface DecisionEffect {
  id: string;
  type: string;
  value: string;
}

export interface Decision {
  id: string;
  name: string;
  cost: number;
  trigger: string;
  effects: DecisionEffect[];
}

export interface DecisionCategory {
  id: string;
  name: string;
  icon: string;
  decisions: Decision[];
}

// ---- Tipos para Líderes ----
export interface LeaderTrait {
  id: string;
  name: string;
}

export interface Leader {
  id: string;
  name: string;
  picture: string; // Base64
  ideology: string;
  traits: LeaderTrait[];
}

// ---- Tipos para Localización ----
export interface LocalizationEntry {
  id: string;
  key: string;
  english: string;
  spanish: string;
  french: string;
}

// ---- Tipos para Macros ----
export interface ScriptedMacro {
  id: string;
  name: string;
  type: 'trigger' | 'effect';
  code: string;
}

// ---- Tipos para Estados ----
export interface HoiState {
  id: string;
  name: string;
  manpower: number;
  category: string;
  provinces: string; // IDs separados por espacios
  owner: string;
}

// ---- Tipos para Divisiones ----
export interface DivisionTemplate {
  id: string;
  name: string;
  regiments: (string | null)[][]; // 5 filas x 5 columnas
  support: (string | null)[]; // 5 ranuras
}

export interface DivisionInstance {
  id: string;
  templateId: string;
  name: string;
  location: string;
}

export interface Army {
  id: string;
  name: string;
  divisions: DivisionInstance[];
}

export interface ArmyGroup {
  id: string;
  name: string;
  armies: Army[];
}

// ---- Tipos para Economía (Millennium Dawn) ----
export interface EconomyConfig {
  countryTag: string;
  economyType: string;
  gdp: number;
  gdpPerCapita: number;
  corporateTax: number;
  populationTax: number;
  debt: number;
  debtInterest: number;
  corruptionLevel: number;
  foreignInvestmentFactor: number;
}

// ---- Tipos para Misiles (Millennium Dawn) ----
export type MissileCategory = 'ballistic' | 'cruise' | 'tactical' | 'anti_ballistic';
export interface MissileType {
  id: string;
  name: string;
  category: MissileCategory;
  rangeKm: number;
  warheadYield: number;
  accuracy: number;
  silosRequired: number;
  gfxKey: string;
  requiresNuclear: boolean;
}

// ---- Tipos para Partidos Políticos (Kaiserreich) ----
export interface PoliticalParty {
  id: string;
  name: string;
  longName: string;
  ideology: string;
  popularity: number;
  rulingPartyName: string;
  leaderName: string;
  portrait: string;
  isRuling: boolean;
}

// ---- Tipos para Conflictos Civiles (Kaiserreich) ----
export type CivilWarType = 'ideology' | 'independence' | 'separatist' | 'faction';
export interface CivilConflict {
  id: string;
  name: string;
  warType: CivilWarType;
  rebelTag: string;
  rebelIdeology: string;
  rebelMilStrength: number;
  startingState: string;
  triggerScript: string;
  onStartEffect: string;
  onEndLoseEffect: string;
  onEndWinEffect: string;
}

// ---- Tipos para Monarquía (Road to 56) ----
export type MonarchyForm = 'constitutional' | 'absolute' | 'elective' | 'theocratic';
export type ClaimStrength = 'strong' | 'weak' | 'disputed';

export interface Pretender {
  id: string;
  name: string;
  title: string;
  countryOfOrigin: string;
  claimStrength: ClaimStrength;
  ideology: string;
  portrait: string;
  traitId: string;
  restoreEventId: string;
  decisionId: string;
}

export interface MonarchyConfig {
  countryTag: string;
  royalHouseName: string;
  monarchyForm: MonarchyForm;
  currentMonarchName: string;
  currentMonarchTitle: string;
  restoreDecisionCost: number;
  restoreRequiresWar: boolean;
  allowExile: boolean;
  pretenders: Pretender[];
}

// ---- Tipos para TNO (Variables y Caminos) ----
export type VariableScope = 'country' | 'state' | 'global' | 'unit_leader';
export type VariableOp = 'set_variable' | 'add_to_variable' | 'multiply_variable' | 'clamp_variable';
export interface TNOVariable {
  id: string;
  name: string;
  scope: VariableScope;
  op: VariableOp;
  value: number;
  comment: string;
  category: string;
}

export type PathAlignment = 'reformist' | 'hardliner' | 'moderate' | 'populist';
export interface SubPath {
  id: string;
  name: string;
  scriptId: string;
  alignment: PathAlignment;
  desc: string;
  triggerCondition: string;
  onEnterEffect: string;
}
export interface IdeologyPath {
  id: string;
  rootIdeology: string;
  displayName: string;
  color: string;
  subPaths: SubPath[];
}

// ---- Tipos para Agentes IA ----
export type AIProvider = 'gemini' | 'ollama';

export interface AgentSettings {
  teamModeEnabled: boolean;
  narrativeProvider: AIProvider;
  scriptingProvider: AIProvider;
  validationProvider: AIProvider;
  ollamaModel: string;
  narrativeModel: string;
  scriptingModel: string;
  validationModel: string;
  ollamaEndpoint: string;
  availableModels: string[]; // List of models fetched from Ollama
  personalities: {
    narrative: { name: string; prompt: string };
    scripting: { name: string; prompt: string };
    validation: { name: string; prompt: string };
  };
}

// ---- Estado Global ----
export interface ActiveAITarget {
  type: 'focus' | 'event' | 'tech' | 'none';
  id: string | null;
}

interface ModState {
  // Mod Context
  baseMod: BaseModType;
  setBaseMod: (mod: BaseModType) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  workMode: 'normal' | 'advanced';
  setWorkMode: (mode: 'normal' | 'advanced') => void;

  // AI Agent Settings
  agentSettings: AgentSettings;
  setAgentSettings: (settings: Partial<AgentSettings>) => void;
  fetchOllamaModels: () => Promise<void>;
  
  // AI Active Context
  activeAITarget: ActiveAITarget;
  setActiveAITarget: (target: ActiveAITarget) => void;
  getModContext: () => string;
  applyCodeToTarget: (code: string, fieldType: 'scripting' | 'narrative') => void;

  // File Explorer State
  activeFilePath: string | null;
  setActiveFilePath: (path: string | null) => void;

  // Focus Tree State
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  addFocusNode: () => void;
  deleteFocusNode: (id: string) => void;
  clearFocusTree: () => void;

  // Events State
  events: HoiEvent[];
  activeEventIndex: number;
  setActiveEventIndex: (index: number) => void;
  addEvent: () => void;
  deleteEvent: (index: number) => void;
  updateActiveEvent: (updates: Partial<HoiEvent>) => void;
  updateEventById: (id: string, updates: Partial<HoiEvent>) => void;
  addOptionToActiveEvent: () => void;
  updateOptionInActiveEvent: (optionIndex: number, field: keyof EventOption, value: string) => void;
  removeOptionFromActiveEvent: (optionIndex: number) => void;
  setEvents: (events: HoiEvent[]) => void;

  // National Spirits State
  spirits: NationalSpirit[];
  activeSpiritIndex: number;
  setActiveSpiritIndex: (index: number) => void;
  addSpirit: () => void;
  deleteSpirit: (index: number) => void;
  updateActiveSpirit: (spiritData: Partial<NationalSpirit>) => void;
  addModifierToActiveSpirit: () => void;
  updateModifierInActiveSpirit: (modIndex: number, field: keyof Modifier, value: string) => void;
  removeModifierFromActiveSpirit: (modIndex: number) => void;
  setSpirits: (spirits: NationalSpirit[]) => void;

  // Decisions State
  decisionCategories: DecisionCategory[];
  activeCategoryIndex: number;
  activeDecisionIndex: number | null;
  setActiveCategoryIndex: (index: number) => void;
  setActiveDecisionIndex: (index: number | null) => void;
  addDecisionCategory: () => void;
  deleteDecisionCategory: (index: number) => void;
  updateActiveCategory: (data: Partial<DecisionCategory>) => void;
  addDecisionToActiveCategory: () => void;
  deleteDecisionFromActiveCategory: (decisionIndex: number) => void;
  updateActiveDecision: (data: Partial<Decision>) => void;
  setDecisionCategories: (categories: DecisionCategory[]) => void;

  // Leaders State
  leaders: Leader[];
  activeLeaderIndex: number;
  setActiveLeaderIndex: (index: number) => void;
  addLeader: () => void;
  deleteLeader: (index: number) => void;
  updateActiveLeader: (data: Partial<Leader>) => void;
  toggleTraitForActiveLeader: (trait: LeaderTrait) => void;
  setLeaders: (leaders: Leader[]) => void;

  // Localization State
  localizations: LocalizationEntry[];
  addLocalization: () => void;
  addLocalizationWithData: (data: LocalizationEntry) => void;
  updateLocalization: (index: number, data: Partial<LocalizationEntry>) => void;
  deleteLocalization: (index: number) => void;
  setLocalizations: (localizations: LocalizationEntry[]) => void;

  // Macros State
  macros: ScriptedMacro[];
  setMacros: (macros: ScriptedMacro[]) => void;
  activeMacroIndex: number;
  setActiveMacroIndex: (index: number) => void;
  addMacro: (type: 'trigger' | 'effect') => void;
  deleteMacro: (index: number) => void;
  updateActiveMacro: (data: Partial<ScriptedMacro>) => void;

  // States State
  states: HoiState[];
  setStates: (states: HoiState[]) => void;
  addState: () => void;
  updateState: (index: number, data: Partial<HoiState>) => void;
  deleteState: (index: number) => void;

  // Divisions State
  divisionTemplates: DivisionTemplate[];
  setDivisionTemplates: (templates: DivisionTemplate[]) => void;
  addDivisionTemplate: () => void;
  updateDivisionTemplate: (index: number, data: Partial<DivisionTemplate>) => void;
  deleteDivisionTemplate: (index: number) => void;

  // Army Hierarchy State
  armyGroups: ArmyGroup[];
  setArmyGroups: (groups: ArmyGroup[]) => void;
  addArmyGroup: () => void;
  updateArmyGroup: (index: number, data: Partial<ArmyGroup>) => void;
  deleteArmyGroup: (index: number) => void;
  addArmyToGroup: (groupIndex: number) => void;
  deleteArmyFromGroup: (groupIndex: number, armyIndex: number) => void;
  addDivisionToArmy: (groupIndex: number, armyIndex: number, templateId: string) => void;
  removeDivisionFromArmy: (groupIndex: number, armyIndex: number, divisionIndex: number) => void;

  // Economy State
  economyConfig: EconomyConfig;
  setEconomyConfig: (config: Partial<EconomyConfig>) => void;

  // Missiles State
  missiles: MissileType[];
  setMissiles: (missiles: MissileType[]) => void;

  // Tech Tree State (Reusable nodes/edges but specific for tech)
  techNodes: Node[];
  techEdges: Edge[];
  setTechNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setTechEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;

  // Political Parties State
  politicalParties: PoliticalParty[];
  setPoliticalParties: (parties: PoliticalParty[]) => void;

  // Civil Conflicts State
  civilConflicts: CivilConflict[];
  setCivilConflicts: (conflicts: CivilConflict[]) => void;

  // Monarchy State
  monarchyConfig: MonarchyConfig;
  setMonarchyConfig: (config: Partial<MonarchyConfig>) => void;

  // TNO States
  tnoVariables: TNOVariable[];
  setTnoVariables: (vars: TNOVariable[]) => void;
  tnoPaths: IdeologyPath[];
  setTnoPaths: (paths: IdeologyPath[]) => void;
}

const initialNodes: Node[] = [
  {
    id: 'focus-1',
    type: 'focus',
    position: { x: 250, y: 50 },
    data: { label: 'Rhineland', id: 'GER_rhineland', cost: 70 },
  },
  {
    id: 'focus-2',
    type: 'focus',
    position: { x: 100, y: 200 },
    data: { label: 'Army Innovations', id: 'GER_army_innovations', cost: 70 },
  },
  {
    id: 'focus-3',
    type: 'focus',
    position: { x: 400, y: 200 },
    data: { label: 'Four Year Plan', id: 'GER_four_year_plan', cost: 70 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'focus-1', target: 'focus-2', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e1-3', source: 'focus-1', target: 'focus-3', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
];

const initialEvent: HoiEvent = {
  id: 'country.1',
  title: 'An Important Decision',
  desc: 'The situation has escalated and requires our immediate attention. How shall we proceed?',
  picture: 'GFX_report_event_generic',
  isTriggeredOnly: true,
  options: [
    { id: 'opt-1', name: 'This means war!', effect: 'add_political_power = 100\ndeclare_war_on = FRA' }
  ]
};

const initialSpirit: NationalSpirit = {
  id: 'idea_1',
  name: 'New Idea',
  picture: 'generic_idea',
  modifiers: []
};

const initialDecisionCategory: DecisionCategory = {
  id: 'cat_1',
  name: 'New Category',
  icon: 'generic_icon',
  decisions: []
};

const initialLeader: Leader = {
  id: 'leader_1',
  name: 'New Leader',
  picture: '',
  ideology: 'fascism',
  traits: []
};

const initialLocalization: LocalizationEntry = {
  id: 'loc_1',
  key: 'new_loc_key',
  english: '',
  spanish: '',
  french: ''
};

const initialEconomy: EconomyConfig = {
  countryTag: 'GER',
  economyType: 'market_economy',
  gdp: 500,
  gdpPerCapita: 15000,
  corporateTax: 25,
  populationTax: 20,
  debt: 100,
  debtInterest: 2.5,
  corruptionLevel: 10,
  foreignInvestmentFactor: 1.0,
};

const initialDivisionTemplate: DivisionTemplate = {
  id: 'template_infantry_standard',
  name: 'Standard Infantry Division',
  regiments: [
    ['infantry', 'infantry', 'infantry', null, null],
    ['infantry', 'infantry', 'infantry', null, null],
    ['infantry', 'infantry', 'infantry', null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  support: ['engineer', 'recon', null, null, null]
};

const initialMonarchy: MonarchyConfig = {
  countryTag: 'GER',
  royalHouseName: 'Hohenzollern',
  monarchyForm: 'constitutional',
  currentMonarchName: 'Wilhelm III',
  currentMonarchTitle: 'Kaiser',
  restoreDecisionCost: 100,
  restoreRequiresWar: false,
  allowExile: true,
  pretenders: []
};

const initialAgentSettings: AgentSettings = {
  teamModeEnabled: false,
  narrativeProvider: 'ollama',
  scriptingProvider: 'ollama',
  validationProvider: 'ollama',
  ollamaModel: 'llama3',
  narrativeModel: 'llama3',
  scriptingModel: 'llama3',
  validationModel: 'llama3',
  ollamaEndpoint: 'http://localhost:11434',
  availableModels: [],
  personalities: {
    narrative: {
      name: 'Historical Historian',
      prompt: 'You are an expert HOI4 Historian. Your goal is to write immersive, flavor-rich, and historically authentic (or plausible alt-history) descriptions for events and focuses. Use dramatic but professional language.'
    },
    scripting: {
      name: 'Lead Scripter',
      prompt: 'You are a Senior HOI4 Scripter. You write clean, optimized, and bug-free Clausewitz script. You follow best practices for triggers and effects, ensuring high performance and compatibility.'
    },
    validation: {
      name: 'QA Specialist',
      prompt: 'You are a meticulous QA Specialist for HOI4 mods. You analyze scripts for syntax errors, logical loops, and potential crashes. You are direct and focus on code stability.'
    }
  }
};

const initialTnoVariables: TNOVariable[] = [
  { id: 'v1', name: 'tno_gdp', scope: 'country', op: 'set_variable', value: 500, comment: 'Starting GDP', category: 'Economy' },
  { id: 'v2', name: 'tno_legitimacy', scope: 'country', op: 'set_variable', value: 75, comment: '', category: 'Political' },
  { id: 'v3', name: 'tno_cold_war_tension', scope: 'global', op: 'set_variable', value: 40, comment: 'Global tension', category: 'Narrative' },
];

const initialParties: PoliticalParty[] = [
  { id: 'p1', name: 'SPA', longName: 'Syndicalist Party', ideology: 'syndicalist', popularity: 35, rulingPartyName: '', leaderName: '', portrait: '', isRuling: true },
  { id: 'p2', name: 'SPD', longName: 'Social Democratic Party', ideology: 'social_democrat', popularity: 20, rulingPartyName: '', leaderName: '', portrait: '', isRuling: false },
];

const initialConflicts: CivilConflict[] = [
  {
    id: 'civil_war_initial',
    name: 'Initial Civil Conflict',
    warType: 'ideology',
    rebelTag: 'REB',
    rebelIdeology: 'syndicalist',
    rebelMilStrength: 30,
    startingState: '64',
    triggerScript: 'has_stability < 0.30',
    onStartEffect: 'set_country_flag = civil_war_started',
    onEndLoseEffect: '',
    onEndWinEffect: '',
  }
];

export const useModStore = create<ModState>()(
  persist(
    (set, get) => ({
      // --- MOD CONTEXT ---
      baseMod: 'vanilla',
      setBaseMod: (mod) => set({ baseMod: mod }),
      projectName: 'My HOI4 Mod',
      setProjectName: (name) => set({ projectName: name }),
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      workMode: 'normal',
      setWorkMode: (mode) => set({ workMode: mode }),

      agentSettings: initialAgentSettings,
      setAgentSettings: (settings) => set((state) => {
        const merged: AgentSettings = {
          ...state.agentSettings,
          ...settings,
          // Always deep-merge personalities to avoid undefined fields from stale localStorage
          personalities: {
            ...initialAgentSettings.personalities,
            ...state.agentSettings.personalities,
            ...(settings.personalities ?? {}),
          },
        };
        return { agentSettings: merged };
      }),

      fetchOllamaModels: async () => {
        try {
          const { 
            ollamaEndpoint, 
            ollamaModel, 
            narrativeModel, 
            scriptingModel, 
            validationModel 
          } = get().agentSettings;
          
          const { OllamaService } = await import('../services/OllamaService');
          const models = await OllamaService.listModels(ollamaEndpoint);
          
          if (models.length > 0) {
            const firstModel = models[0];
            const updates: Partial<AgentSettings> = { availableModels: models };
            
            // If current models are default or empty, use the first available one
            if (!ollamaModel || ollamaModel === 'llama3') updates.ollamaModel = firstModel;
            if (!narrativeModel || narrativeModel === 'llama3') updates.narrativeModel = firstModel;
            if (!scriptingModel || scriptingModel === 'llama3') updates.scriptingModel = firstModel;
            if (!validationModel || validationModel === 'llama3') updates.validationModel = firstModel;
            
            set({
              agentSettings: { ...get().agentSettings, ...updates }
            });
          } else {
            set({
              agentSettings: { ...get().agentSettings, availableModels: [] }
            });
          }
        } catch (error) {
          console.error("Failed to fetch Ollama models:", error);
        }
      },

      // --- AI CONTEXT & ACTIONS ---
      activeAITarget: { type: 'none', id: null },
      setActiveAITarget: (target) => set({ activeAITarget: target }),

      applyCodeToTarget: (code: string, fieldType: 'scripting' | 'narrative') => {
        const state = get();
        const target = state.activeAITarget;
        
        if (target.type === 'none' || !target.id) return;

        // Limpiar el código (quitar markdown de bloques si lo tiene)
        const cleanCode = code.replace(/```[a-zA-Z]*\n?/g, '').replace(/```$/g, '').trim();

        if (target.type === 'focus') {
          const newNodes = state.nodes.map(n => {
            if (n.id === target.id) {
              if (fieldType === 'scripting') {
                return { ...n, data: { ...n.data, completion_reward: cleanCode } };
              } else if (fieldType === 'narrative') {
                return { ...n, data: { ...n.data, description: cleanCode } };
              }
            }
            return n;
          });
          set({ nodes: newNodes });
        } else if (target.type === 'event') {
          const newEvents = state.events.map(e => {
            if (e.id === target.id) {
              if (fieldType === 'scripting') {
                // Si es un script y no se especificó un lugar exacto, asumimos que es el efecto de la primera opción o el trigger.
                // Para ser más seguros, si la acción es "scripting" y no hay contexto, podemos guardarlo en description por ahora.
                // O mejor, si asume que es la option 0:
                if (e.options.length > 0) {
                  const newOptions = [...e.options];
                  newOptions[0].effect = cleanCode;
                  return { ...e, options: newOptions };
                }
              } else if (fieldType === 'narrative') {
                return { ...e, desc: cleanCode };
              }
            }
            return e;
          });
          set({ events: newEvents });
        } else if (target.type === 'tech') {
          const newTechs = state.techNodes.map(t => {
            if (t.id === target.id) {
              if (fieldType === 'scripting') {
                return { ...t, data: { ...t.data, bonus: cleanCode } };
              } else if (fieldType === 'narrative') {
                return { ...t, data: { ...t.data, label: cleanCode } };
              }
            }
            return t;
          });
          set({ techNodes: newTechs });
        }
      },

      getModContext: () => {
        const s = get();
        let activeContextStr = '';
        
        if (s.activeAITarget.type !== 'none' && s.activeAITarget.id) {
          if (s.activeAITarget.type === 'focus') {
            const node = s.nodes.find(n => n.id === s.activeAITarget.id);
            if (node) activeContextStr = `\nActive Focus Target: ${JSON.stringify(node.data, null, 2)}`;
          } else if (s.activeAITarget.type === 'event') {
            const ev = s.events.find(e => e.id === s.activeAITarget.id);
            if (ev) activeContextStr = `\nActive Event Target: ${JSON.stringify(ev, null, 2)}`;
          } else if (s.activeAITarget.type === 'tech') {
            const tech = s.techNodes.find(t => t.id === s.activeAITarget.id);
            if (tech) activeContextStr = `\nActive Tech Target: ${JSON.stringify(tech.data, null, 2)}`;
          }
        }

        return (
          `Project: ${s.projectName} | ` +
          `Base Mod: ${s.baseMod} | ` +
          `Focuses: ${s.nodes.length} | ` +
          `Events: ${s.events.length} | ` +
          `Spirits: ${s.spirits.length} | ` +
          `Decisions: ${s.decisionCategories.reduce((acc, c) => acc + c.decisions.length, 0)} | ` +
          `Leaders: ${s.leaders.length}` +
          activeContextStr
        );
      },

      // --- FILE EXPLORER ---
      activeFilePath: null,
      setActiveFilePath: (path) => set({ activeFilePath: path }),

      // --- FOCUS TREE ---
      nodes: initialNodes,
      edges: initialEdges,

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
      setNodes: (update) => {
        set({ nodes: typeof update === 'function' ? update(get().nodes) : update });
      },
      setEdges: (update) => {
        set({ edges: typeof update === 'function' ? update(get().edges) : update });
      },
      addFocusNode: () => {
        const newNodeId = `focus-${Date.now()}`;
        const newNode: Node = {
          id: newNodeId,
          type: 'focus',
          position: { x: 250, y: 100 },
          data: { label: 'New Focus', id: `new_focus_${Date.now().toString().slice(-4)}`, cost: 70 },
        };
        set({ nodes: [...get().nodes, newNode] });
      },
      deleteFocusNode: (id: string) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== id),
          edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
        });
      },
      clearFocusTree: () => {
        set({ nodes: [], edges: [] });
      },

      // --- EVENTS ---
      events: [initialEvent],
      activeEventIndex: 0,
      
      setActiveEventIndex: (index) => set({ activeEventIndex: index }),
      
      addEvent: () => {
        const newEvent: HoiEvent = {
          id: `event_${Date.now()}`,
          title: 'New Event',
          desc: 'Event description goes here...',
          picture: 'GFX_report_event_001',
          isTriggeredOnly: true,
          fireOnlyOnce: false,
          hidden: false,
          mtth: 1,
          trigger: '',
          immediate: '',
          options: [
            { name: 'Option 1', effect: 'add_political_power = 100' }
          ]
        };
        set((state) => ({ 
          events: [...state.events, newEvent],
          activeEventIndex: state.events.length 
        }));
      },
      
      deleteEvent: (index) => {
        const newEvents = get().events.filter((_, i) => i !== index);
        set({ 
          events: newEvents.length > 0 ? newEvents : [initialEvent],
          activeEventIndex: Math.max(0, index - 1)
        });
      },

      updateActiveEvent: (eventData) => {
        const { events, activeEventIndex } = get();
        const newEvents = [...events];
        newEvents[activeEventIndex] = { ...newEvents[activeEventIndex], ...eventData };
        set({ events: newEvents });
      },

      updateEventById: (id, updates) => {
        const newEvents = get().events.map(e => e.id === id ? { ...e, ...updates } : e);
        set({ events: newEvents });
      },

      addOptionToActiveEvent: () => {
        const { events, activeEventIndex } = get();
        const newEvents = [...events];
        newEvents[activeEventIndex].options.push({ 
          id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          name: 'New Option', 
          effect: '' 
        });
        set({ events: newEvents });
      },

      updateOptionInActiveEvent: (optionIndex, field, value) => {
        const { events, activeEventIndex } = get();
        const newEvents = [...events];
        newEvents[activeEventIndex].options[optionIndex][field] = value;
        set({ events: newEvents });
      },

      removeOptionFromActiveEvent: (optionIndex) => {
        const { events, activeEventIndex } = get();
        const newEvents = [...events];
        newEvents[activeEventIndex].options = newEvents[activeEventIndex].options.filter((_, i) => i !== optionIndex);
        set({ events: newEvents });
      },
      setEvents: (events) => set({ events }),

      // --- NATIONAL SPIRITS ---
      spirits: [initialSpirit],
      activeSpiritIndex: 0,
      setActiveSpiritIndex: (index) => set({ activeSpiritIndex: index }),
      addSpirit: () => {
        const newSpirit: NationalSpirit = {
          id: `idea_${get().spirits.length + 1}`,
          name: 'New Spirit',
          picture: 'generic_idea',
          modifiers: []
        };
        set({ 
          spirits: [...get().spirits, newSpirit],
          activeSpiritIndex: get().spirits.length 
        });
      },
      deleteSpirit: (index) => {
        const newSpirits = get().spirits.filter((_, i) => i !== index);
        set({ 
          spirits: newSpirits.length > 0 ? newSpirits : [initialSpirit],
          activeSpiritIndex: Math.max(0, index - 1)
        });
      },
      updateActiveSpirit: (spiritData) => {
        const { spirits, activeSpiritIndex } = get();
        const newSpirits = [...spirits];
        newSpirits[activeSpiritIndex] = { ...newSpirits[activeSpiritIndex], ...spiritData };
        set({ spirits: newSpirits });
      },
      addModifierToActiveSpirit: () => {
        const { spirits, activeSpiritIndex } = get();
        const newSpirits = [...spirits];
        newSpirits[activeSpiritIndex].modifiers.push({ 
          id: `mod-${Date.now()}`, 
          type: 'political_power_gain', 
          value: '0.1' 
        });
        set({ spirits: newSpirits });
      },
      updateModifierInActiveSpirit: (modIndex, field, value) => {
        const { spirits, activeSpiritIndex } = get();
        const newSpirits = [...spirits];
        newSpirits[activeSpiritIndex].modifiers[modIndex][field] = value;
        set({ spirits: newSpirits });
      },
      removeModifierFromActiveSpirit: (modIndex) => {
        const { spirits, activeSpiritIndex } = get();
        const newSpirits = [...spirits];
        newSpirits[activeSpiritIndex].modifiers = newSpirits[activeSpiritIndex].modifiers.filter((_, i) => i !== modIndex);
        set({ spirits: newSpirits });
      },
      setSpirits: (spirits) => set({ spirits }),

      // --- DECISIONS ---
      decisionCategories: [initialDecisionCategory],
      activeCategoryIndex: 0,
      activeDecisionIndex: null,
      setActiveCategoryIndex: (index) => set({ activeCategoryIndex: index, activeDecisionIndex: null }),
      setActiveDecisionIndex: (index) => set({ activeDecisionIndex: index }),
      addDecisionCategory: () => {
        const newCat: DecisionCategory = {
          id: `cat_${get().decisionCategories.length + 1}`,
          name: 'New Category',
          icon: 'generic_icon',
          decisions: []
        };
        set({ 
          decisionCategories: [...get().decisionCategories, newCat],
          activeCategoryIndex: get().decisionCategories.length,
          activeDecisionIndex: null
        });
      },
      deleteDecisionCategory: (index) => {
        const newCats = get().decisionCategories.filter((_, i) => i !== index);
        set({ 
          decisionCategories: newCats.length > 0 ? newCats : [initialDecisionCategory],
          activeCategoryIndex: Math.max(0, index - 1),
          activeDecisionIndex: null
        });
      },
      updateActiveCategory: (data) => {
        const { decisionCategories, activeCategoryIndex } = get();
        const newCats = [...decisionCategories];
        newCats[activeCategoryIndex] = { ...newCats[activeCategoryIndex], ...data };
        set({ decisionCategories: newCats });
      },
      addDecisionToActiveCategory: () => {
        const { decisionCategories, activeCategoryIndex } = get();
        const newCats = [...decisionCategories];
        newCats[activeCategoryIndex].decisions.push({
          id: `dec_${Date.now()}`,
          name: 'New Decision',
          cost: 25,
          trigger: '',
          effects: []
        });
        set({ 
          decisionCategories: newCats,
          activeDecisionIndex: newCats[activeCategoryIndex].decisions.length - 1
        });
      },
      deleteDecisionFromActiveCategory: (decisionIndex) => {
        const { decisionCategories, activeCategoryIndex } = get();
        const newCats = [...decisionCategories];
        newCats[activeCategoryIndex].decisions = newCats[activeCategoryIndex].decisions.filter((_, i) => i !== decisionIndex);
        set({ 
          decisionCategories: newCats,
          activeDecisionIndex: null
        });
      },
      updateActiveDecision: (data) => {
        const { decisionCategories, activeCategoryIndex, activeDecisionIndex } = get();
        if (activeDecisionIndex === null) return;
        const newCats = [...decisionCategories];
        newCats[activeCategoryIndex].decisions[activeDecisionIndex] = { 
          ...newCats[activeCategoryIndex].decisions[activeDecisionIndex], 
          ...data 
        };
        set({ decisionCategories: newCats });
      },
      setDecisionCategories: (categories) => set({ decisionCategories: categories }),

      // --- LEADERS ---
      leaders: [initialLeader],
      activeLeaderIndex: 0,
      setActiveLeaderIndex: (index) => set({ activeLeaderIndex: index }),
      addLeader: () => {
        const newLeader: Leader = {
          id: `leader_${get().leaders.length + 1}`,
          name: 'New Leader',
          picture: '',
          ideology: 'fascism',
          traits: []
        };
        set({ 
          leaders: [...get().leaders, newLeader],
          activeLeaderIndex: get().leaders.length 
        });
      },
      deleteLeader: (index) => {
        const newLeaders = get().leaders.filter((_, i) => i !== index);
        set({ 
          leaders: newLeaders.length > 0 ? newLeaders : [initialLeader],
          activeLeaderIndex: Math.max(0, index - 1)
        });
      },
      updateActiveLeader: (data) => {
        const { leaders, activeLeaderIndex } = get();
        const newLeaders = [...leaders];
        newLeaders[activeLeaderIndex] = { ...newLeaders[activeLeaderIndex], ...data };
        set({ leaders: newLeaders });
      },
      toggleTraitForActiveLeader: (trait) => {
        const { leaders, activeLeaderIndex } = get();
        const leader = leaders[activeLeaderIndex];
        if (!leader) return;
        const newLeaders = [...leaders];
        const hasTrait = leader.traits.some(t => t.id === trait.id);
        
        if (hasTrait) {
          leader.traits = leader.traits.filter(t => t.id !== trait.id);
        } else {
          leader.traits.push(trait);
        }
        set({ leaders: newLeaders });
      },
      setLeaders: (leaders) => set({ leaders }),

      // --- LOCALIZATION ---
      localizations: [initialLocalization],
      addLocalization: () => {
        set({
          localizations: [
            ...get().localizations,
            { id: `loc_${Date.now()}`, key: '', english: '', spanish: '', french: '' }
          ]
        });
      },
      addLocalizationWithData: (data) => {
        set({ localizations: [...get().localizations, data] });
      },
      updateLocalization: (index, data) => {
        const newLocs = [...get().localizations];
        newLocs[index] = { ...newLocs[index], ...data };
        set({ localizations: newLocs });
      },
      deleteLocalization: (index) => {
        const newLocs = get().localizations.filter((_, i) => i !== index);
        set({ localizations: newLocs.length > 0 ? newLocs : [initialLocalization] });
      },
      setLocalizations: (localizations) => set({ localizations }),

      // --- MACROS ---
      macros: [],
      setMacros: (macros) => set({ macros }),
      activeMacroIndex: 0,
      setActiveMacroIndex: (index) => set({ activeMacroIndex: index }),
      addMacro: (type) => {
        set({
          macros: [
            ...get().macros,
            {
              id: `macro_${Date.now()}`,
              name: `New ${type === 'trigger' ? 'Trigger' : 'Effect'}`,
              type,
              code: ''
            }
          ],
          activeMacroIndex: get().macros.length
        });
      },
      deleteMacro: (index) => {
        const newMacros = get().macros.filter((_, i) => i !== index);
        set({ 
          macros: newMacros,
          activeMacroIndex: Math.max(0, get().activeMacroIndex - 1)
        });
      },
      updateActiveMacro: (data) => {
        const newMacros = [...get().macros];
        if (newMacros[get().activeMacroIndex]) {
          newMacros[get().activeMacroIndex] = { ...newMacros[get().activeMacroIndex], ...data };
        }
        set({ macros: newMacros });
      },

      // --- STATES ---
      states: [],
      setStates: (states) => set({ states }),
      addState: () => {
        const newState: HoiState = {
          id: `state_${Date.now()}`,
          name: 'New State',
          manpower: 100000,
          category: 'rural',
          provinces: '',
          owner: 'GER'
        };
        set({ states: [...get().states, newState] });
      },
      updateState: (index, data) => {
        const newStates = [...get().states];
        newStates[index] = { ...newStates[index], ...data };
        set({ states: newStates });
      },
      deleteState: (index) => {
        set({ states: get().states.filter((_, i) => i !== index) });
      },

      // --- DIVISIONS ---
      divisionTemplates: [initialDivisionTemplate],
      setDivisionTemplates: (templates) => set({ divisionTemplates: templates }),
      addDivisionTemplate: () => {
        const newTemplate: DivisionTemplate = {
          id: `template_${Date.now()}`,
          name: 'New Division Template',
          regiments: Array(5).fill(null).map(() => Array(5).fill(null)),
          support: Array(5).fill(null)
        };
        set({ divisionTemplates: [...get().divisionTemplates, newTemplate] });
      },
      updateDivisionTemplate: (index, data) => {
        const newTemplates = [...get().divisionTemplates];
        newTemplates[index] = { ...newTemplates[index], ...data };
        set({ divisionTemplates: newTemplates });
      },
      deleteDivisionTemplate: (index) => {
        set({ divisionTemplates: get().divisionTemplates.filter((_, i) => i !== index) });
      },

      // --- ARMY HIERARCHY ---
      armyGroups: [],
      setArmyGroups: (groups) => set({ armyGroups: groups }),
      addArmyGroup: () => {
        const newGroup: ArmyGroup = {
          id: `group_${Date.now()}`,
          name: 'New Army Group',
          armies: []
        };
        set({ armyGroups: [...get().armyGroups, newGroup] });
      },
      updateArmyGroup: (index, data) => {
        const newGroups = [...get().armyGroups];
        newGroups[index] = { ...newGroups[index], ...data };
        set({ armyGroups: newGroups });
      },
      deleteArmyGroup: (index) => {
        set({ armyGroups: get().armyGroups.filter((_, i) => i !== index) });
      },
      addArmyToGroup: (groupIndex) => {
        const newGroups = [...get().armyGroups];
        if (newGroups[groupIndex]) {
          const newArmy: Army = {
            id: `army_${Date.now()}`,
            name: 'New Army',
            divisions: []
          };
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            armies: [...newGroups[groupIndex].armies, newArmy]
          };
          set({ armyGroups: newGroups });
        }
      },
      deleteArmyFromGroup: (groupIndex, armyIndex) => {
        const newGroups = [...get().armyGroups];
        if (newGroups[groupIndex]) {
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            armies: newGroups[groupIndex].armies.filter((_, i) => i !== armyIndex)
          };
          set({ armyGroups: newGroups });
        }
      },
      addDivisionToArmy: (groupIndex, armyIndex, templateId) => {
        const newGroups = [...get().armyGroups];
        if (newGroups[groupIndex] && newGroups[groupIndex].armies[armyIndex]) {
          const template = get().divisionTemplates.find(t => t.id === templateId);
          const newDivision: DivisionInstance = {
            id: `div_${Date.now()}`,
            templateId,
            name: `${template?.name || 'Division'} ${newGroups[groupIndex].armies[armyIndex].divisions.length + 1}`,
            location: 'Berlin'
          };
          
          const newArmies = [...newGroups[groupIndex].armies];
          newArmies[armyIndex] = {
            ...newArmies[armyIndex],
            divisions: [...newArmies[armyIndex].divisions, newDivision]
          };
          
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            armies: newArmies
          };
          
          set({ armyGroups: newGroups });
        }
      },
      removeDivisionFromArmy: (groupIndex, armyIndex, divisionIndex) => {
        const newGroups = [...get().armyGroups];
        if (newGroups[groupIndex] && newGroups[groupIndex].armies[armyIndex]) {
          const newArmies = [...newGroups[groupIndex].armies];
          newArmies[armyIndex] = {
            ...newArmies[armyIndex],
            divisions: newArmies[armyIndex].divisions.filter((_, i) => i !== divisionIndex)
          };
          
          newGroups[groupIndex] = {
            ...newGroups[groupIndex],
            armies: newArmies
          };
          
          set({ armyGroups: newGroups });
        }
      },

      // --- ECONOMY ---
      economyConfig: initialEconomy,
      setEconomyConfig: (config) => set({ economyConfig: { ...get().economyConfig, ...config } }),

      // --- MISSILES ---
      missiles: [],
      setMissiles: (missiles) => set({ missiles }),

      // --- TECH TREE ---
      techNodes: [
        {
          id: 'initial_tech',
          type: 'tech',
          position: { x: 100, y: 100 },
          data: { techId: 'basic_technology', label: 'Basic Technology', category: 'industry', researchCost: 100, yearAvailable: 1936, bonus: '', dependencies: '' },
        }
      ],
      techEdges: [],
      setTechNodes: (update) => set({ techNodes: typeof update === 'function' ? update(get().techNodes) : update }),
      setTechEdges: (update) => set({ techEdges: typeof update === 'function' ? update(get().techEdges) : update }),

      // --- PARTIES ---
      politicalParties: initialParties,
      setPoliticalParties: (parties) => set({ politicalParties: parties }),

      // --- CONFLICTS ---
      civilConflicts: initialConflicts,
      setCivilConflicts: (conflicts) => set({ civilConflicts: conflicts }),

      // --- MONARCHY ---
      monarchyConfig: initialMonarchy,
      setMonarchyConfig: (config) => set({ monarchyConfig: { ...get().monarchyConfig, ...config } }),

      // --- TNO ---
      tnoVariables: initialTnoVariables,
      setTnoVariables: (vars) => set({ tnoVariables: vars }),
      tnoPaths: [],
      setTnoPaths: (paths) => set({ tnoPaths: paths }),
    }),
    {
      name: 'hoi4-mod-studio-storage', // Key for localStorage
      // Deep-merge agentSettings on rehydration so new fields (e.g., personalities)
      // are always present even when loading an old localStorage snapshot
      merge: (persisted, current) => {
        const persistedRecord = (persisted && typeof persisted === 'object')
          ? (persisted as Record<string, unknown>)
          : {};

        const persistedAgentSettings =
          persistedRecord.agentSettings && typeof persistedRecord.agentSettings === 'object'
            ? (persistedRecord.agentSettings as Record<string, unknown>)
            : {};

        const persistedPersonalities =
          persistedAgentSettings.personalities && typeof persistedAgentSettings.personalities === 'object'
            ? (persistedAgentSettings.personalities as Record<string, unknown>)
            : {};

        return {
          ...current,
          ...persistedRecord,
          activeAITarget: (persistedRecord.activeAITarget as ActiveAITarget | undefined) || current.activeAITarget,
          agentSettings: {
            ...initialAgentSettings,
            ...persistedAgentSettings,
            personalities: {
              ...initialAgentSettings.personalities,
              ...persistedPersonalities,
            },
          },
        };
      },
    }
  )
);
