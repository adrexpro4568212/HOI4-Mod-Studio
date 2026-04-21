import { useMemo, useState, useEffect } from 'react';
import { useModStore } from '../../store/useModStore';
import { AlertTriangle, GitBranch, Plus, Trash2, Code2, Copy, Check, ArrowRight, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';

type PathAlignment = 'reformist' | 'hardliner' | 'moderate' | 'populist';

interface SubPath {
  id: string;
  name: string;
  scriptId: string;
  alignment: PathAlignment;
  desc: string;
  triggerCondition: string;
  onEnterEffect: string;
}

interface IdeologyPath {
  id: string;
  rootIdeology: string;
  displayName: string;
  color: string;
  subPaths: SubPath[];
}

const TNO_IDEOLOGIES = [
  { id: 'national_socialism', name: 'National Socialism', color: '#8B0000' },
  { id: 'fascism', name: 'Fascism', color: '#7B3F00' },
  { id: 'despotism', name: 'Despotism', color: '#4B0082' },
  { id: 'authoritarian_democracy', name: 'Authoritarian Democracy', color: '#1a3a6b' },
  { id: 'conservative_democracy', name: 'Conservative Democracy', color: '#1e3f66' },
  { id: 'liberal_democracy', name: 'Liberal Democracy', color: '#1565c0' },
  { id: 'social_democracy', name: 'Social Democracy', color: '#c62828' },
  { id: 'socialism', name: 'Socialism', color: '#b71c1c' },
  { id: 'communism', name: 'Communism', color: '#7f0000' },
  { id: 'burgundian_system', name: 'Burgundian System', color: '#2d0036' },
];

const ALIGNMENTS: { id: PathAlignment; label: string; color: string }[] = [
  { id: 'reformist', label: 'Reformist', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { id: 'moderate', label: 'Moderate', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'hardliner', label: 'Hardliner', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { id: 'populist', label: 'Populist', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
];

const newSubPath = (): SubPath => ({
  id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  name: 'New Sub-Path',
  scriptId: 'new_sub_path',
  alignment: 'moderate',
  desc: '',
  triggerCondition: '# Conditions to unlock this path\nalways = yes',
  onEnterEffect: '# Effects when this path is chosen',
});

const newPath = (): IdeologyPath => ({
  id: `path_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  rootIdeology: 'social_democracy',
  displayName: 'Social Democracy',
  color: '#c62828',
  subPaths: [newSubPath()],
});

export default function IdeologyPathEditor() {
  const { baseMod, tnoPaths, setTnoPaths } = useModStore();
  const [selectedPathId, setSelectedPathId] = useState(tnoPaths[0]?.id || '');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(tnoPaths[0]?.subPaths[0]?.id || null);
  const [activeEditorTab, setActiveEditorTab] = useState<'trigger' | 'effect'>('trigger');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tnoPaths.length === 0) {
      setTnoPaths([{
        ...newPath(),
        id: 'path_1',
        displayName: 'Social Democracy',
        subPaths: [
          { id: 's1', name: 'Third Way', scriptId: 'tno_sd_third_way', alignment: 'moderate' as PathAlignment, desc: 'A middle path between capitalism and socialism.', triggerCondition: 'has_stability > 0.5', onEnterEffect: 'add_stability = 0.05' },
          { id: 's2', name: 'Democratic Socialism', scriptId: 'tno_sd_dem_socialism', alignment: 'reformist' as PathAlignment, desc: 'Gradual socialist reforms through democracy.', triggerCondition: 'has_war_support < 0.4', onEnterEffect: 'add_political_power = 50' },
        ],
      }]);
    }
  }, [tnoPaths.length, setTnoPaths]);

  const paths = tnoPaths;
  const selectedPath = paths.find(p => p.id === selectedPathId) || paths[0] || newPath();
  const selectedSub = selectedPath.subPaths.find(s => s.id === selectedSubId) || selectedPath.subPaths[0] || null;

  const updatePath = (partial: Partial<IdeologyPath>) =>
    setTnoPaths(paths.map(p => p.id === selectedPathId ? { ...p, ...partial } : p));

  const updateSub = (subId: string, partial: Partial<SubPath>) =>
    setTnoPaths(paths.map(p => p.id === selectedPathId
      ? { ...p, subPaths: p.subPaths.map(s => s.id === subId ? { ...s, ...partial } : s) }
      : p));

  const addPath = () => {
    const p = newPath();
    setTnoPaths([...paths, p]);
    setSelectedPathId(p.id);
    setSelectedSubId(p.subPaths[0].id);
  };

  const deletePath = (id: string) => {
    const rem = paths.filter(p => p.id !== id);
    const next = rem.length ? rem : [newPath()];
    setTnoPaths(next);
    setSelectedPathId(next[0].id);
    setSelectedSubId(next[0].subPaths[0]?.id || null);
  };

  const addSubPath = () => {
    const s = newSubPath();
    updatePath({ subPaths: [...selectedPath.subPaths, s] });
    setSelectedSubId(s.id);
  };

  const deleteSubPath = (subId: string) => {
    const rem = selectedPath.subPaths.filter(s => s.id !== subId);
    const nextSubPaths = rem.length ? rem : [newSubPath()];
    updatePath({ subPaths: nextSubPaths });
    setSelectedSubId(nextSubPaths[0].id);
  };

  const generatedCode = useMemo(() => {
    const lines: string[] = ['### TNO Ideology Paths', '### Generated by HOI4 Mod Studio', ''];
    paths.forEach(path => {
      lines.push(`### ${path.displayName} (${path.rootIdeology})`);
      path.subPaths.forEach(sub => {
        lines.push(`### Sub-Path: ${sub.name} [${sub.alignment}]`);
        lines.push(`${sub.scriptId}_available = {`);
        lines.push(`\t${sub.triggerCondition.split('\n').join('\n\t')}`);
        lines.push(`}`);
        lines.push('');
        lines.push(`${sub.scriptId}_on_enter = {`);
        lines.push(`\t${sub.onEnterEffect.split('\n').join('\n\t')}`);
        lines.push(`}`);
        lines.push('');
      });
    });
    return lines.join('\n');
  }, [paths]);

  if (baseMod !== 'tno') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4 opacity-60" />
          <p className="text-gray-400 text-lg font-semibold">Ideology Path Editor</p>
          <p className="text-gray-600 text-sm mt-2">Exclusive to <span className="text-amber-500">The New Order</span>.</p>
        </div>
      </div>
    );
  }

  const copyCode = () => { navigator.clipboard.writeText(generatedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const inputCls = "bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none w-full";
  const ideologyData = TNO_IDEOLOGIES.find(i => i.id === selectedPath.rootIdeology);

  return (
    <div className="w-full h-full flex bg-[#121212] overflow-hidden">
      {/* ── Left: Path List ── */}
      <div className="w-52 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch size={12} className="text-purple-400" /> Paths
          </span>
          <button onClick={addPath} className="p-1 rounded hover:bg-purple-500/20 text-purple-400"><Plus size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {paths.map(p => {
            const idData = TNO_IDEOLOGIES.find(i => i.id === p.rootIdeology);
            return (
              <button key={p.id} onClick={() => { setSelectedPathId(p.id); setSelectedSubId(p.subPaths[0]?.id ?? null); }}
                className={`w-full text-left px-3 py-3 border-b border-gray-800/60 transition-colors ${p.id === selectedPathId ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: idData?.color ?? '#666' }} />
                  <span className="text-sm font-medium text-white truncate">{p.displayName}</span>
                </div>
                <p className="text-[10px] text-gray-600">{p.subPaths.length} sub-path{p.subPaths.length !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Center: Editor ── */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Path Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ideologyData?.color ?? '#666'}20` }}>
              <GitBranch size={18} style={{ color: ideologyData?.color ?? '#a855f7' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Ideology Path Editor</h2>
              <p className="text-xs text-gray-500">The New Order — Sub-path builder</p>
            </div>
          </div>
          <button onClick={() => deletePath(selectedPath.id)} disabled={paths.length === 1} className="text-gray-600 hover:text-red-500 transition-colors disabled:opacity-30">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Root Ideology */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Display Name</label>
            <input type="text" value={selectedPath.displayName} onChange={e => updatePath({ displayName: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Root Ideology</label>
            <select value={selectedPath.rootIdeology} onChange={e => {
              const id = TNO_IDEOLOGIES.find(i => i.id === e.target.value);
              updatePath({ rootIdeology: e.target.value, color: id?.color ?? '#666', displayName: id?.name ?? selectedPath.displayName });
            }} className={inputCls}>
              {TNO_IDEOLOGIES.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
        </div>

        {/* Sub-path flow diagram */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-Paths</label>
            <button onClick={addSubPath} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
              <Plus size={12} /> Add Sub-Path
            </button>
          </div>

          {/* Visual flow */}
          <div className="flex items-start gap-3 overflow-x-auto pb-2">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="px-3 py-2 rounded-lg border-2 text-xs font-bold text-center min-w-[100px]"
                style={{ borderColor: ideologyData?.color ?? '#666', background: `${ideologyData?.color ?? '#666'}15`, color: ideologyData?.color ?? '#a855f7' }}>
                {selectedPath.displayName}
              </div>
            </div>
            {selectedPath.subPaths.map(sub => {
              const align = ALIGNMENTS.find(a => a.id === sub.alignment)!;
              const isSelected = sub.id === selectedSubId;
              return (
                <div key={sub.id} className="flex items-start gap-2 flex-shrink-0">
                  <ArrowRight size={16} className="text-gray-700 mt-3 flex-shrink-0" />
                  <button onClick={() => setSelectedSubId(sub.id)}
                    className={`flex flex-col px-3 py-2 rounded-lg border-2 text-xs min-w-[110px] text-left transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 bg-[#121212] hover:border-gray-600'}`}>
                    <span className="font-bold text-white text-[11px]">{sub.name}</span>
                    <span className={`mt-1 text-[9px] px-1.5 py-0.5 rounded border font-bold ${align.color}`}>{align.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-path properties */}
        {selectedSub && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#111]">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <ChevronDown size={14} /> Editing: {selectedSub.name}
              </span>
              <button onClick={() => deleteSubPath(selectedSub.id)} disabled={selectedPath.subPaths.length === 1}
                className="text-gray-600 hover:text-red-500 transition-colors disabled:opacity-30">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Sub-Path Name</label>
                <input type="text" value={selectedSub.name} onChange={e => updateSub(selectedSub.id, { name: e.target.value })} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Script ID</label>
                <input type="text" value={selectedSub.scriptId}
                  onChange={e => updateSub(selectedSub.id, { scriptId: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className={`${inputCls} font-mono text-purple-300`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Alignment</label>
                <div className="flex gap-2 flex-wrap">
                  {ALIGNMENTS.map(a => (
                    <button key={a.id} onClick={() => updateSub(selectedSub.id, { alignment: a.id })}
                      className={`text-xs px-2.5 py-1 rounded border font-bold transition-colors ${selectedSub.alignment === a.id ? a.color : 'border-gray-700 text-gray-600 hover:text-gray-400'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Description</label>
                <input type="text" value={selectedSub.desc} onChange={e => updateSub(selectedSub.id, { desc: e.target.value })} className={inputCls} placeholder="Brief description..." />
              </div>
            </div>

            {/* Monaco tabs */}
            <div className="border-t border-gray-800">
              <div className="flex border-b border-gray-800">
                {(['trigger', 'effect'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveEditorTab(tab)}
                    className={`px-4 py-2.5 text-xs font-semibold capitalize transition-colors ${activeEditorTab === tab ? 'bg-[#121212] text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>
                    {tab === 'trigger' ? 'Available Trigger' : 'On Enter Effect'}
                  </button>
                ))}
              </div>
              <Editor
                height="160px"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={activeEditorTab === 'trigger' ? selectedSub.triggerCondition : selectedSub.onEnterEffect}
                onChange={val => updateSub(selectedSub.id, { [activeEditorTab === 'trigger' ? 'triggerCondition' : 'onEnterEffect']: val || '' })}
                options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'on', scrollBeyondLastLine: false }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Code Panel */}
      <div className="w-[360px] bg-[#161616] border-l border-gray-800 flex flex-col">
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
