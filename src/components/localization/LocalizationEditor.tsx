import { useModStore } from '../../store/useModStore';
import { Plus, Trash2, Globe, Languages, Sparkles, Loader2 } from 'lucide-react';
import { GenerativeService } from '../../services/GenerativeService';
import { useState } from 'react';

export default function LocalizationEditor() {
  const {
    localizations,
    addLocalization,
    updateLocalization,
    deleteLocalization
  } = useModStore();

  const [isTranslating, setIsTranslating] = useState(false);

  const bulkTranslate = async () => {
    if (localizations.length === 0) return;
    setIsTranslating(true);

    try {
      for (let i = 0; i < localizations.length; i++) {
        const loc = localizations[i];
        if (!loc.english) continue;

        const updates: Partial<typeof loc> = {};
        
        if (!loc.spanish) {
          updates.spanish = await GenerativeService.translateText(loc.english, 'Spanish');
        }
        if (!loc.french) {
          updates.french = await GenerativeService.translateText(loc.english, 'French');
        }

        if (Object.keys(updates).length > 0) {
          updateLocalization(i, updates);
        }
      }
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex h-full bg-[#121212] text-gray-200">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-[#1a1a1a] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-white flex items-center gap-3">
              <Globe className="text-amber-500" /> Localization Editor
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage in-game text translations for all your mod's entities.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={bulkTranslate}
              disabled={isTranslating || localizations.length === 0}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded border border-blue-500/30 transition-all disabled:opacity-30"
            >
              {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>AI Auto-Translate</span>
            </button>
            <button 
              onClick={addLocalization}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium px-4 py-2 rounded transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Plus size={16} /> Add Key
            </button>
          </div>
        </div>

        {/* Spreadsheet Area */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="bg-[#1c1b1b] rounded-lg shadow-lg border border-gray-800/50 flex-1 overflow-hidden flex flex-col">
            
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 p-4 bg-[#222] border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-400">
              <div className="flex items-center gap-2">
                <FileKeyIcon /> Localization Key
              </div>
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-blue-400" /> English
              </div>
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-red-400" /> Spanish
              </div>
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-green-400" /> French
              </div>
              <div className="w-8 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {localizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                  <Languages size={48} className="opacity-20" />
                  <p>No localization keys found. Add one to start translating.</p>
                </div>
              ) : (
                localizations.map((loc, idx) => (
                  <div 
                    key={loc.id} 
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-center p-2 rounded hover:bg-[#2a2a2a] transition-colors border border-transparent hover:border-gray-800 group"
                  >
                    <input 
                      type="text" 
                      value={loc.key}
                      onChange={(e) => updateLocalization(idx, { key: e.target.value })}
                      className="bg-[#0a0a0a] text-amber-400 font-mono text-sm border border-gray-800 focus:border-amber-500 rounded outline-none px-3 py-2 w-full"
                      placeholder="e.g. FOCUS_REARM"
                    />
                    <input 
                      type="text" 
                      value={loc.english}
                      onChange={(e) => updateLocalization(idx, { english: e.target.value })}
                      className="bg-[#0a0a0a] text-gray-200 text-sm border border-gray-800 focus:border-blue-400 rounded outline-none px-3 py-2 w-full"
                      placeholder="English text"
                    />
                    <input 
                      type="text" 
                      value={loc.spanish || ''}
                      onChange={(e) => updateLocalization(idx, { spanish: e.target.value })}
                      className="bg-[#0a0a0a] text-gray-200 text-sm border border-gray-800 focus:border-red-400 rounded outline-none px-3 py-2 w-full"
                      placeholder="Spanish text"
                    />
                    <input 
                      type="text" 
                      value={loc.french || ''}
                      onChange={(e) => updateLocalization(idx, { french: e.target.value })}
                      className="bg-[#0a0a0a] text-gray-200 text-sm border border-gray-800 focus:border-green-400 rounded outline-none px-3 py-2 w-full"
                      placeholder="French text"
                    />
                    <button 
                      onClick={() => deleteLocalization(idx)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function FileKeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <circle cx="10" cy="13" r="2"></circle>
      <line x1="11.5" y1="14.5" x2="16" y2="19"></line>
    </svg>
  );
}
