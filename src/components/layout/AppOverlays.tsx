import CloudExportDialog from '../cloud/CloudExportDialog';
import ValidationPanel from '../ui/ValidationPanel';
import AISidebar from '../ui/AISidebar';
import ToastContainer from '../ui/ToastContainer';
import LivePreview from '../ui/LivePreview';
import BackupManager from '../ui/BackupManager';
import CommandPalette, { type CommandPaletteAction } from '../ui/CommandPalette';
import SettingsModal from './SettingsModal';
import AgentSettingsModal from './AgentSettingsModal';
import type { Language } from '../../data/translations';

interface AppOverlaysProps {
  showExportDialog: boolean;
  onCloseExportDialog: () => void;
  showCommandPalette: boolean;
  onCloseCommandPalette: () => void;
  commandActions: CommandPaletteAction[];
  commandPlaceholder: string;
  showAgentSettings: boolean;
  onCloseAgentSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
  t: (key: string) => string;
  workMode: 'normal' | 'advanced';
  onSetWorkMode: (mode: 'normal' | 'advanced') => void;
  onOpenAgentSettings: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  baseMod: string;
  onSetBaseMod: (id: string) => void;
  showAISidebar: boolean;
  onCloseAISidebar: () => void;
  showLivePreview: boolean;
  onCloseLivePreview: () => void;
  showBackupManager: boolean;
  onCloseBackupManager: () => void;
}

export default function AppOverlays({
  showExportDialog,
  onCloseExportDialog,
  showCommandPalette,
  onCloseCommandPalette,
  commandActions,
  commandPlaceholder,
  showAgentSettings,
  onCloseAgentSettings,
  showSettings,
  onCloseSettings,
  t,
  workMode,
  onSetWorkMode,
  onOpenAgentSettings,
  language,
  onSetLanguage,
  baseMod,
  onSetBaseMod,
  showAISidebar,
  onCloseAISidebar,
  showLivePreview,
  onCloseLivePreview,
  showBackupManager,
  onCloseBackupManager,
}: AppOverlaysProps) {
  return (
    <>
      <CloudExportDialog isOpen={showExportDialog} onClose={onCloseExportDialog} />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={onCloseCommandPalette}
        actions={commandActions}
        placeholder={commandPlaceholder}
      />

      <AgentSettingsModal isOpen={showAgentSettings} onClose={onCloseAgentSettings} />

      <SettingsModal
        isOpen={showSettings}
        onClose={onCloseSettings}
        t={t}
        workMode={workMode}
        onSetWorkMode={onSetWorkMode}
        onOpenAgentSettings={onOpenAgentSettings}
        language={language}
        onSetLanguage={onSetLanguage}
        baseMod={baseMod}
        onSetBaseMod={onSetBaseMod}
      />

      <ValidationPanel />

      <AISidebar isOpen={showAISidebar} onClose={onCloseAISidebar} />

      <LivePreview isOpen={showLivePreview} onClose={onCloseLivePreview} />

      <BackupManager isOpen={showBackupManager} onClose={onCloseBackupManager} />

      <ToastContainer />
    </>
  );
}
