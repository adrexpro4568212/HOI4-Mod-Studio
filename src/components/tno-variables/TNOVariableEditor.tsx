import { useMemo, useState, useEffect, useCallback } from 'react';
import { useModStore } from '../../store/useModStore';
import { AlertTriangle, Database, Plus, Trash2, Code2, Copy, Check, Search, ChevronUp, ChevronDown } from 'lucide-react';

type VariableScope = 'country' | 'state' | 'global' | 'unit_leader';
type VariableOp = 'set_variable' | 'add_to_variable' | 'multiply_variable' | 'clamp_variable';

export interface TNOVariable {
  id: string;
  name: string;
  scope: VariableScope;
  op: VariableOp;
  value: number;
  comment: string;
  category: string;
}

const TNO_SUGGESTIONS = [
  { name: 'tno_gdp', category: 'Economy', desc: 'National GDP' },
  { name: 'tno_inflation', category: 'Economy', desc: 'Inflation rate' },
  { name: 'tno_debt_ratio', category: 'Economy', desc: 'Debt-to-GDP ratio' },
  { name: 'tno_poverty_rate', category: 'Economy', desc: 'Poverty rate' },
  { name: 'tno_legitimacy', category: 'Political', desc: 'Government legitimacy' },
  { name: 'tno_repression', category: 'Political', desc: 'State repression' },
  { name: 'tno_unrest', category: 'Political', desc: 'Civil unrest' },
  { name: 'tno_liberalization', category: 'Political', desc: 'Reform score' },
  { name: 'tno_nuclear_arsenal', category: 'Military', desc: 'Nuclear warheads' },
  { name: 'tno_military_power', category: 'Military', desc: 'Military index' },
  { name: 'tno_burgundian_system_progress', category: 'Narrative', desc: 'Burgundian System' },
  { name: 'tno_ofn_alignment', category: 'Narrative', desc: 'OFN alignment' },
  { name: 'tno_cold_war_tension', category: 'Narrative', desc: 'Cold War tension' },
  { name: 'tno_space_race_points', category: 'Narrative', desc: 'Space race' },
  { name: 'tno_reform_progress', category: 'Narrative', desc: 'Internal reform' },
  { name: 'tno_warlord_strength', category: 'Narrative', desc: 'Warlord strength' },
];

const SCOPES: VariableScope[] = ['country', 'state', 'global', 'unit_leader'];
const OPS: { id: VariableOp; label: string; symbol: string }[] = [
  { id: 'set_variable', label: 'Set', symbol: '=' },
  { id: 'add_to_variable', label: 'Add', symbol: '+=' },
  { id: 'multiply_variable', label: 'Multiply', symbol: '×' },
  { id: 'clamp_variable', label: 'Clamp', symbol: '∈' },
];
const CATEGORIES = ['Economy', 'Political', 'Military', 'Narrative', 'Custom'];

const SCOPE_COLOR: Record<VariableScope, string> = {
  country: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  state: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  global: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  unit_leader: 'text-green-400 bg-green-500/10 border-green-500/30',
};

const newVar = (): TNOVariable => ({
  id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  name: 'tno_new_variable',
  scope: 'country',
  op: 'set_variable',
  value: 0,
  comment: '',
  category: 'Custom',
});

const SortBtn: React.FC<{ field: 'name' | 'scope' | 'category'; sortField: 'name' | 'scope' | 'category'; sortDir: 'asc' | 'desc'; onToggle: (field: 'name' | 'scope' | 'category') => void }> = ({ field, sortField, sortDir, onToggle }) => (
  <button onClick={() => onToggle(field)} className="ml-1 text-gray-600 hover:text-gray-400 inline-flex">
    {sortField === field ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronUp size={10} className="opacity-30" />}
  </button>
);

export default function TNOVariableEditor() {
  const { baseMod, tnoVariables, setTnoVariables } = useModStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [countryTag, setCountryTag] = useState('GER');
  const [effectName, setEffectName] = useState('initialize_variables');
  const [copied, setCopied] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'scope' | 'category'>('category');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (tnoVariables.length === 0) {
      setTnoVariables([newVar()]);
    }
  }, [tnoVariables.length, setTnoVariables]);

  const variables = tnoVariables;

  const update = (id: string, partial: Partial<TNOVariable>) =>
    setTnoVariables(variables.map(v => v.id === id ? { ...v, ...partial } : v));

  const addVar = () => {
    const v = newVar();
    setTnoVariables([...variables, v]);
    setEditingId(v.id);
  };

  const addFromSuggestion = (s: typeof TNO_SUGGESTIONS[0]) => {
    const v = { ...newVar(), name: s.name, category: s.category, comment: s.desc };
    setTnoVariables([...variables, v]);
    setShowSuggestions(false);
  };

  const deleteVar = (id: string) => setTnoVariables(variables.filter(v => v.id !== id));

  const toggleSort = useCallback((field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }, [sortField]);

  const filtered = variables
    .filter(v => (search ? v.name.includes(search) || v.comment.toLowerCase().includes(search.toLowerCase()) : true)
      && (categoryFilter === 'All' || v.category === categoryFilter))
    .sort((a, b) => sortDir === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField])));

  const generatedCode = useMemo(() => {
    const tag = countryTag.toUpperCase();
    const lines = [`### TNO Variables — ${tag}`, '', `${tag.toLowerCase()}_${effectName} = {`];
    CATEGORIES.forEach(cat => {
      const catVars = variables.filter(v => v.category === cat);
      if (catVars.length === 0) return;
      lines.push(`\t### ${cat}`);
      catVars.forEach(v => {
        if (v.comment) lines.push(`\t# ${v.comment}`);
        lines.push(`\t${v.op} = { ${v.name} = ${v.value} }`);
      });
      lines.push('');
    });
    lines.push('}');
    return lines.join('\n');
  }, [variables, countryTag, effectName]);

  const copyCode = () => { navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const inp = "bg-[#121212] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-purple-500 focus:outline-none";

  if (baseMod !== 'tno') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4 opacity-60" />
          <p className="text-gray-400 text-lg font-semibold">TNO Variable Editor</p>
          <p className="text-gray-600 text-sm mt-2">Exclusive to <span className="text-amber-500">The New Order</span>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-[#121212] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Database size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Variable Editor</h2>
            <p className="text-xs text-gray-500">The New Order — scripted_effect builder</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <input type="text" value={countryTag} onChange={e => setCountryTag(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3} className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-sm text-white font-mono font-bold text-center w-14 focus:border-purple-500 focus:outline-none" />
            <input type="text" value={effectName} onChange={e => setEffectName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-xs text-purple-300 font-mono w-48 focus:border-purple-500 focus:outline-none" placeholder="effect_name" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-gray-800 bg-[#161616] flex-shrink-0 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-[#1a1a1a] border border-gray-800 rounded pl-7 pr-3 py-1.5 text-xs text-white w-44 focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="flex gap-1">
            {['All', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${categoryFilter === cat ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setShowSuggestions(v => !v)}
              className={`text-xs border px-3 py-1.5 rounded transition-colors ${showSuggestions ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
              ✨ Suggestions
            </button>
            <button onClick={addVar}
              className="flex items-center gap-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded transition-colors">
              <Plus size={12} /> Add Variable
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="px-6 py-3 border-b border-gray-800 bg-[#1a1a1a] flex-shrink-0">
            <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-wider">Common TNO variables — click to add:</p>
            <div className="flex flex-wrap gap-1.5">
              {TNO_SUGGESTIONS.map(s => (
                <button key={s.name} onClick={() => addFromSuggestion(s)} title={s.desc}
                  className="text-[10px] font-mono bg-[#121212] border border-gray-700 hover:border-purple-500 text-gray-400 hover:text-purple-300 px-2 py-1 rounded transition-colors">
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 z-10">
              <tr>
                <th className="text-left px-4 py-2.5 text-gray-600 font-semibold w-8">#</th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider">Variable Name <SortBtn field="name" sortField={sortField} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider w-28">Scope <SortBtn field="scope" sortField={sortField} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider w-24">Operation</th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider w-20">Value</th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider w-24">Category <SortBtn field="category" sortField={sortField} sortDir={sortDir} onToggle={toggleSort} /></th>
                <th className="text-left px-4 py-2.5 text-gray-500 font-semibold uppercase tracking-wider">Comment</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, idx) => (
                <tr key={v.id} onClick={() => setEditingId(editingId === v.id ? null : v.id)}
                  className={`border-b border-gray-800/50 cursor-pointer transition-colors ${editingId === v.id ? 'bg-purple-500/5' : 'hover:bg-white/2'}`}>
                  <td className="px-4 py-2 text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <input type="text" value={v.name} onChange={e => update(v.id, { name: e.target.value })} onClick={e => e.stopPropagation()} className={`${inp} w-full font-mono text-purple-300`} autoFocus />
                      : <span className="font-mono text-purple-300">{v.name}</span>}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <select value={v.scope} onChange={e => update(v.id, { scope: e.target.value as VariableScope })} onClick={e => e.stopPropagation()} className={inp}>
                          {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      : <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${SCOPE_COLOR[v.scope]}`}>{v.scope}</span>}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <select value={v.op} onChange={e => update(v.id, { op: e.target.value as VariableOp })} onClick={e => e.stopPropagation()} className={inp}>
                          {OPS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                      : <span className="text-gray-400">{OPS.find(o => o.id === v.op)?.symbol} {OPS.find(o => o.id === v.op)?.label}</span>}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <input type="number" value={v.value} onChange={e => update(v.id, { value: Number(e.target.value) })} onClick={e => e.stopPropagation()} className={`${inp} w-16`} />
                      : <span className="text-white font-bold">{v.value}</span>}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <select value={v.category} onChange={e => update(v.id, { category: e.target.value })} onClick={e => e.stopPropagation()} className={inp}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      : <span className="text-gray-500">{v.category}</span>}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === v.id
                      ? <input type="text" value={v.comment} onChange={e => update(v.id, { comment: e.target.value })} onClick={e => e.stopPropagation()} className={`${inp} w-full`} placeholder="Comment..." />
                      : <span className="text-gray-600 italic">{v.comment}</span>}
                  </td>
                  <td className="px-2 py-2">
                    <button onClick={e => { e.stopPropagation(); deleteVar(v.id); }} className="text-gray-700 hover:text-red-500 p-1">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-700">
              <Database size={28} className="mb-2 opacity-40" /><p className="text-sm">No variables found</p>
            </div>
          )}
        </div>

        <div className="px-6 py-2 border-t border-gray-800 flex items-center justify-between flex-shrink-0 bg-[#161616]">
          <span className="text-xs text-gray-600">{variables.length} variables · {filtered.length} shown</span>
          <span className="text-xs text-gray-700">Click a row to edit inline</span>
        </div>
      </div>

      {/* Code Panel */}
      <div className="w-[370px] bg-[#161616] border-l border-gray-800 flex flex-col">
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={13} className="text-purple-400" /> Generated Script
            </h3>
            <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors">
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
