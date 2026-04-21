import { useModStore } from '../../store/useModStore';
import { Plus, Trash2, ShieldAlert, Zap, BookOpen, Anchor } from 'lucide-react';
import { modDictionaries } from '../../data/modDictionaries';

const availableIcons = [
  { id: 'generic_idea', icon: BookOpen },
  { id: 'military_idea', icon: ShieldAlert },
  { id: 'economic_idea', icon: Zap },
  { id: 'naval_idea', icon: Anchor },
];

export default function NationalSpiritsCreator() {
  const {
    baseMod,
    spirits,
    activeSpiritIndex,
    setActiveSpiritIndex,
    addSpirit,
    deleteSpirit,
    updateActiveSpirit,
    addModifierToActiveSpirit,
    updateModifierInActiveSpirit,
    removeModifierFromActiveSpirit
  } = useModStore();

  const currentDict = modDictionaries[baseMod];
  const modifierTypes = currentDict.modifiers;

  const activeSpirit = spirits[activeSpiritIndex];

  if (!activeSpirit) return null;

  return (
    <div className="flex h-full bg-[#121212] text-gray-200">
      {/* Left Sidebar - Spirits List */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="font-bold text-sm tracking-wider uppercase text-gray-400">National Spirits</h2>
          <button 
            onClick={addSpirit}
            className="p-1 hover:bg-gray-700 rounded text-amber-500 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {spirits.map((spirit, idx) => (
            <div 
              key={spirit.id}
              onClick={() => setActiveSpiritIndex(idx)}
              className={`p-3 rounded cursor-pointer flex justify-between items-center transition-all group ${
                activeSpiritIndex === idx 
                  ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-2 border-amber-500' 
                  : 'hover:bg-[#2a2a2a] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <BookOpen size={16} className={activeSpiritIndex === idx ? 'text-amber-500' : 'text-gray-500'} />
                <span className="truncate text-sm font-medium">{spirit.name || 'Unnamed Spirit'}</span>
              </div>
              {spirits.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSpirit(idx);
                  }}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white">Spirit Architect</h1>
            <p className="text-gray-400 mt-1">Design national ideas and manage their strategic modifiers.</p>
          </div>

          <div className="bg-[#1c1b1b] p-6 rounded-lg shadow-lg border border-gray-800/50 space-y-8">
            
            {/* Identity */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Spirit Name</label>
                <input 
                  type="text" 
                  value={activeSpirit.name}
                  onChange={(e) => updateActiveSpirit({ name: e.target.value })}
                  className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors text-lg"
                  placeholder="e.g. Lessons of War"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Spirit Icon</label>
                <div className="flex gap-4">
                  {availableIcons.map(iconDef => {
                    const IconComp = iconDef.icon;
                    const isActive = activeSpirit.picture === iconDef.id;
                    return (
                      <button
                        key={iconDef.id}
                        onClick={() => updateActiveSpirit({ picture: iconDef.id })}
                        className={`w-16 h-16 rounded-md flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                            : 'bg-[#0a0a0a] border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                        }`}
                      >
                        <IconComp size={32} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modifiers Engine */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  Modifiers
                </h3>
                <button 
                  onClick={addModifierToActiveSpirit}
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 font-medium px-3 py-1 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors"
                >
                  <Plus size={16} /> Add Modifier
                </button>
              </div>

              <div className="space-y-3">
                {activeSpirit.modifiers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm italic">
                    No active modifiers. Add one to give this spirit an effect.
                  </div>
                ) : (
                  activeSpirit.modifiers.map((modifier, modIdx) => (
                    <div key={modifier.id} className="flex gap-4 items-center bg-[#0a0a0a] p-3 rounded border border-gray-800">
                      <select
                        value={modifier.type}
                        onChange={(e) => updateModifierInActiveSpirit(modIdx, 'type', e.target.value)}
                        className="flex-1 bg-transparent text-white border-none outline-none cursor-pointer"
                      >
                        {modifierTypes.map(type => (
                          <option key={type.id} value={type.id} className="bg-[#1c1b1b]">{type.name}</option>
                        ))}
                      </select>
                      
                      <div className="w-px h-6 bg-gray-800" />
                      
                      <div className="flex items-center gap-2 w-32">
                        <span className="text-gray-500 text-sm font-mono font-bold">=</span>
                        <input 
                          type="text" 
                          value={modifier.value}
                          onChange={(e) => updateModifierInActiveSpirit(modIdx, 'value', e.target.value)}
                          className="w-full bg-transparent text-amber-400 font-mono border-b border-gray-700 focus:border-amber-500 outline-none px-1 py-1"
                          placeholder="0.05"
                        />
                      </div>

                      <button 
                        onClick={() => removeModifierFromActiveSpirit(modIdx)}
                        className="text-gray-600 hover:text-red-400 p-1"
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
    </div>
  );
}
