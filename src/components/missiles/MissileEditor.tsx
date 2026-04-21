import { useMemo, useState } from 'react';
import { useModStore } from '../../store/useModStore';
import { Rocket, AlertTriangle, Plus, Trash2, Code2, Copy, Check, Target, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type MissileCategory = 'ballistic' | 'cruise' | 'tactical' | 'anti_ballistic';

export interface MissileType {
  id: string;
  name: string;
  category: MissileCategory;
  rangeKm: number;
  warheadYield: number; // in kilotons (0 = conventional)
  accuracy: number;     // 0-1
  silosRequired: number;
  gfxKey: string;
  requiresNuclear: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES: { id: MissileCategory; label: string; color: string; desc: string }[] = [
  { id: 'ballistic', label: 'Ballistic (ICBM/IRBM)', color: 'text-red-400 bg-red-500/10 border-red-500/30', desc: 'Long-range, silo-based, high damage.' },
  { id: 'cruise', label: 'Cruise Missile', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', desc: 'Precise, low altitude, hard to intercept.' },
  { id: 'tactical', label: 'Tactical Missile', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Short-range battlefield support.' },
  { id: 'anti_ballistic', label: 'ABM / SAM System', color: 'text-green-400 bg-green-500/10 border-green-500/30', desc: 'Defensive — intercepts incoming missiles.' },
];

const newMissile = (): MissileType => ({
  id: `missile_${Date.now()}`,
  name: 'New Missile',
  category: 'cruise',
  rangeKm: 500,
  warheadYield: 0,
  accuracy: 0.75,
  silosRequired: 1,
  gfxKey: 'GFX_missile_type_generic',
  requiresNuclear: false,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function MissileEditor() {
  const { baseMod, missiles, setMissiles } = useModStore();
  const [selectedId, setSelectedId] = useState<string>(missiles[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    const lines: string[] = [];
    missiles.forEach(m => {
      const isABM = m.category === 'anti_ballistic';
      lines.push(`### ${m.name} — ${CATEGORIES.find(c => c.id === m.category)?.label}`);
      lines.push(`${m.id} = {`);
      lines.push(`\tname = "${m.name}"`);
      lines.push(`\tpicture = ${m.gfxKey}`);
      lines.push(`\tmd_missile_range = ${m.rangeKm}`);
      lines.push(`\tmd_missile_accuracy = ${m.accuracy.toFixed(2)}`);
      if (!isABM) {
        lines.push(`\tmd_missile_warhead_yield = ${m.warheadYield}`);
        lines.push(`\tmd_silos_required = ${m.silosRequired}`);
        if (m.requiresNuclear) lines.push(`\trequires_technology = nuclear_weapons`);
      }
      if (isABM) {
        lines.push(`\tmd_intercept_range = ${Math.round(m.rangeKm * 0.4)}`);
        lines.push(`\tmd_intercept_chance = ${m.accuracy.toFixed(2)}`);
      }
      lines.push(`}`);
      lines.push('');
    });
    return lines.join('\n');
  }, [missiles]);

  if (baseMod !== 'millennium_dawn') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4 opacity-60" />
          <p className="text-gray-400 text-lg font-semibold">Missile Editor</p>
          <p className="text-gray-600 text-sm mt-2">This tool is exclusive to <span className="text-amber-500">Millennium Dawn</span>.</p>
        </div>
      </div>
    );
  }

  // Initialize if empty
  if (missiles.length === 0) {
    setMissiles([newMissile()]);
  }

  const selected = missiles.find(m => m.id === selectedId) || missiles[0] || newMissile();

  const update = (partial: Partial<MissileType>) => {
    setMissiles(missiles.map(m => m.id === selectedId ? { ...m, ...partial } : m));
  };

  const addMissile = () => {
    const m = newMissile();
    setMissiles([...missiles, m]);
    setSelectedId(m.id);
  };

  const deleteMissile = (id: string) => {
    const remaining = missiles.filter(m => m.id !== id);
    const newMs = remaining.length > 0 ? remaining : [newMissile()];
    setMissiles(newMs);
    setSelectedId(newMs[0].id);
  };

  const inputCls = "bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-full";

  const categoryInfo = CATEGORIES.find(c => c.id === selected.category)!;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sliderCls = "w-full accent-amber-500 cursor-pointer";

  return (
    <div className="w-full h-full flex bg-[#121212] overflow-hidden">
      {/* ── Left Sidebar: Missile List ── */}
      <div className="w-52 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Rocket size={12} className="text-amber-500" /> Missiles
          </span>
          <button onClick={addMissile} className="p-1 rounded hover:bg-amber-500/20 text-amber-500 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {missiles.map(m => {
            const cat = CATEGORIES.find(c => c.id === m.category)!;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left px-3 py-3 border-b border-gray-800/60 transition-colors flex items-start gap-2 ${
                  m.id === selectedId ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.name}</p>
                  <p className={`text-[10px] mt-0.5 truncate ${cat.color.split(' ')[0]}`}>{cat.label.split('(')[0].trim()}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Center: Properties ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Rocket size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Missile Editor</h2>
              <p className="text-xs text-gray-500">Millennium Dawn — Military Hardware</p>
            </div>
          </div>
          <button
            onClick={() => deleteMissile(selected.id)}
            className="text-gray-600 hover:text-red-500 transition-colors p-1.5"
            disabled={missiles.length === 1}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Category Selector */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-3">Missile Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => update({ category: cat.id })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selected.category === cat.id ? cat.color : 'border-gray-700 bg-[#111] hover:border-gray-600'
                }`}
              >
                <p className="text-xs font-semibold text-white">{cat.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Properties */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
          <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Identification</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Missile Name</label>
              <input type="text" value={selected.name} onChange={e => update({ name: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Script ID</label>
              <input type="text" value={selected.id}
                onChange={e => update({ id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                className={`${inputCls} font-mono text-amber-400`} />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-gray-400">GFX Key</label>
              <input type="text" value={selected.gfxKey} onChange={e => update({ gfxKey: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
          <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Performance Stats</label>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Range</span><span className="text-white font-bold">{selected.rangeKm.toLocaleString()} km</span>
            </div>
            <input type="range" min={50} max={15000} step={50} value={selected.rangeKm}
              onChange={e => update({ rangeKm: Number(e.target.value) })} className={sliderCls} />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>50 km</span><span>15,000 km</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Accuracy</span><span className="text-white font-bold">{Math.round(selected.accuracy * 100)}%</span>
            </div>
            <input type="range" min={0.1} max={1} step={0.01} value={selected.accuracy}
              onChange={e => update({ accuracy: Number(e.target.value) })} className={sliderCls} />
          </div>

          {selected.category !== 'anti_ballistic' && (
            <>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Warhead Yield</span>
                  <span className="text-white font-bold">{selected.warheadYield === 0 ? 'Conventional' : `${selected.warheadYield} kT`}</span>
                </div>
                <input type="range" min={0} max={5000} step={50} value={selected.warheadYield}
                  onChange={e => update({ warheadYield: Number(e.target.value) })} className={sliderCls} />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                  <span>Conventional</span><span>5,000 kT (Strategic)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Silos Required</label>
                  <input type="number" min={0} max={10} value={selected.silosRequired}
                    onChange={e => update({ silosRequired: Number(e.target.value) })} className={inputCls} />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input type="checkbox" id="nuclear" checked={selected.requiresNuclear}
                    onChange={e => update({ requiresNuclear: e.target.checked })} className="accent-amber-500 w-4 h-4" />
                  <label htmlFor="nuclear" className="text-sm text-gray-300">Requires Nuclear Tech</label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Range visualization */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3 flex items-center gap-2">
            <Target size={12} /> Range Classification
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'SRBM', min: 0, max: 1000 },
              { label: 'MRBM', min: 1000, max: 3000 },
              { label: 'IRBM', min: 3000, max: 5500 },
              { label: 'ICBM', min: 5500, max: 15000 },
            ].map(tier => {
              const active = selected.rangeKm >= tier.min && selected.rangeKm < tier.max;
              return (
                <span key={tier.label} className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                  active ? `${categoryInfo.color}` : 'border-gray-700 text-gray-600 bg-transparent'
                }`}>
                  {tier.label} ({tier.min}–{tier.max === 15000 ? '∞' : tier.max} km)
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Column: Code Output ── */}
      <div className="w-[360px] bg-[#161616] border-l border-gray-800 flex flex-col">
        {/* Stats overview for selected */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            {selected.category === 'anti_ballistic'
              ? <Shield size={16} className="text-green-400" />
              : <Rocket size={16} className="text-red-400" />
            }
            <span className="text-sm font-semibold text-white">{selected.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${categoryInfo.color}`}>
              {categoryInfo.label.split('(')[0].trim()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Range', value: `${selected.rangeKm >= 1000 ? (selected.rangeKm / 1000).toFixed(1) + 'k' : selected.rangeKm} km` },
              { label: 'Accuracy', value: `${Math.round(selected.accuracy * 100)}%` },
              { label: 'Yield', value: selected.warheadYield === 0 ? 'Conv.' : `${selected.warheadYield}kT` },
            ].map(s => (
              <div key={s.label} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500">{s.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Output */}
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={13} className="text-amber-500" /> Generated Script
            </h3>
            <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-500 transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <div className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 overflow-auto">
            <pre className="text-xs font-mono text-gray-400 whitespace-pre leading-relaxed">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
