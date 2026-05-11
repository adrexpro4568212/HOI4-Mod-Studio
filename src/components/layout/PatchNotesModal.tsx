import { useState } from 'react';
import { X, Megaphone, Map, Code, Sparkles, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

interface PatchNote {
  version: string;
  date: string;
  changes: {
    type: 'added' | 'fixed' | 'changed';
    content: string;
  }[];
}

const patchNotesData: PatchNote[] = [
  {
    version: '1.2.1',
    date: '2026-04-23',
    changes: [
      { type: 'added', content: 'Photoshoot Studio: Fully functional interactive canvas with drag & drop, text and image assets, dynamic properties, and PNG export.' },
      { type: 'added', content: 'Pomelli Outreach: Integrated AI Generative Service to automatically draft engaging marketing campaigns tailored for Reddit, Discord, and Steam.' },
      { type: 'fixed', content: 'Generative Service: Resolved minor syntax issues causing the dev server to crash during AI campaign generation.' }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-04-22',
    changes: [
      { type: 'added', content: 'Multi-Language Support: Added full interface support for 7 languages (EN, ES, RU, DE, FR, PT, ZH).' },
      { type: 'added', content: 'Dev Tracker & Roadmap: Keep track of our progress directly from the Studio News panel.' },
      { type: 'added', content: 'Community Outreach: Integrated global modding community updates and propaganda tools.' },
      { type: 'changed', content: 'Enhanced Landing Page: New feature grid and updated project history.' }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-04-21',
    changes: [
      { type: 'added', content: 'GUI Editor: New visual editor for creating mod GUIs (windows, buttons, progress bars, etc.).' },
      { type: 'fixed', content: 'Tech Tree Editor: Now available for all mod bases (Vanilla, Kaiserreich, TNO, Road to 56).' },
      { type: 'fixed', content: 'Tech Tree badge: Now displays the selected mod base name instead of "Universal".' },
      { type: 'fixed', content: 'Ollama connection: Improved error handling when connection fails.' },
      { type: 'changed', content: 'Updated build configuration for better chunking.' }
    ]
  },
  {
    version: '1.0.0',
    date: '2026-04-21',
    changes: [
      { type: 'added', content: 'Initial release of HOI4 Mod Studio IDE.' },
      { type: 'added', content: 'Focus Tree Editor, Events Editor, Leaders Editor, and more.' },
      { type: 'added', content: 'AI Agent Team integration for specialized modding assistance.' },
      { type: 'added', content: 'Cloud Sync via Firebase and local persistence.' }
    ]
  }
];

const roadmapData = [
  {
    category: 'Tools',
    icon: <Layout className="text-blue-400" size={18} />,
    items: [
      { name: 'Visual Map Editor', status: 'In Progress', desc: 'Directly edit states and provinces on a 3D/2D map interface.' },
      { name: 'Advanced Asset Manager', status: 'Planned', desc: 'Centralized management for DDS textures and TGA files.' },
      { name: '3D Model Previewer', status: 'Researching', desc: 'View unit models and buildings directly in the studio.' }
    ]
  },
  {
    category: 'AI & Scripting',
    icon: <Code className="text-purple-400" size={18} />,
    items: [
      { name: 'Auto-Localization AI', status: 'In Progress', desc: 'Automatically translate your mod into all 7 Paradox languages.' },
      { name: 'Visual Scripting Nodes', status: 'Planned', desc: 'Create complex logic triggers without writing a single line of code.' }
    ]
  },
  {
    category: 'Content Sheets',
    icon: <Map className="text-green-400" size={18} />,
    items: [
      { name: 'TNO Narrative Framework', status: 'Planned', desc: 'Specialized tools for the complex GUI and narrative needs of TNO-style mods.' },
      { name: 'Kaiserreich Faction Manager', status: 'Planned', desc: 'Manage dynamic faction joining and civil war setups easily.' }
    ]
  }
];

export default function PatchNotesModal({ isOpen, onClose, t }: PatchNotesModalProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'roadmap'>('notes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-mod-primary/20 to-transparent border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mod-primary flex items-center justify-center text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
                Studio <span className="text-mod-primary">News</span>
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">HOI4 Mod Studio Dev Tracker</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-4 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'notes' ? 'text-mod-primary' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('patchNotes')}
            {activeTab === 'notes' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-mod-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'roadmap' ? 'text-mod-primary' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('roadmap')}
            {activeTab === 'roadmap' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-mod-primary" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'notes' ? (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                {patchNotesData.map((note) => (
                  <div key={note.version} className="relative pl-6 border-l border-white/5 pb-2">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-mod-primary border-4 border-[#111]" />
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black text-white italic">v{note.version}</h3>
                        <p className="text-[10px] text-gray-500 font-bold">{note.date}</p>
                      </div>
                      <div className="px-2 py-1 bg-mod-primary/10 border border-mod-primary/20 rounded text-[10px] font-bold text-mod-primary uppercase tracking-tighter">
                        Released
                      </div>
                    </div>
                    <div className="space-y-3">
                      {note.changes.map((change, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            change.type === 'added' ? 'bg-green-500' : 
                            change.type === 'fixed' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`} />
                          <p className="text-sm text-gray-400 leading-relaxed">
                            <span className={`font-bold uppercase text-[10px] mr-2 ${
                              change.type === 'added' ? 'text-green-500' : 
                              change.type === 'fixed' ? 'text-blue-500' : 'text-yellow-500'
                            }`}>{change.type}</span>
                            {change.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="roadmap"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                {roadmapData.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center gap-2 mb-4">
                      {cat.icon}
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{cat.category}</h3>
                    </div>
                    <div className="grid gap-3">
                      {cat.items.map((item) => (
                        <div key={item.name} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-mod-primary transition-colors">{item.name}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              item.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              item.status === 'Planned' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-normal">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-6 rounded-2xl bg-gradient-to-br from-mod-primary/10 to-transparent border border-mod-primary/20 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mod-primary/20 flex items-center justify-center text-mod-primary">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic">Community Driven Development</h4>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">We build what you need. Join our Discord or GitHub to suggest new features!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">© 2026 HOI4 Mod Studio</p>
          <div className="flex items-center gap-4">
            <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-tighter">Documentation</button>
            <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-tighter">Support</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
