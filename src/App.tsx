import { useState, useRef, useEffect } from 'react';
import LandingPage from './components/landing/LandingPage';
import { type CommandPaletteAction } from './components/ui/CommandPalette';
import AppTopBar from './components/layout/AppTopBar';
import WorkspaceRouter from './components/layout/WorkspaceRouter';
import AppOverlays from './components/layout/AppOverlays';
import { createTabs, getAvailableTabs, getVisibleTabs, createCommandActions } from './config/appTabs';
import { exportModFiles } from './utils/export';
import { useModStore } from './store/useModStore';
import { translations } from './data/translations';
import type { Language } from './data/translations';
import { baseModContent } from './data/baseModContent';
import { useUndoRedo } from './hooks/useUndoRedo';
import { toast } from './store/toastStore';

function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const { baseMod, setBaseMod, language, setLanguage, workMode, setWorkMode } = useModStore();
  
  const t = (key: string) => {
    const dict = translations as Partial<Record<Language, Record<string, string>>>;
    return dict[language]?.[key] || dict.en?.[key] || key;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('focus');
  const [showSettings, setShowSettings] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { saveState, undo, redo, canUndo, canRedo } = useUndoRedo();
  const quickActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) { undo(); toast.info('Undo'); }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) { redo(); toast.info('Redo'); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveState();
        toast.success('State saved');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, saveState]);

  useEffect(() => {
    if (!showQuickActionsMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setShowQuickActionsMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuickActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showQuickActionsMenu]);
  const navRef = useRef<HTMLElement>(null);

  const currentModContent = baseModContent[baseMod];
  const tabs = createTabs(t);
  const availableTabs = getAvailableTabs(tabs, currentModContent.tools, workMode);
  const visibleTabs = getVisibleTabs(availableTabs, searchQuery, activeTab);

  const commandActions: CommandPaletteAction[] = createCommandActions(availableTabs, t, {
    openTab: (tabId) => {
      setActiveTab(tabId);
      setShowCommandPalette(false);
    },
    openSettings: () => {
      setShowSettings(true);
      setShowCommandPalette(false);
    },
    openBackupManager: () => {
      setShowBackupManager(true);
      setShowCommandPalette(false);
    },
    saveState: () => {
      saveState();
      toast.success('State saved');
      setShowCommandPalette(false);
    },
    openAI: () => {
      setShowAISidebar(true);
      setShowCommandPalette(false);
    },
    openLivePreview: () => {
      setShowLivePreview(true);
      setShowCommandPalette(false);
    },
    openShareDialog: () => {
      setShowExportDialog(true);
      setShowCommandPalette(false);
    },
    exportLocal: () => {
      exportModFiles();
      setShowCommandPalette(false);
    },
    undo: () => {
      toast.info('Undo action');
      setShowCommandPalette(false);
    },
    redo: () => {
      toast.info('Redo action');
      setShowCommandPalette(false);
    },
    toggleSidebar: () => {
      setSidebarCollapsed(!sidebarCollapsed);
      setShowCommandPalette(false);
    },
    openAgentTeam: () => {
      setShowAgentSettings(true);
      setShowCommandPalette(false);
    },
    validateMod: () => {
      toast.info('Validating mod...');
      setShowCommandPalette(false);
    },
    showShortcuts: () => {
      toast.info('Keyboard shortcuts');
      setShowCommandPalette(false);
    },
    toggleAdvanced: () => {
      setWorkMode(workMode === 'advanced' ? 'normal' : 'advanced');
      toast.success(`Switched to ${workMode === 'advanced' ? 'normal' : 'advanced'} mode`);
      setShowCommandPalette(false);
    },
  });

  const handleWheel = (e: React.WheelEvent) => {
    if (navRef.current) {
      navRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollTabs = (dir: 'L' | 'R') => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({ left: dir === 'L' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (view === 'landing') {
    return <LandingPage onOpenApp={() => setView('app')} />;
  }

  return (
    <div className={`min-h-screen bg-[#121212] text-gray-200 flex flex-col font-sans ${currentModContent.themeClass}`}>
      <AppTopBar
        visibleTabs={visibleTabs}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onOpenLanding={() => setView('landing')}
        navRef={navRef}
        onTabsWheel={handleWheel}
        onScrollTabs={scrollTabs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        t={t}
        showQuickActionsMenu={showQuickActionsMenu}
        setShowQuickActionsMenu={setShowQuickActionsMenu}
        quickActionsRef={quickActionsRef}
        onOpenSettings={() => {
          setShowSettings(true);
          setShowQuickActionsMenu(false);
        }}
        onOpenBackupManager={() => {
          setShowBackupManager(true);
          setShowQuickActionsMenu(false);
        }}
        onSaveState={() => {
          saveState();
          toast.success('State saved');
        }}
        canUndo={canUndo}
        onUndo={() => {
          if (canUndo) {
            undo();
            toast.info('Undo');
          }
        }}
        canRedo={canRedo}
        onRedo={() => {
          if (canRedo) {
            redo();
            toast.info('Redo');
          }
        }}
        showAISidebar={showAISidebar}
        onOpenAISidebar={() => setShowAISidebar(true)}
        onOpenLivePreview={() => setShowLivePreview(true)}
        onOpenShare={() => setShowExportDialog(true)}
        onExportLocal={exportModFiles}
      />

      <WorkspaceRouter activeTab={activeTab} />

      <AppOverlays
        showExportDialog={showExportDialog}
        onCloseExportDialog={() => setShowExportDialog(false)}
        showCommandPalette={showCommandPalette}
        onCloseCommandPalette={() => setShowCommandPalette(false)}
        commandActions={commandActions}
        commandPlaceholder={t('commandSearchPlaceholder')}
        showAgentSettings={showAgentSettings}
        onCloseAgentSettings={() => setShowAgentSettings(false)}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        t={t}
        workMode={workMode}
        onSetWorkMode={setWorkMode}
        onOpenAgentSettings={() => setShowAgentSettings(true)}
        language={language}
        onSetLanguage={setLanguage}
        baseMod={baseMod}
        onSetBaseMod={(id) => setBaseMod(id as Parameters<typeof setBaseMod>[0])}
        showAISidebar={showAISidebar}
        onCloseAISidebar={() => setShowAISidebar(false)}
        showLivePreview={showLivePreview}
        onCloseLivePreview={() => setShowLivePreview(false)}
        showBackupManager={showBackupManager}
        onCloseBackupManager={() => setShowBackupManager(false)}
      />
    </div>
  );
}

export default App;
