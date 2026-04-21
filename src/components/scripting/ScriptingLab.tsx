import { useState, useMemo, useCallback } from 'react';
import { Code2, Blocks, Save, Copy, Plus, Trash2, Info, Play, Wand2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scriptDictionary, type HOI4Command } from '../../data/scriptDictionary';
import { useModStore } from '../../store/useModStore';

interface ActiveBlock {
  id: string;
  commandId: string;
  values: string[];
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export default function ScriptingLab() {
  const { workMode } = useModStore();
  const [activeBlocks, setActiveBlocks] = useState<ActiveBlock[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const generatedCode = useMemo(() => {
    let code = 'focus = {\n';
    activeBlocks.forEach(block => {
      const cmd = scriptDictionary.find(c => c.id === block.commandId);
      if (cmd) {
        let snippet = cmd.snippet;
        block.values.forEach((val, idx) => {
          const placeholder = new RegExp(`\\$\\{${idx + 1}(:[^}]+)?\\}`, 'g');
          snippet = snippet.replace(placeholder, val || 'VALUE');
        });
        code += `\t${snippet.replace(/\n/g, '\n\t')}\n`;
      }
    });
    code += '}';
    return code;
  }, [activeBlocks]);

  const addBlock = useCallback((cmd: HOI4Command) => {
    setActiveBlocks([...activeBlocks, {
      id: generateId(),
      commandId: cmd.id,
      values: cmd.parameters?.map(() => '') || []
    }]);
  }, [activeBlocks]);

  const updateBlockValue = (blockId: string, paramIdx: number, value: string) => {
    setActiveBlocks(activeBlocks.map(b => 
      b.id === blockId ? { ...b, values: b.values.map((v, i) => i === paramIdx ? value : v) } : b
    ));
  };

  const removeBlock = (id: string) => {
    setActiveBlocks(activeBlocks.filter(b => b.id !== id));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] overflow-hidden">
      {/* Left: Logic Builder */}
      <div className="w-1/2 flex flex-col border-r border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2">
            <Blocks size={18} className="text-mod-primary" />
            <span className="text-sm font-bold text-white">Logic Builder</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
              <Info size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {activeBlocks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale"
              >
                <Wand2 size={48} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No logic blocks added</p>
                <p className="text-[10px] mt-1">Select a command from the list to start building.</p>
              </motion.div>
            ) : (
              activeBlocks.map((block, index) => {
                const cmd = scriptDictionary.find(c => c.id === block.commandId);
                return (
                  <motion.div
                    key={block.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="group relative bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 hover:border-mod-primary/50 transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cmd?.type === 'effect' ? 'bg-mod-primary' : 'bg-purple-500'}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{cmd?.type}</span>
                        <span className="text-xs font-bold text-white">{cmd?.name}</span>
                      </div>
                      <button 
                        onClick={() => removeBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cmd?.parameters?.map((param, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-3">
                          <label className="text-[10px] text-gray-500 w-24 truncate">{param}</label>
                          <input 
                            type="text"
                            value={block.values[pIdx]}
                            onChange={(e) => updateBlockValue(block.id, pIdx, e.target.value)}
                            placeholder="Type value..."
                            className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-mod-accent focus:border-mod-primary outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {index < activeBlocks.length - 1 && (
                      <div className="absolute -bottom-4 left-6 w-0.5 h-4 bg-gray-800 z-0" />
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Command Palette */}
        <div className="h-64 border-t border-gray-800 bg-[#111] p-4 flex flex-col">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Available Commands</div>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start">
            {scriptDictionary.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => addBlock(cmd)}
                className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-gray-800 hover:border-mod-primary hover:bg-mod-primary/5 text-left group transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-200">{cmd.name}</span>
                  <span className="text-[9px] text-gray-600 truncate max-w-[120px]">{cmd.description}</span>
                </div>
                <Plus size={12} className="text-gray-700 group-hover:text-mod-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Code Editor/Preview */}
      <div className="w-1/2 flex flex-col bg-[#050505]">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-mod-accent" />
            <span className="text-sm font-bold text-white">Expert Script</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                isCopied ? 'bg-green-500 text-black' : 'bg-mod-primary/10 text-mod-primary border border-mod-primary/20 hover:bg-mod-primary hover:text-black'
              }`}
            >
              {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {isCopied ? 'COPIED' : 'COPY SCRIPT'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-y-auto custom-scrollbar">
          <div className="relative group">
            <pre className="text-gray-400 whitespace-pre-wrap">
              {generatedCode.split('\n').map((line, i) => (
                <div key={i} className="flex group/line">
                  <span className="w-8 text-gray-700 select-none text-[10px] pr-2 text-right">{i + 1}</span>
                  <span className={line.includes('=') ? 'text-mod-accent' : line.trim().startsWith('#') ? 'text-gray-600' : 'text-gray-300'}>
                    {line}
                  </span>
                </div>
              ))}
            </pre>
            
            {/* Auto-completion hint for Experts */}
            {workMode === 'advanced' && (
              <div className="mt-8 pt-8 border-t border-gray-900">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase mb-4 tracking-widest">
                  <Play size={10} /> Expert Snippets
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-xl border border-gray-800 bg-[#111] hover:border-mod-accent transition-all group">
                    <div className="text-[10px] font-bold text-gray-400 group-hover:text-mod-accent">Civil War Template</div>
                    <div className="text-[9px] text-gray-700">Full logic for splintering states and spawning divisions.</div>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl border border-gray-800 bg-[#111] hover:border-mod-accent transition-all group">
                    <div className="text-[10px] font-bold text-gray-400 group-hover:text-mod-accent">Peace Deal Script</div>
                    <div className="text-[9px] text-gray-700">Custom scripted peace conference bypass.</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#111] border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Status</span>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Valid Syntax
              </span>
            </div>
            <div className="flex flex-col border-l border-gray-800 pl-4">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Output File</span>
              <span className="text-[10px] text-gray-300 font-bold font-mono">common/national_focus/mod.txt</span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-gray-800">
            <Save size={14} />
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
}
