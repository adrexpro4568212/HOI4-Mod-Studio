import { useState } from 'react';

import { 
  Globe, Map as MapIcon, Plus, Trash2, Edit3, 
  Search, Crosshair, Database, BarChart3, Check
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';

export default function MapEditor() {
  const { states, addState, updateState, deleteState, baseMod } = useModStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState('');

  const activeState = states[activeIndex];

  const categories = ['rural', 'town', 'large_town', 'city', 'large_city', 'metropolis', 'megalopolis'];

  const filteredStates = states.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.owner.toLowerCase().includes(search.toLowerCase())
  );

  if (states.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#111] text-gray-500">
        <Globe size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold">No States Defined</h2>
        <p className="mb-6">Start by creating a new state for your mod.</p>
        <button 
          onClick={addState}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 rounded-lg transition-all"
        >
          Create First State
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#111] overflow-hidden">
      {/* Sidebar - States List */}
      <div className="w-80 bg-[#161616] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapIcon size={20} className="text-amber-500" />
              States
            </h2>
            <button 
              onClick={addState}
              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded border border-amber-500/30 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-600" size={14} />
            <input 
              placeholder="Search states, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 pl-9 pr-4 text-xs text-gray-300 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredStates.map((state) => {
            const actualIdx = states.indexOf(state);
            return (
              <div 
                key={state.id}
                onClick={() => setActiveIndex(actualIdx)}
                className={`p-4 cursor-pointer border-b border-gray-800/30 transition-all group flex justify-between items-center ${activeIndex === actualIdx ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : 'hover:bg-white/5'}`}
              >
                <div>
                  <div className={`text-sm font-semibold ${activeIndex === actualIdx ? 'text-amber-400' : 'text-gray-400'}`}>{state.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-[#222] text-gray-500 px-1.5 py-0.5 rounded font-mono font-bold">{state.owner}</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">{state.category}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteState(actualIdx); if (activeIndex >= actualIdx) setActiveIndex(Math.max(0, activeIndex - 1)); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Main */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Actions */}
        <div className="h-14 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6">
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Editing State:</span>
              <span className="text-sm font-mono text-amber-500">{activeState.id}</span>
           </div>
           <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase">
              <div className="flex items-center gap-1.5">
                <Database size={12} />
                <span>Base Mod: {baseMod.replace('_', ' ')}</span>
              </div>
           </div>
        </div>

        <div className="flex-1 flex">
          {/* Properties Panel */}
          <div className="w-96 bg-[#141414] border-r border-gray-800 p-6 space-y-6 overflow-y-auto">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Edit3 size={14} className="text-amber-500" /> Basic Info
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">State Name</label>
                  <input 
                    value={activeState.name}
                    onChange={(e) => updateState(activeIndex, { name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Owner Tag</label>
                  <input 
                    value={activeState.owner}
                    onChange={(e) => updateState(activeIndex, { owner: e.target.value.toUpperCase() })}
                    maxLength={3}
                    className="w-24 bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 px-3 text-sm text-white font-mono focus:border-amber-500/50 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-500" /> Demographics
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Manpower</label>
                  <input 
                    type="number"
                    value={activeState.manpower}
                    onChange={(e) => updateState(activeIndex, { manpower: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">State Category</label>
                  <select 
                    value={activeState.category}
                    onChange={(e) => updateState(activeIndex, { category: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500/50 outline-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-red-500" /> Provinces
              </h3>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Province IDs (Space separated)</label>
                <textarea 
                  value={activeState.provinces}
                  onChange={(e) => updateState(activeIndex, { provinces: e.target.value })}
                  placeholder="e.g. 1 2 3 45 120"
                  className="w-full h-32 bg-[#0a0a0a] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-300 font-mono focus:border-amber-500/50 outline-none resize-none"
                />
              </div>
            </section>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="flex-1 bg-[#0a0a0a] p-8 flex flex-col items-center justify-center relative">
            <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Map Visualization</span>
            </div>

            <div className="w-full max-w-4xl aspect-video bg-[#111] border border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center group">
               {/* This would be an SVG map in a more advanced version */}
               <Globe size={160} className="text-gray-800 opacity-20" />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                    <MapIcon size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Visual Mapping Active</h4>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                    Click on the world regions to auto-assign TAGs or create new states in specific locations.
                  </p>
                  
                  <div className="mt-8 flex gap-3">
                    <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-400 font-mono">
                      LAT: 48.8566 | LON: 2.3522
                    </div>
                  </div>
               </div>
               
               {/* Dynamic Overlay based on active state */}
               <div className="absolute bottom-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl max-w-xs transition-all opacity-0 group-hover:opacity-100">
                  <div className="text-[10px] font-bold text-amber-500 uppercase mb-2">State Highlight</div>
                  <div className="text-xs text-white font-bold">{activeState.name} ({activeState.owner})</div>
                  <div className="text-[10px] text-gray-500 mt-1">Included Provinces: {activeState.provinces.split(' ').filter(Boolean).length}</div>
               </div>
            </div>

            <div className="mt-8 flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full text-green-500 text-[10px] font-bold uppercase">
                  <Check size={12} /> Map Sync Active
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase">
                  <Database size={12} /> Auto-saving to Cloud
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
