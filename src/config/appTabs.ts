import type { CommandPaletteAction } from '../components/ui/CommandPalette';

export type WorkMode = 'normal' | 'advanced';

export interface AppTab {
  id: string;
  label: string;
  color: string;
  tier: WorkMode;
}

interface CommandActionHandlers {
  openTab: (tabId: string) => void;
  openSettings: () => void;
  openBackupManager: () => void;
  saveState: () => void;
  openAI: () => void;
  openLivePreview: () => void;
  openShareDialog: () => void;
  exportLocal: () => void;
  undo: () => void;
  redo: () => void;
  toggleSidebar: () => void;
  openAgentTeam: () => void;
  validateMod: () => void;
  showShortcuts: () => void;
  toggleAdvanced: () => void;
}

export function createTabs(t: (key: string) => string): AppTab[] {
  return [
    { id: 'focus', label: `🎯 ${t('focusTree')}`, color: 'bg-amber-600', tier: 'normal' },
    { id: 'events', label: `📅 ${t('events')}`, color: 'bg-purple-600', tier: 'normal' },
    { id: 'leaders', label: `👤 ${t('leaders')}`, color: 'bg-blue-600', tier: 'normal' },
    { id: 'spirits', label: `👻 ${t('spirits')}`, color: 'bg-indigo-600', tier: 'normal' },
    { id: 'decisions', label: `⚖️ ${t('decisions')}`, color: 'bg-red-600', tier: 'normal' },
    { id: 'localization', label: `🌍 ${t('localization')}`, color: 'bg-green-600', tier: 'advanced' },
    { id: 'map', label: `🗺️ ${t('map')}`, color: 'bg-blue-500', tier: 'normal' },
    { id: 'division_designer', label: `💂 ${t('division_designer')}`, color: 'bg-emerald-600', tier: 'normal' },
    { id: 'code', label: `📂 ${t('code')}`, color: 'bg-zinc-600', tier: 'advanced' },
    { id: 'macros', label: `⌨️ ${t('macros')}`, color: 'bg-zinc-700', tier: 'advanced' },
    { id: 'economy', label: `📉 ${t('economy')}`, color: 'bg-green-700', tier: 'normal' },
    { id: 'missiles', label: `🚀 ${t('missiles')}`, color: 'bg-orange-700', tier: 'advanced' },
    { id: 'techtree', label: `🧪 ${t('tech')}`, color: 'bg-cyan-700', tier: 'advanced' },
    { id: 'parties', label: `🏛️ ${t('parties')}`, color: 'bg-amber-700', tier: 'normal' },
    { id: 'conflicts', label: `⚔️ ${t('conflicts')}`, color: 'bg-red-800', tier: 'normal' },
    { id: 'tno_vars', label: `🔢 ${t('tnoVars')}`, color: 'bg-purple-700', tier: 'advanced' },
    { id: 'tno_paths', label: `🌳 ${t('tnoPaths')}`, color: 'bg-purple-800', tier: 'advanced' },
    { id: 'monarchy', label: `👑 ${t('monarchy')}`, color: 'bg-yellow-600', tier: 'normal' },
    { id: 'assets', label: `🎨 ${t('assets')}`, color: 'bg-indigo-500', tier: 'normal' },
    { id: 'scripting', label: `🧩 ${t('scripting')}`, color: 'bg-zinc-500', tier: 'advanced' },
    { id: 'community', label: `🌐 ${t('communityHub')}`, color: 'bg-pink-600', tier: 'normal' },
  ];
}

export function getAvailableTabs(tabs: AppTab[], enabledTools: string[], workMode: WorkMode): AppTab[] {
  return tabs.filter((tab) => enabledTools.includes(tab.id) && (workMode === 'advanced' || tab.tier === 'normal'));
}

export function getVisibleTabs(availableTabs: AppTab[], searchQuery: string, activeTab: string): AppTab[] {
  return availableTabs.filter(
    (tab) => searchQuery === '' || tab.label.toLowerCase().includes(searchQuery.toLowerCase()) || activeTab === tab.id
  );
}

export function createCommandActions(
  availableTabs: AppTab[],
  t: (key: string) => string,
  handlers: CommandActionHandlers
): CommandPaletteAction[] {
  return [
    ...availableTabs.map((tab) => ({
      id: `tool-${tab.id}`,
      label: tab.label,
      section: 'Tools',
      keywords: `${tab.id} ${tab.label}`.toLowerCase(),
      run: () => handlers.openTab(tab.id),
    })),
    {
      id: 'project-settings',
      label: t('settings'),
      section: 'Project',
      keywords: 'settings project config mod',
      run: handlers.openSettings,
    },
    {
      id: 'project-backup',
      label: t('openBackupManager'),
      section: 'Project',
      keywords: 'backup restore json history',
      run: handlers.openBackupManager,
    },
    {
      id: 'save-state',
      label: t('saveProjectState'),
      section: 'Edit',
      keywords: 'save state ctrl+s project',
      run: handlers.saveState,
    },
    {
      id: 'undo',
      label: t('undo'),
      section: 'Edit',
      keywords: 'undo ctrl+z revert',
      run: handlers.undo,
    },
    {
      id: 'redo',
      label: t('redo'),
      section: 'Edit',
      keywords: 'redo ctrl+y restore',
      run: handlers.redo,
    },
    {
      id: 'open-ai',
      label: t('openAiAssistant'),
      section: 'Assist',
      keywords: 'ai assistant bot agent',
      run: handlers.openAI,
    },
    {
      id: 'open-agent-team',
      label: t('openAgentTeam'),
      section: 'Assist',
      keywords: 'agent team multi collaborate',
      run: handlers.openAgentTeam,
    },
    {
      id: 'toggle-sidebar',
      label: t('toggleSidebar'),
      section: 'View',
      keywords: 'sidebar toggle view panel',
      run: handlers.toggleSidebar,
    },
    {
      id: 'open-live-preview',
      label: t('openLivePreview'),
      section: 'Assist',
      keywords: 'preview popup live window',
      run: handlers.openLivePreview,
    },
    {
      id: 'validate-mod',
      label: t('validateMod'),
      section: 'Tools',
      keywords: 'validate check error mod',
      run: handlers.validateMod,
    },
    {
      id: 'share-mod',
      label: t('openShareDialog'),
      section: 'Export',
      keywords: 'share cloud upload export',
      run: handlers.openShareDialog,
    },
    {
      id: 'export-local',
      label: t('exportLocalFiles'),
      section: 'Export',
      keywords: 'local export files download',
      run: handlers.exportLocal,
    },
    {
      id: 'show-shortcuts',
      label: t('showShortcuts'),
      section: 'Help',
      keywords: 'shortcuts keyboard hotkeys',
      run: handlers.showShortcuts,
    },
    {
      id: 'toggle-advanced-mode',
      label: t('toggleAdvanced'),
      section: 'View',
      keywords: 'advanced mode toggle tier',
      run: handlers.toggleAdvanced,
    },
    {
      id: 'goto-focus-tree',
      label: t('goToFocusTree'),
      section: 'Navigate',
      keywords: 'focus tree focus-tree editor',
      run: () => handlers.openTab('focus'),
    },
    {
      id: 'goto-events',
      label: t('goToEvents'),
      section: 'Navigate',
      keywords: 'events event editor',
      run: () => handlers.openTab('events'),
    },
    {
      id: 'goto-leaders',
      label: t('goToLeaders'),
      section: 'Navigate',
      keywords: 'leaders leader general',
      run: () => handlers.openTab('leaders'),
    },
    {
      id: 'goto-spirits',
      label: t('goToSpirits'),
      section: 'Navigate',
      keywords: 'spirits national ideas',
      run: () => handlers.openTab('spirits'),
    },
    {
      id: 'goto-decisions',
      label: t('goToDecisions'),
      section: 'Navigate',
      keywords: 'decisions decision tree',
      run: () => handlers.openTab('decisions'),
    },
    {
      id: 'goto-economy',
      label: t('goToEconomy'),
      section: 'Navigate',
      keywords: 'economy industrial resources',
      run: () => handlers.openTab('economy'),
    },
    {
      id: 'goto-division-designer',
      label: t('goToDivisionDesigner'),
      section: 'Navigate',
      keywords: 'division designer template unit',
      run: () => handlers.openTab('division_designer'),
    },
    {
      id: 'goto-map',
      label: t('goToMap'),
      section: 'Navigate',
      keywords: 'map editor states',
      run: () => handlers.openTab('map'),
    },
    {
      id: 'goto-localization',
      label: t('goToLocalization'),
      section: 'Navigate',
      keywords: 'localization translate language',
      run: () => handlers.openTab('localization'),
    },
    {
      id: 'goto-assets',
      label: t('goToAssets'),
      section: 'Navigate',
      keywords: 'assets images portraits',
      run: () => handlers.openTab('assets'),
    },
    {
      id: 'goto-code',
      label: t('goToCode'),
      section: 'Navigate',
      keywords: 'code editor scripting',
      run: () => handlers.openTab('code'),
    },
    {
      id: 'goto-scripting',
      label: t('goToScripting'),
      section: 'Navigate',
      keywords: 'scripting lab automation',
      run: () => handlers.openTab('scripting'),
    },
  ];
}
