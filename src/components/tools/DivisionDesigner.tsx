import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Sword, Target, Ruler, 
  Trash2, Plus, ChevronRight, 
  Copy, Save,
  User, LayoutGrid, Layers
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { MOD_BATTALIONS } from '../../data/battalionData';
import type { ReactNode } from 'react';

interface TemplateGridCell {
  x: number;
  y: number;
  battalionId: string | null;
}

export default function DivisionDesigner() {
  const { baseMod } = useModStore();
  const [templateName, setTemplateName] = useState('New Division Template');
  const [cells, setCells] = useState<TemplateGridCell[]>(
    Array.from({ length: 25 }, (_, i) => ({ x: i % 5, y: Math.floor(i / 5), battalionId: null }))
  );
  const [supportCompanies] = useState<(string | null)[]>(Array(5).fill(null));
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // Translation helper (can be used later)
  // const t = (key: string) => { ... };

  const availableBattalions = MOD_BATTALIONS[baseMod] || MOD_BATTALIONS.vanilla;

  // Calculate Stats
  const stats = useMemo(() => {
    const total = {
      combat_width: 0,
      soft_attack: 0,
      hard_attack: 0,
      defense: 0,
      breakthrough: 0,
      manpower: 0,
    };

    cells.forEach(cell => {
      if (cell.battalionId) {
        const b = availableBattalions.find(x => x.id === cell.battalionId);
        if (b) {
          total.combat_width += b.stats.combat_width;
          total.soft_attack += b.stats.soft_attack;
          total.hard_attack += b.stats.hard_attack;
          total.defense += b.stats.defense;
          total.breakthrough += b.stats.breakthrough;
        }
      }
    });

    return total;
  }, [cells, availableBattalions]);

  const handleCellClick = (index: number) => {
    setSelectedCell(index);
  };

  const setBattalion = (battalionId: string | null) => {
    if (selectedCell === null) return;
    const newCells = [...cells];
    newCells[selectedCell].battalionId = battalionId;
    setCells(newCells);
    setSelectedCell(null);
  };

  const generateScript = () => {
    const regiments: Record<string, { x: number; y: number }[]> = {};
    cells.forEach(cell => {
      if (cell.battalionId) {
        if (!regiments[cell.battalionId]) regiments[cell.battalionId] = [];
        regiments[cell.battalionId].push({ x: cell.x, y: cell.y });
      }
    });

    let script = `division_template = {\n\tname = "${templateName}"\n\tregiments = {\n`;
    Object.entries(regiments).forEach(([id, coords]) => {
      coords.forEach(c => {
        script += `\t\t${id} = { x = ${c.x} y = ${c.y} }\n`;
      });
    });
    script += `\t}\n\tsupport = {\n`;
    supportCompanies.forEach(id => {
      if (id) script += `\t\t${id} = { x = 0 y = 0 }\n`;
    });
    script += `\t}\n}`;
    return script;
  };

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden bg-[#0c0c0c]">
      {/* Left Sidebar: Settings & Export */}
      <div className="w-80 flex flex-col gap-6 overflow-y-auto">
        <div className="glass glass-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-mod-primary/10 rounded-lg">
              <Layers className="text-mod-primary" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Template Info</h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Division Name</label>
            <input 
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-mod-primary outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-3">
            <button 
              onClick={() => {
                const s = generateScript();
                navigator.clipboard.writeText(s);
                alert('Script copied to clipboard!');
              }}
              className="w-full flex items-center justify-center gap-2 bg-mod-primary hover:bg-mod-accent text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-mod-primary/10"
            >
              <Copy size={16} />
              <span className="text-xs uppercase tracking-widest">Copy Script</span>
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all">
              <Save size={16} />
              <span className="text-xs uppercase tracking-widest">Save to Project</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="glass glass-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-mod-primary/10 rounded-lg">
              <Target className="text-mod-primary" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Combat Stats</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <StatRow icon={<Ruler size={14}/>} label="Combat Width" value={stats.combat_width} color="text-amber-400" />
            <StatRow icon={<Sword size={14}/>} label="Soft Attack" value={stats.soft_attack} color="text-red-400" />
            <StatRow icon={<Target size={14}/>} label="Hard Attack" value={stats.hard_attack} color="text-blue-400" />
            <StatRow icon={<Shield size={14}/>} label="Defense" value={stats.defense} color="text-green-400" />
            <StatRow icon={<LayoutGrid size={14}/>} label="Breakthrough" value={stats.breakthrough} color="text-purple-400" />
          </div>
        </div>

        {/* OOB Hierarchy (Simplified) */}
        <div className="glass glass-border rounded-2xl p-5 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-mod-primary/10 rounded-lg">
              <User className="text-mod-primary" size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Army Hierarchy</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-500" />
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter">1st Army Group</span>
            </div>
            <div className="ml-4 p-2 rounded-lg bg-mod-primary/5 border border-mod-primary/20 flex items-center gap-2">
              <ChevronRight size={14} className="text-mod-primary rotate-90" />
              <span className="text-[11px] font-bold text-white uppercase tracking-tighter">1st Army</span>
            </div>
            <div className="ml-8 space-y-1">
               <div className="p-2 rounded-lg bg-black/40 border border-gray-800 text-[10px] text-gray-500 flex justify-between items-center group hover:border-gray-600 transition-all">
                 <span>Infantry Division 1</span>
                 <span className="text-[8px] bg-gray-800 px-1.5 py-0.5 rounded">Berlin</span>
               </div>
               <div className="p-2 rounded-lg bg-black/40 border border-gray-800 text-[10px] text-gray-500 flex justify-between items-center group hover:border-gray-600 transition-all">
                 <span>Infantry Division 2</span>
                 <span className="text-[8px] bg-gray-800 px-1.5 py-0.5 rounded">Berlin</span>
               </div>
            </div>
          </div>

          <button className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-gray-700 hover:border-mod-primary py-2 rounded-xl text-[10px] text-gray-500 hover:text-mod-primary transition-all">
            <Plus size={12} /> Add Unit to OOB
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 glass glass-border rounded-3xl p-8 flex flex-col items-center justify-center relative bg-black/20">
        <div className="absolute top-6 left-8 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <LayoutGrid size={14} className="text-mod-primary" />
          Regiments Grid (5x5)
        </div>

        <div className="grid grid-cols-5 gap-3 bg-[#111]/50 p-4 rounded-2xl border border-gray-800 shadow-2xl">
          {cells.map((cell, i) => {
            const b = availableBattalions.find(x => x.id === cell.battalionId);
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, backgroundColor: '#1a1a1a' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(i)}
                className={`w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedCell === i 
                    ? 'border-mod-primary bg-mod-primary/10 shadow-[0_0_15px_rgba(var(--mod-primary-rgb),0.3)]' 
                    : b ? 'border-gray-700 bg-[#151515]' : 'border-dashed border-gray-800 bg-transparent'
                }`}
              >
                {b ? (
                  <>
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                       <span className="text-xl">🪖</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 text-center px-1 leading-tight">
                      {b.name}
                    </span>
                  </>
                ) : (
                  <Plus size={20} className="text-gray-800" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selection Overlay */}
        <AnimatePresence>
          {selectedCell !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-0 bottom-8 px-12"
            >
              <div className="glass glass-border border-mod-primary/30 rounded-2xl p-6 shadow-2xl bg-[#1a1a1a]/95 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    Select Battalion Type
                    <span className="text-[10px] text-mod-primary bg-mod-primary/10 px-2 py-0.5 rounded border border-mod-primary/20">
                      Cell {cells[selectedCell].x}, {cells[selectedCell].y}
                    </span>
                  </h4>
                  <button onClick={() => setSelectedCell(null)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={16} className="" />
                  </button>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  <button 
                    onClick={() => setBattalion(null)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-red-400"
                  >
                    <Trash2 size={20} />
                    <span className="text-[9px] font-bold uppercase">Empty</span>
                  </button>
                  {availableBattalions.map(b => (
                    <button 
                      key={b.id}
                      onClick={() => setBattalion(b.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-mod-primary hover:bg-mod-primary/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-lg">🪖</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase text-gray-500 group-hover:text-mod-primary text-center leading-tight">
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, color }: { icon: ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-gray-800/50 hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg bg-gray-800/50 ${color}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
      </div>
      <span className={`text-sm font-black tabular-nums ${color}`}>{value.toFixed(1)}</span>
    </div>
  );
}

function X({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
