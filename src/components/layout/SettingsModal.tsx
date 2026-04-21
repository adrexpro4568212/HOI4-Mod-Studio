import { Bot, ChevronRight, Code2, GitBranch, Globe, Settings, Sparkles, X, Zap } from 'lucide-react';
import type { Language } from '../../data/translations';

interface BaseModOption {
  id: string;
  name: string;
  desc: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  workMode: 'normal' | 'advanced';
  onSetWorkMode: (mode: 'normal' | 'advanced') => void;
  onOpenAgentSettings: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  baseMod: string;
  onSetBaseMod: (id: string) => void;
}

const baseModOptions: BaseModOption[] = [
  { id: 'vanilla', name: 'Vanilla HOI4', desc: 'Standard WW2 experience' },
  { id: 'millennium_dawn', name: 'Millennium Dawn', desc: 'Modern day mechanics' },
  { id: 'kaiserreich', name: 'Kaiserreich', desc: 'Legacy of the Weltkrieg' },
  { id: 'tno', name: 'The New Order (TNO)', desc: 'Narrative narrative mechanics' },
  { id: 'road_to_56', name: 'Road to 56', desc: 'Expanded timeline' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  t,
  workMode,
  onSetWorkMode,
  onOpenAgentSettings,
  language,
  onSetLanguage,
  baseMod,
  onSetBaseMod,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Settings size={18} className="text-mod-primary" />
            {t('settings')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          <section>
            <label className="block text-[10px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Zap size={14} className="text-mod-primary" /> {t('workMode')}
            </label>
            <div className="space-y-3">
              <button
                onClick={() => onSetWorkMode('normal')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${workMode === 'normal' ? 'bg-mod-primary/10 border-mod-primary' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workMode === 'normal' ? 'bg-mod-primary text-black' : 'bg-gray-800 text-gray-500'}`}>
                  <Sparkles size={20} />
                </div>
                <div className="text-left">
                  <div className={`font-bold text-sm ${workMode === 'normal' ? 'text-white' : 'text-gray-400'}`}>{t('modeNormal')}</div>
                  <div className="text-[10px] text-gray-500">{t('modeNormalDesc')}</div>
                </div>
              </button>
              <button
                onClick={() => onSetWorkMode('advanced')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${workMode === 'advanced' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workMode === 'advanced' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  <Code2 size={20} />
                </div>
                <div className="text-left">
                  <div className={`font-bold text-sm ${workMode === 'advanced' ? 'text-white' : 'text-gray-400'}`}>{t('modeAdvanced')}</div>
                  <div className="text-[10px] text-gray-500">{t('modeAdvancedDesc')}</div>
                </div>
              </button>
            </div>
          </section>

          <section className="pt-4 border-t border-gray-800">
            <label className="block text-[10px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Bot size={14} className="text-mod-primary" /> {t('aiAgents')}
            </label>
            <button
              onClick={onOpenAgentSettings}
              className="w-full flex items-center justify-between p-4 rounded-xl border bg-[#111] border-gray-800 hover:border-mod-primary transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-mod-primary/10 flex items-center justify-center text-mod-primary group-hover:bg-mod-primary group-hover:text-black transition-all">
                  <Bot size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">{t('configureAgentTeam')}</div>
                  <div className="text-[10px] text-gray-500">{t('agentTeamDesc')}</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
            </button>
          </section>

          <section>
            <label className="block text-[10px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Globe size={14} className="text-mod-primary" /> {t('selectLanguage')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSetLanguage('en')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${language === 'en' ? 'bg-mod-primary/10 border-mod-primary text-mod-primary' : 'bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600'}`}
              >
                <span className="text-sm font-bold">English</span>
                <span className="text-lg">🇺🇸</span>
              </button>
              <button
                onClick={() => onSetLanguage('es')}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${language === 'es' ? 'bg-mod-primary/10 border-mod-primary text-mod-primary' : 'bg-[#111] border-gray-800 text-gray-400 hover:border-gray-600'}`}
              >
                <span className="text-sm font-bold">Español</span>
                <span className="text-lg">🇪🇸</span>
              </button>
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
              <GitBranch size={14} className="text-mod-primary" /> {t('baseModContext')}
            </label>
            <div className="space-y-2">
              {baseModOptions.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onSetBaseMod(mod.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${baseMod === mod.id ? 'bg-mod-primary/5 border-mod-primary' : 'bg-[#111] border-gray-800 hover:border-gray-600'}`}
                >
                  <div className="font-bold text-white text-sm">{mod.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tighter">{mod.desc}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
