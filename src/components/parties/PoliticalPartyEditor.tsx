import { useMemo, useState, useRef, useEffect } from 'react';
import { useModStore } from '../../store/useModStore';
import { Users, AlertTriangle, Plus, Trash2, Code2, Copy, Check, Upload, X } from 'lucide-react';
import { modDictionaries } from '../../data/modDictionaries';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PoliticalParty {
  id: string;
  name: string;
  longName: string;
  ideology: string;
  popularity: number;
  rulingPartyName: string;
  leaderName: string;
  portrait: string;
  isRuling: boolean;
}

const newParty = (ideology = 'syndicalist'): PoliticalParty => ({
  id: `party_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  name: 'New Party',
  longName: 'New Political Party',
  ideology,
  popularity: 10,
  rulingPartyName: '',
  leaderName: '',
  portrait: '',
  isRuling: false,
});

// ─── Ideology colors for KR ───────────────────────────────────────────────────

const IDEOLOGY_COLORS: Record<string, string> = {
  totalist:              'bg-red-900/60 border-red-500/40 text-red-300',
  syndicalist:           'bg-red-700/40 border-red-400/40 text-red-200',
  radical_socialist:     'bg-orange-700/40 border-orange-400/40 text-orange-200',
  social_democrat:       'bg-rose-700/40 border-rose-400/40 text-rose-200',
  social_liberal:        'bg-yellow-700/40 border-yellow-400/40 text-yellow-200',
  market_liberal:        'bg-yellow-600/30 border-yellow-300/30 text-yellow-100',
  social_conservative:   'bg-blue-700/40 border-blue-400/40 text-blue-200',
  authoritarian_democrat:'bg-indigo-700/40 border-indigo-400/40 text-indigo-200',
  paternal_autocrat:     'bg-purple-700/40 border-purple-400/40 text-purple-200',
  national_populist:     'bg-gray-700/60 border-gray-500/40 text-gray-200',
};

const ideologyColor = (id: string) =>
  IDEOLOGY_COLORS[id] ?? 'bg-gray-700/40 border-gray-500/40 text-gray-200';

// ─── Popularity bar ───────────────────────────────────────────────────────────

const SPECTRUM_SEGMENTS = [
  { id: 'totalist', color: 'bg-red-900' },
  { id: 'syndicalist', color: 'bg-red-600' },
  { id: 'radical_socialist', color: 'bg-orange-600' },
  { id: 'social_democrat', color: 'bg-rose-600' },
  { id: 'social_liberal', color: 'bg-yellow-500' },
  { id: 'market_liberal', color: 'bg-yellow-400' },
  { id: 'social_conservative', color: 'bg-blue-600' },
  { id: 'authoritarian_democrat', color: 'bg-indigo-600' },
  { id: 'paternal_autocrat', color: 'bg-purple-700' },
  { id: 'national_populist', color: 'bg-gray-600' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PoliticalPartyEditor() {
  const { baseMod, politicalParties, setPoliticalParties } = useModStore();
  const ideologies = modDictionaries.kaiserreich.ideologies;
  const [selectedId, setSelectedId] = useState(politicalParties[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [countryTag, setCountryTag] = useState('GER');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!politicalParties.length) {
      setPoliticalParties([newParty(ideologies[0].id)]);
    }
  }, [politicalParties.length, setPoliticalParties, ideologies]);

  const parties = politicalParties;
  const setParties = (newParties: PoliticalParty[] | ((prev: PoliticalParty[]) => PoliticalParty[])) => {
    if (typeof newParties === 'function') {
      setPoliticalParties(newParties(politicalParties));
    } else {
      setPoliticalParties(newParties);
    }
  };

  const selected = parties.find(p => p.id === selectedId) || parties[0] || newParty();

  const update = (partial: Partial<PoliticalParty>) =>
    setPoliticalParties(parties.map(p => p.id === selectedId ? { ...p, ...partial } : p));

  const addParty = () => {
    const p = newParty(ideologies[0].id);
    setPoliticalParties([...parties, p]);
    setSelectedId(p.id);
  };

  const deleteParty = (id: string) => {
    const remaining = parties.filter(p => p.id !== id);
    const next = remaining.length ? remaining : [newParty()];
    setPoliticalParties(next);
    setSelectedId(next[0].id);
  };

  const setRuling = (id: string) => setParties(ps => ps.map(p => ({ ...p, isRuling: p.id === id })));

  const handlePortrait = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ portrait: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalPop = parties.reduce((s, p) => s + p.popularity, 0);

  const generatedCode = useMemo(() => {
    const tag = countryTag.toUpperCase();
    const lines: string[] = [
      `### Kaiserreich Political Setup — ${tag}`,
      `### Paste inside: history/countries/${tag}.txt`,
      ``,
      `set_politics = {`,
    ];
    const ruling = parties.find(p => p.isRuling);
    if (ruling) {
      lines.push(`\truling_party = ${ruling.ideology}`);
      lines.push(`\tlast_election = "1936.1.1"`);
      lines.push(`\telection_frequency = 48`);
      lines.push(`\telections_allowed = yes`);
    }
    lines.push(`}`);
    lines.push(``);
    lines.push(`set_popularities = {`);
    parties.forEach(p => {
      lines.push(`\t${p.ideology} = ${p.popularity}`);
    });
    lines.push(`}`);
    lines.push(``);

    parties.forEach(p => {
      lines.push(`### ${p.name} — ${p.longName}`);
      lines.push(`${p.ideology}_party = {`);
      lines.push(`\tname = "${p.longName}"`);
      lines.push(`\tabbreviation = "${p.name}"`);
      if (p.leaderName) lines.push(`\tleader = "${p.leaderName}"`);
      lines.push(`}`);
      lines.push(``);
    });

    return lines.join('\n');
  }, [parties, countryTag]);

  if (baseMod !== 'kaiserreich') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4 opacity-60" />
          <p className="text-gray-400 text-lg font-semibold">Political Party Editor</p>
          <p className="text-gray-600 text-sm mt-2">Exclusive to <span className="text-amber-500">Kaiserreich</span>.</p>
          <p className="text-gray-700 text-xs mt-1">Switch your Base Mod in ⚙️ Project Settings.</p>
        </div>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = "bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-full";

  return (
    <div className="w-full h-full flex bg-[#121212] overflow-hidden">
      {/* ── Sidebar: Party List ── */}
      <div className="w-56 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={12} className="text-amber-500" /> Parties
          </span>
          <button onClick={addParty} className="p-1 rounded hover:bg-amber-500/20 text-amber-500">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {parties.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-3 py-3 border-b border-gray-800/60 transition-colors ${
                p.id === selectedId ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {p.isRuling && <span className="text-[9px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded">RULING</span>}
                <span className="text-sm font-bold text-white">{p.name || '—'}</span>
              </div>
              <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block border ${ideologyColor(p.ideology)}`}>
                {ideologies.find(i => i.id === p.ideology)?.name ?? p.ideology}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">{p.popularity}% popularity</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Center: Form ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Users size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Political Party Editor</h2>
              <p className="text-xs text-gray-500">Kaiserreich — Party System Setup</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text" value={countryTag}
              onChange={e => setCountryTag(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3} placeholder="TAG"
              className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono font-bold text-center w-16 focus:border-amber-500 focus:outline-none"
            />
            <button onClick={() => deleteParty(selected.id)} disabled={parties.length === 1}
              className="text-gray-600 hover:text-red-500 transition-colors disabled:opacity-30">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Popularity spectrum bar */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Political Spectrum</span>
            <span className="text-xs text-gray-500">Total: {totalPop}%{totalPop !== 100 && <span className="text-red-400 ml-1">(should be 100%)</span>}</span>
          </div>
          <div className="h-6 flex rounded-lg overflow-hidden">
            {SPECTRUM_SEGMENTS.map(seg => {
              const party = parties.find(p => p.ideology === seg.id);
              const pct = party ? party.popularity : 0;
              if (pct === 0) return null;
              return (
                <div key={seg.id} className={`${seg.color} flex items-center justify-center transition-all`} style={{ width: `${pct}%` }} title={`${seg.id}: ${pct}%`}>
                  {pct >= 8 && <span className="text-[9px] font-bold text-white">{pct}%</span>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {SPECTRUM_SEGMENTS.map(s => (
              <div key={s.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-[9px] text-gray-600">{s.id.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Party Form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Party Properties</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Abbreviation (e.g. SPD)</label>
              <input type="text" value={selected.name} onChange={e => update({ name: e.target.value.toUpperCase() })} className={`${inputCls} font-bold`} maxLength={6} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Full Party Name</label>
              <input type="text" value={selected.longName} onChange={e => update({ longName: e.target.value })} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Ideology</label>
              <select value={selected.ideology} onChange={e => update({ ideology: e.target.value })} className={inputCls}>
                {ideologies.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Party Leader Name</label>
              <input type="text" value={selected.leaderName} onChange={e => update({ leaderName: e.target.value })} className={inputCls} />
            </div>
          </div>

          {/* Popularity slider */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Initial Popularity</span>
              <span className="font-bold text-white">{selected.popularity}%</span>
            </div>
            <input type="range" min={0} max={100} value={selected.popularity}
              onChange={e => update({ popularity: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer" />
          </div>

          {/* Ruling party toggle */}
          <div className="flex items-center gap-3 bg-[#121212] border border-gray-800 rounded-lg px-4 py-3">
            <input type="checkbox" id="ruling" checked={selected.isRuling}
              onChange={() => setRuling(selected.id)} className="accent-amber-500 w-4 h-4" />
            <label htmlFor="ruling" className="text-sm text-gray-300">
              This is the <span className="text-amber-500 font-semibold">ruling party</span>
            </label>
            {selected.isRuling && <span className="ml-auto text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded">RULING</span>}
          </div>

          {/* Portrait upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400">Party Leader Portrait</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePortrait} />
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 bg-[#121212] border border-gray-700 rounded overflow-hidden flex items-center justify-center">
                {selected.portrait
                  ? <img src={selected.portrait} alt="leader" className="w-full h-full object-cover" />
                  : <Users size={24} className="text-gray-700" />
                }
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded transition-colors">
                  <Upload size={12} /> Upload Portrait
                </button>
                {selected.portrait && (
                  <button onClick={() => update({ portrait: '' })}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-2 rounded transition-colors">
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All parties summary */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">All Parties Overview</h3>
          <div className="space-y-2">
            {parties.map(p => (
              <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${ideologyColor(p.ideology)}`}>
                <div className="w-8 h-10 bg-black/20 rounded overflow-hidden flex-shrink-0">
                  {p.portrait ? <img src={p.portrait} alt="" className="w-full h-full object-cover" /> : <Users size={16} className="m-auto mt-2 opacity-30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{p.name}</span>
                    {p.isRuling && <span className="text-[9px] bg-amber-500 text-black font-bold px-1 rounded">RULING</span>}
                  </div>
                  <p className="text-[10px] opacity-70 truncate">{p.longName}</p>
                </div>
                <span className="text-sm font-bold flex-shrink-0">{p.popularity}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Code ── */}
      <div className="w-[360px] bg-[#161616] border-l border-gray-800 flex flex-col">
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={13} className="text-amber-500" /> Generated Script
            </h3>
            <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-500 transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 overflow-auto">
            <pre className="text-xs font-mono text-gray-400 whitespace-pre leading-relaxed">{generatedCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
