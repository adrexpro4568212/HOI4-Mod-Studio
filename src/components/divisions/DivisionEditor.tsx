import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Trash2, Shield, Info, Layers, 
  ChevronRight, Check, X, FileCode, Copy, 
  Sword, ShieldAlert, Zap, Target
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';

import { modDictionaries } from '../../data/modDictionaries';
import { calculateStats } from '../../data/unitStats';

export default function DivisionEditor() {
  const { 
    baseMod, divisionTemplates, addDivisionTemplate, updateDivisionTemplate, deleteDivisionTemplate,
    armyGroups, addArmyGroup, addArmyToGroup, deleteArmyFromGroup, addDivisionToArmy, removeDivisionFromArmy, updateArmyGroup, deleteArmyGroup
  } = useModStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingSlot, setEditingSlot] = useState<{ row: number; col: number; type: 'regiment' | 'support' } | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeTemplate = divisionTemplates[activeIndex];
  const dictionary = modDictionaries[baseMod];
  const stats = activeTemplate ? calculateStats(activeTemplate.regiments, activeTemplate.support) : null;

  if (!activeTemplate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#111] text-gray-500">
        <Users size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold">No Division Templates</h2>
        <p className="mb-6">Create your first division template to get started.</p>
        <button 
          onClick={addDivisionTemplate}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 rounded-lg transition-all"
        >
          Add Template
        </button>
      </div>
    );
  }

  const handleSetUnit = (unitId: string | null, manualSlot?: { row: number; col: number; type: 'regiment' | 'support' }) => {
    const targetSlot = manualSlot || editingSlot;
    if (!targetSlot) return;

    if (targetSlot.type === 'regiment') {
      const newRegiments = [...activeTemplate.regiments.map(r => [...r])];
      newRegiments[targetSlot.row][targetSlot.col] = unitId;
      updateDivisionTemplate(activeIndex, { regiments: newRegiments });
    } else {
      const newSupport = [...activeTemplate.support];
      newSupport[targetSlot.col] = unitId;
      updateDivisionTemplate(activeIndex, { support: newSupport });
    }
    setEditingSlot(null);
  };

  const generateCode = () => {
    let code = `division_template = {\n\tname = "${activeTemplate.name}"\n\n`;
    
    code += `\tregiments = {\n`;
    activeTemplate.regiments.forEach((row, rIdx) => {
      row.forEach((unit, cIdx) => {
        if (unit) {
          code += `\t\t${unit} = { x = ${cIdx} y = ${rIdx} }\n`;
        }
      });
    });
    code += `\t}\n\n`;

    code += `\tsupport = {\n`;
    activeTemplate.support.forEach((unit, idx) => {
      if (unit) {
        code += `\t\t${unit} = { x = 0 y = ${idx} }\n`;
      }
    });
    code += `\t}\n`;

    code += `}`;
    return code;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Users className="text-black" size={24} />
          </div>
          <div>
            <input 
              value={activeTemplate.name}
              onChange={(e) => updateDivisionTemplate(activeIndex, { name: e.target.value })}
              className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 p-0 w-64"
            />
            <p className="text-xs text-gray-500">Base Mod: <span className="text-amber-500 uppercase">{baseMod.replace('_', ' ')}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowCode(!showCode)}
             className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-sm transition-colors"
           >
             {showCode ? <Layers size={16} /> : <FileCode size={16} />}
             {showCode ? 'Designer' : 'View Code'}
           </button>
           <button 
             onClick={addDivisionTemplate}
             className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-md text-sm transition-colors border border-amber-500/30"
           >
             <Plus size={16} /> New Template
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Templates & Hierarchy */}
        <div className="w-72 bg-[#161616] border-r border-gray-800 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800/50">
              TEMPLATES
            </div>
            {divisionTemplates.map((t, idx) => (
              <div 
                key={t.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-4 cursor-pointer border-b border-gray-800/30 transition-all flex justify-between items-center group ${activeIndex === idx ? 'bg-amber-500/5 border-l-4 border-l-amber-500' : 'hover:bg-white/5'}`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${activeIndex === idx ? 'text-amber-400' : 'text-gray-400'}`}>{t.name}</span>
                  <span className="text-[10px] text-gray-600 font-mono uppercase">{t.id}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteDivisionTemplate(idx); if (activeIndex >= idx) setActiveIndex(Math.max(0, activeIndex - 1)); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800/50 mt-4 flex justify-between items-center">
              <span>ARMY HIERARCHY (OOB)</span>
              <button onClick={addArmyGroup} className="hover:text-amber-500 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            
            <div className="p-2 space-y-2">
              {armyGroups.map((group, gIdx) => (
                <div key={group.id} className="space-y-1">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between group/ag">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-gray-500" />
                      <input 
                        value={group.name}
                        onChange={(e) => updateArmyGroup(gIdx, { name: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 p-0 text-[11px] font-bold text-gray-300 uppercase tracking-tighter w-32"
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/ag:opacity-100 transition-opacity">
                      <button onClick={() => addArmyToGroup(gIdx)} className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-amber-500"><Plus size={12}/></button>
                      <button onClick={() => deleteArmyGroup(gIdx)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                  </div>
                  
                  {group.armies.map((army, aIdx) => (
                    <div key={army.id} className="ml-4 pl-3 border-l border-gray-800/50 space-y-1 relative">
                      <div className="absolute top-0 left-0 w-3 h-4 border-b border-gray-800/50 rounded-bl-lg"></div>
                      <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between group/army">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-amber-500 rotate-90" />
                          <span className="text-[11px] font-bold text-white uppercase tracking-tighter">{army.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/army:opacity-100 transition-opacity">
                          <button 
                            onClick={() => addDivisionToArmy(gIdx, aIdx, activeTemplate.id)}
                            title="Add Current Template to this Army"
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-amber-500"
                          >
                            <Plus size={12}/>
                          </button>
                          <button onClick={() => deleteArmyFromGroup(gIdx, aIdx)} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-500"><Trash2 size={12}/></button>
                        </div>
                      </div>
                      
                      <div className="ml-4 pl-3 border-l border-gray-800/30 space-y-1 relative">
                        <div className="absolute top-0 left-0 w-3 h-4 border-b border-gray-800/30 rounded-bl-lg"></div>
                        {army.divisions.map((div, dIdx) => (
                          <div key={div.id} className="p-2 rounded-lg bg-black/40 border border-gray-800 text-[10px] text-gray-500 flex justify-between items-center group/div hover:border-gray-600 transition-all">
                            <div className="flex flex-col">
                              <span className="text-gray-300">{div.name}</span>
                              <span className="text-[8px] text-gray-600">{div.templateId}</span>
                            </div>
                            <button 
                              onClick={() => removeDivisionFromArmy(gIdx, aIdx, dIdx)}
                              className="opacity-0 group-hover/div:opacity-100 p-1 hover:text-red-500 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {armyGroups.length === 0 && (
                <div className="p-4 text-center border border-dashed border-gray-800 rounded-xl">
                  <p className="text-[10px] text-gray-600 uppercase">No Army Groups</p>
                  <button onClick={addArmyGroup} className="mt-2 text-[10px] text-amber-500 hover:underline">Create One</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800">
             <button 
               disabled={armyGroups.length === 0 || armyGroups[0].armies.length === 0}
               onClick={() => {
                 if (armyGroups.length > 0 && armyGroups[0].armies.length > 0) {
                   addDivisionToArmy(0, 0, activeTemplate.id);
                 }
               }}
               className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-700 hover:enabled:border-amber-500 py-3 rounded-xl text-[10px] text-gray-500 hover:enabled:text-amber-500 transition-all uppercase tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <Plus size={14} /> Add Unit to OOB
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {showCode ? (
            <div className="flex-1 bg-[#0a0a0a] p-6 font-mono text-sm overflow-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                <span className="text-gray-500 text-xs">Generated Clausewitz Script</span>
                <button 
                  onClick={copyCode}
                  className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-amber-500/90">{generateCode()}</pre>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Stats Panel */}
              <div className="w-80 bg-[#141414] border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-amber-500" /> Template Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Soft Attack', value: stats?.soft_attack.toFixed(1), icon: <Target size={14} className="text-red-400" /> },
                    { label: 'Hard Attack', value: stats?.hard_attack.toFixed(1), icon: <Sword size={14} className="text-orange-400" /> },
                    { label: 'Breakthrough', value: stats?.breakthrough.toFixed(1), icon: <Zap size={14} className="text-yellow-400" /> },
                    { label: 'Defense', value: stats?.defense.toFixed(1), icon: <Shield size={14} className="text-blue-400" /> },
                    { label: 'Org', value: stats?.organization.toFixed(1), icon: <ShieldAlert size={14} className="text-green-400" /> },
                    { label: 'Width', value: stats?.combat_width.toFixed(1), icon: <Layers size={14} className="text-purple-400" /> }
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1 opacity-60">
                        {stat.icon}
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</span>
                      </div>
                      <div className="text-lg font-mono font-bold text-white">{stat.value || '0.0'}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-500 mb-2">Designer Note</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    "Stats are currently simulated based on a standard unit model. Real stats depend on your mod's technology and land doctrine settings."
                  </p>
                </div>
              </div>

              {/* Grid Designer */}
              <div className="flex-1 p-8 overflow-auto bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center">
                <div className="flex gap-8">
                   {/* Support Slot */}
                   <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase text-center mb-1">Support</h4>
                      <div className="space-y-2">
                         {activeTemplate.support.map((unit, idx) => (
                           <div 
                             key={idx}
                             onClick={() => setEditingSlot({ row: 0, col: idx, type: 'support' })}
                             className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${unit ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' : 'border-gray-800 bg-[#141414] hover:border-gray-700 text-gray-700 hover:text-gray-500'}`}
                           >
                             {unit ? (
                               <div className="flex flex-col items-center gap-1">
                                 <Layers size={18} />
                                 <span className="text-[8px] font-bold uppercase truncate w-14 text-center">{unit}</span>
                               </div>
                             ) : <Plus size={16} />}
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Main Grid */}
                   <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase text-center mb-1">Combat Battalions</h4>
                      <div className="flex gap-2">
                        {activeTemplate.regiments[0].map((_, colIdx) => (
                          <div key={colIdx} className="flex flex-col gap-2">
                            {activeTemplate.regiments.map((row, rowIdx) => {
                              const unit = row[colIdx];
                              return (
                                <div 
                                  key={rowIdx}
                                  onClick={() => setEditingSlot({ row: rowIdx, col: colIdx, type: 'regiment' })}
                                  className={`w-20 h-20 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-2 relative group ${unit ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-transparent text-amber-500' : 'border-gray-800 bg-[#141414] hover:border-gray-700 border-dashed text-gray-700 hover:text-gray-500'}`}
                                >
                                  {unit ? (
                                    <>
                                      <Shield size={24} className="mb-1" />
                                      <span className="text-[9px] font-bold uppercase text-center leading-tight">{unit.replace('_', ' ')}</span>
                                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleSetUnit(null, {row: rowIdx, col: colIdx, type: 'regiment'}); }}
                                          className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                                        >
                                          <X size={12} className="text-red-500" />
                                        </button>
                                      </div>
                                    </>
                                  ) : <Plus size={20} />}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Unit Selection Modal */}
              <AnimatePresence>
                {editingSlot && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-2xl bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full"
                    >
                      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-transparent">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Plus className="text-amber-500" size={20} />
                          Select {editingSlot.type === 'regiment' ? 'Battalion' : 'Support Company'}
                        </h3>
                        <button onClick={() => setEditingSlot(null)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={24} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
                        {(editingSlot.type === 'regiment' ? dictionary.battalions : dictionary.supportUnits).map(unit => (
                          <button
                            key={unit.id}
                            onClick={() => handleSetUnit(unit.id)}
                            className="flex items-center gap-4 bg-[#222] hover:bg-amber-500/10 border border-gray-800 hover:border-amber-500/50 p-4 rounded-xl transition-all group"
                          >
                            <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                              {unit.type === 'armor' ? <Zap size={24} /> : 
                               unit.type === 'artillery' ? <Target size={24} /> :
                               unit.type === 'infantry' ? <Users size={24} /> :
                               <Shield size={24} />}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white text-sm">{unit.name}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{unit.type}</div>
                            </div>
                            <ChevronRight className="ml-auto text-gray-700 group-hover:text-amber-500 transition-colors" size={16} />
                          </button>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-black/40 text-center">
                        <button 
                          onClick={() => handleSetUnit(null)}
                          className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                        >
                          Clear Slot
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
