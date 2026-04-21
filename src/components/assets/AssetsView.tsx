import { useState } from 'react';
import { User, Flag, Target } from 'lucide-react';
import PortraitTool from './PortraitTool';
import FlagTool from './FlagTool';
import IconTool from './IconTool';
import { useModStore } from '../../store/useModStore';
import { translations } from '../../data/translations';

export default function AssetsView() {
  const [activeSubTab, setActiveSubTab] = useState<'portrait' | 'flag' | 'icon'>('portrait');
  const { language } = useModStore();
  const t = (key: keyof typeof translations['en']) => {
    const lang = language as keyof typeof translations;
    return (translations[lang] || translations['en'])[key];
  };

  const subTabs = [
    { id: 'portrait', label: t('portraitStudio'), icon: User },
    { id: 'flag', label: t('flags'), icon: Flag },
    { id: 'icon', label: t('iconStudio'), icon: Target },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 p-2 bg-[#1a1a1a] border-b border-gray-800">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === tab.id 
                ? 'bg-mod-primary/10 text-mod-primary border border-mod-primary/20' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'portrait' && <PortraitTool />}
        {activeSubTab === 'flag' && <FlagTool />}
        {activeSubTab === 'icon' && <IconTool />}
      </div>
    </div>
  );
}
