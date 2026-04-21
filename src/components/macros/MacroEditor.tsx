import { useState } from 'react';
import { useModStore } from '../../store/useModStore';
import { Plus, Trash2, Code2, Play } from 'lucide-react';

export default function MacroEditor() {
  const { macros, activeMacroIndex, setActiveMacroIndex, addMacro, deleteMacro, updateActiveMacro } = useModStore();
  const [filter, setFilter] = useState<'all' | 'trigger' | 'effect'>('all');

  const filteredMacros = macros.filter(m => filter === 'all' || m.type === filter);
  const activeMacro = macros[activeMacroIndex];

  return (
    <div className="flex h-full bg-[#121212] text-gray-200">
      {/* Sidebar: Macro List */}
      <div className="w-64 border-r border-gray-800 flex flex-col bg-[#1a1a1a]">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="font-semibold text-gray-200 flex items-center gap-2">
            <Code2 size={18} className="text-amber-500" /> Macros
          </h2>
        </div>
        
        <div className="p-2 border-b border-gray-800 flex gap-1">
          <button onClick={() => addMacro('trigger')} className="flex-1 bg-[#2a2a2a] hover:bg-[#333] p-1.5 rounded text-xs flex justify-center items-center gap-1 transition-colors">
            <Plus size={14} /> Trigger
          </button>
          <button onClick={() => addMacro('effect')} className="flex-1 bg-[#2a2a2a] hover:bg-[#333] p-1.5 rounded text-xs flex justify-center items-center gap-1 transition-colors">
            <Plus size={14} /> Effect
          </button>
        </div>

        <div className="flex px-2 pt-2 gap-2 text-xs">
          {(['all', 'trigger', 'effect'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded capitalize ${filter === f ? 'bg-amber-500/20 text-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredMacros.map((macro) => {
            const indexInStore = macros.findIndex(m => m.id === macro.id);
            return (
              <div
                key={macro.id}
                onClick={() => setActiveMacroIndex(indexInStore)}
                className={`p-2 rounded cursor-pointer flex justify-between items-center group transition-colors ${
                  activeMacroIndex === indexInStore ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-[#2a2a2a] border border-transparent'
                }`}
              >
                <div className="flex flex-col truncate">
                  <span className={`text-sm ${activeMacroIndex === indexInStore ? 'text-amber-500 font-medium' : 'text-gray-300'}`}>
                    {macro.name}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{macro.type}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMacro(indexInStore);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {filteredMacros.length === 0 && (
            <div className="text-center p-4 text-xs text-gray-500 italic mt-4">
              No macros found. Create one above!
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Edit Macro */}
      <div className="flex-1 flex flex-col relative bg-[#151515]">
        {macros.length === 0 || !activeMacro ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Code2 size={48} className="mb-4 opacity-20" />
            <p className="text-lg">Select or create a Macro</p>
            <p className="text-sm mt-2 opacity-70">Scripted Triggers & Effects help you avoid repeating code.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-800 bg-[#1a1a1a]">
              <div className="max-w-2xl">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Macro Name (ID)</label>
                <input
                  type="text"
                  value={activeMacro.name}
                  onChange={(e) => updateActiveMacro({ name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                  className="w-full bg-[#111] border border-gray-800 rounded px-3 py-2 text-gray-200 font-mono focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="my_custom_trigger"
                />
                <p className="text-xs text-gray-500 mt-2">Only alphanumeric characters and underscores allowed.</p>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Play size={12} className={activeMacro.type === 'trigger' ? 'text-blue-400' : 'text-green-400'} />
                  Clausewitz Script ({activeMacro.type})
                </label>
              </div>
              <textarea
                value={activeMacro.code}
                onChange={(e) => updateActiveMacro({ code: e.target.value })}
                className="flex-1 w-full bg-[#111] border border-gray-800 rounded p-4 text-gray-300 font-mono text-sm focus:border-amber-500 focus:outline-none transition-colors resize-none"
                placeholder={`# Write your ${activeMacro.type} script here...\n\nif = {\n  limit = { ... }\n}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
