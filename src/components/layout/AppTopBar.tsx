import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  FileCode,
  GitBranch,
  Settings,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  Search,
  Bot,
  Undo2,
  Redo2,
  Save,
  HardDrive,
  MoreHorizontal,
} from 'lucide-react';
import CloudSaveManager from '../cloud/CloudSaveManager';
import ModContextBanner from '../ui/ModContextBanner';

interface NavTab {
  id: string;
  label: string;
  color: string;
}

interface AppTopBarProps {
  visibleTabs: NavTab[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenLanding: () => void;
  navRef: React.RefObject<HTMLElement | null>;
  onTabsWheel: (e: React.WheelEvent) => void;
  onScrollTabs: (dir: 'L' | 'R') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onOpenCommandPalette: () => void;
  t: (key: string) => string;
  showQuickActionsMenu: boolean;
  setShowQuickActionsMenu: React.Dispatch<React.SetStateAction<boolean>>;
  quickActionsRef: React.RefObject<HTMLDivElement | null>;
  onOpenSettings: () => void;
  onOpenBackupManager: () => void;
  onSaveState: () => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  showAISidebar: boolean;
  onOpenAISidebar: () => void;
  onOpenLivePreview: () => void;
  onOpenShare: () => void;
  onExportLocal: () => void;
}

export default function AppTopBar({
  visibleTabs,
  activeTab,
  onSelectTab,
  onOpenLanding,
  navRef,
  onTabsWheel,
  onScrollTabs,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenCommandPalette,
  t,
  showQuickActionsMenu,
  setShowQuickActionsMenu,
  quickActionsRef,
  onOpenSettings,
  onOpenBackupManager,
  onSaveState,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  showAISidebar,
  onOpenAISidebar,
  onOpenLivePreview,
  onOpenShare,
  onExportLocal,
}: AppTopBarProps) {
  return (
    <header className="h-14 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenLanding}>
        <div className="w-8 h-8 bg-mod-primary rounded flex items-center justify-center">
          <GitBranch size={20} className="text-black" />
        </div>
        <h1 className="font-bold text-lg tracking-wide hover:text-mod-primary transition-colors">HOI4 Mod Studio</h1>
      </div>

      <div className="flex-1 flex items-center relative group/nav overflow-hidden px-4">
        <button
          onClick={() => onScrollTabs('L')}
          className="absolute left-0 z-20 w-8 h-full flex items-center justify-center bg-gradient-to-r from-[#1a1a1a] to-transparent text-gray-400 hover:text-white opacity-0 group-hover/nav:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
        </button>

        <nav
          ref={navRef}
          onWheel={onTabsWheel}
          className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar px-8 py-2 scroll-smooth"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap overflow-hidden flex items-center gap-2 ${
                  isActive
                    ? 'text-white shadow-[0_10px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-[#1a1a1a]/40 backdrop-blur-md text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className={`absolute inset-0 ${tab.color} opacity-90`}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabSpark"
                    className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <button
          onClick={() => onScrollTabs('R')}
          className="absolute right-0 z-20 w-8 h-full flex items-center justify-center bg-gradient-to-l from-[#1a1a1a] to-transparent text-gray-400 hover:text-white opacity-0 group-hover/nav:opacity-100 transition-opacity"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-mod-primary transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#222] border border-gray-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 w-32 focus:w-48 focus:border-mod-primary focus:bg-[#2a2a2a] outline-none transition-all placeholder:text-gray-600"
          />
          {searchQuery && (
            <button onClick={onClearSearch} className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 bg-[#161616] text-gray-400 hover:text-white hover:border-mod-primary transition-colors"
          title="Command Palette (Ctrl+K)"
        >
          <Search size={13} />
          <span className="text-xs font-medium">{t('commandPalette')}</span>
          <span className="text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">Ctrl+K</span>
        </button>

        <ModContextBanner />

        <div className="flex items-center gap-1 rounded-xl border border-gray-800 bg-[#161616] p-1">
          <CloudSaveManager />
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white bg-[#222] border border-gray-800 rounded-lg transition-all hover:border-mod-primary"
            title="Project Settings"
          >
            <Settings size={18} />
          </button>

          <div className="relative" ref={quickActionsRef}>
            <button
              onClick={() => setShowQuickActionsMenu((prev) => !prev)}
              className={`p-2 border rounded-lg transition-all ${showQuickActionsMenu ? 'bg-mod-primary/15 text-mod-primary border-mod-primary/30' : 'text-gray-400 hover:text-white bg-[#222] border-gray-800 hover:border-mod-primary'}`}
              title="More project actions"
            >
              <MoreHorizontal size={18} />
            </button>

            <AnimatePresence>
              {showQuickActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-12 z-50 min-w-[220px] rounded-xl border border-gray-800 bg-[#171717] p-2 shadow-2xl"
                >
                  <button
                    onClick={onOpenBackupManager}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#222] transition-colors"
                  >
                    <HardDrive size={14} />
                    Backup Manager
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-gray-800 bg-[#161616] p-1">
          <button
            onClick={onSaveState}
            className="p-2 text-gray-400 hover:text-white bg-[#222] border border-gray-800 rounded-lg transition-all hover:border-mod-primary"
            title="Save State (Ctrl+S)"
          >
            <Save size={18} />
          </button>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${canUndo ? 'text-gray-400 hover:text-white bg-[#222] border border-gray-800 hover:border-mod-primary' : 'text-gray-700 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${canRedo ? 'text-gray-400 hover:text-white bg-[#222] border border-gray-800 hover:border-mod-primary' : 'text-gray-700 cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-gray-800 bg-[#161616] p-1">
          <button
            onClick={onOpenAISidebar}
            className={`p-2 border rounded-lg transition-all ${showAISidebar ? 'bg-mod-primary text-black border-mod-primary shadow-[0_0_15px_var(--mod-glow)]' : 'text-gray-400 hover:text-white bg-[#222] border-gray-800 hover:border-mod-primary'}`}
            title="Antigravity AI Assistant"
          >
            <Bot size={18} />
          </button>

          <button
            onClick={onOpenLivePreview}
            className="flex items-center gap-2 bg-[#222] hover:bg-mod-primary/15 text-gray-300 hover:text-white border border-gray-800 hover:border-mod-primary px-3 py-2 rounded-lg text-sm transition-all"
          >
            <Play size={16} />
            <span>Live Preview</span>
          </button>
        </div>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-2 text-sm text-mod-primary hover:text-mod-accent transition-all bg-mod-primary/10 px-4 py-2 rounded-lg border border-mod-primary/20 shadow-lg shadow-mod-primary/5"
        >
          <Share2 size={16} />
          <span className="font-bold">{t('shareMod')}</span>
        </button>

        <button
          onClick={onExportLocal}
          className="flex items-center gap-2 bg-mod-primary hover:bg-mod-accent text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-mod-primary/20"
        >
          <FileCode size={16} />
          <span>{t('localExport')}</span>
        </button>
      </div>
    </header>
  );
}
