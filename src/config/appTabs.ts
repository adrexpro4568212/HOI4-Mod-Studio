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
      keywords: 'settings project config',
      run: handlers.openSettings,
    },
    {
      id: 'project-backup',
      label: t('openBackupManager'),
      section: 'Project',
      keywords: 'backup restore json',
      run: handlers.openBackupManager,
    },
    {
      id: 'save-state',
      label: t('saveProjectState'),
      section: 'Edit',
      keywords: 'save state ctrl+s',
      run: handlers.saveState,
    },
    {
      id: 'open-ai',
      label: t('openAiAssistant'),
      section: 'Assist',
      keywords: 'ai assistant bot',
      run: handlers.openAI,
    },
    {
      id: 'open-live-preview',
      label: t('openLivePreview'),
      section: 'Assist',
      keywords: 'preview popup live',
      run: handlers.openLivePreview,
    },
    {
      id: 'share-mod',
      label: t('openShareDialog'),
      section: 'Export',
      keywords: 'share cloud export',
      run: handlers.openShareDialog,
    },
    {
      id: 'export-local',
      label: t('exportLocalFiles'),
      section: 'Export',
      keywords: 'local export files',
      run: handlers.exportLocal,
    },
  ];
}
