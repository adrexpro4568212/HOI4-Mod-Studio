import { useRef } from 'react';
import { Download, Upload, Database, X } from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { toast } from '../../store/toastStore';

interface BackupManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackupManager({ isOpen, onClose }: BackupManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modStore = useModStore();

  type StoreSnapshot = ReturnType<typeof useModStore.getState>;
  type StateKey =
    | 'nodes' | 'edges' | 'events' | 'spirits' | 'decisionCategories'
    | 'leaders' | 'localizations' | 'macros' | 'states' | 'divisionTemplates'
    | 'armyGroups' | 'economyConfig' | 'missiles' | 'techNodes' | 'techEdges'
    | 'politicalParties' | 'civilConflicts' | 'monarchyConfig' | 'tnoVariables' | 'tnoPaths';

  const setters: { [K in StateKey]: (value: StoreSnapshot[K]) => void } = {
    nodes: modStore.setNodes,
    edges: modStore.setEdges,
    events: modStore.setEvents,
    spirits: modStore.setSpirits,
    decisionCategories: modStore.setDecisionCategories,
    leaders: modStore.setLeaders,
    localizations: modStore.setLocalizations,
    macros: modStore.setMacros,
    states: modStore.setStates,
    divisionTemplates: modStore.setDivisionTemplates,
    armyGroups: modStore.setArmyGroups,
    economyConfig: modStore.setEconomyConfig,
    missiles: modStore.setMissiles,
    techNodes: modStore.setTechNodes,
    techEdges: modStore.setTechEdges,
    politicalParties: modStore.setPoliticalParties,
    civilConflicts: modStore.setCivilConflicts,
    monarchyConfig: modStore.setMonarchyConfig,
    tnoVariables: modStore.setTnoVariables,
    tnoPaths: modStore.setTnoPaths,
  };

  const STATE_KEYS: StateKey[] = [
    'nodes', 'edges', 'events', 'spirits', 'decisionCategories',
    'leaders', 'localizations', 'macros', 'states', 'divisionTemplates',
    'armyGroups', 'economyConfig', 'missiles', 'techNodes', 'techEdges',
    'politicalParties', 'civilConflicts', 'monarchyConfig', 'tnoVariables', 'tnoPaths'
  ];

  const exportBackup = () => {
    const backup: Record<string, unknown> = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      baseMod: modStore.baseMod,
      projectName: modStore.projectName,
    };

    STATE_KEYS.forEach(key => {
      backup[key] = modStore[key] as unknown;
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoi4-mod-backup-${modStore.projectName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Backup exported successfully!');
    onClose();
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as Record<string, unknown>;
        
        if (!backup.version) {
          toast.error('Invalid backup file');
          return;
        }

        STATE_KEYS.forEach(key => {
          if (backup[key] !== undefined) {
            setters[key](backup[key] as never);
          }
        });

        if (typeof backup.projectName === 'string') {
          modStore.setProjectName(backup.projectName);
        }
        if (typeof backup.baseMod === 'string') {
          modStore.setBaseMod(backup.baseMod as StoreSnapshot['baseMod']);
        }

        toast.success('Backup imported successfully!');
        onClose();
      } catch {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Database size={18} className="text-mod-primary" />
            Backup Manager
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            Export your entire mod project as a JSON file, or import a previously saved backup.
          </p>

          <button
            onClick={exportBackup}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-mod-primary transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-mod-primary/10 flex items-center justify-center text-mod-primary group-hover:bg-mod-primary group-hover:text-black transition-all">
              <Download size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-white">Export Backup</div>
              <div className="text-[10px] text-gray-500">Download all mod data as JSON</div>
            </div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={importBackup}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-blue-500 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Upload size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-white">Import Backup</div>
              <div className="text-[10px] text-gray-500">Restore from a JSON backup file</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
