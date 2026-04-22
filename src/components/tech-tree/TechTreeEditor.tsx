import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import type { Node, Edge, Connection, NodeProps } from 'reactflow';
import type { NodeChange, EdgeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { FlaskConical, Plus, Trash2, Download, Code2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useModStore } from '../../store/useModStore';

// ─── Tech Node component ──────────────────────────────────────────────────────

function TechNode({ data, selected }: NodeProps) {
  return (
    <div className={`relative w-44 rounded-lg border-2 shadow-lg select-none transition-shadow ${
      selected ? 'border-cyan-400 shadow-cyan-400/30' : 'border-gray-700 hover:border-cyan-500/60'
    } bg-[#1a1a1a]`}>
      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !border-gray-900 !w-2.5 !h-2.5" />

      {/* Category badge */}
      <div className={`absolute -top-2.5 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
        data.category === 'industry' ? 'bg-amber-500 text-black' :
        data.category === 'electronics' ? 'bg-blue-500 text-white' :
        data.category === 'land_doctrine' ? 'bg-red-600 text-white' :
        data.category === 'naval_doctrine' ? 'bg-teal-600 text-white' :
        data.category === 'air_doctrine' ? 'bg-sky-500 text-white' :
        'bg-gray-600 text-white'
      }`}>
        {data.category || 'tech'}
      </div>

      <div className="p-3 pt-4">
        <div className="text-xs font-mono text-gray-500 truncate">{data.techId || 'tech_id'}</div>
        <div className="text-sm font-semibold text-white mt-0.5 truncate">{data.label || 'Technology'}</div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[10px] text-cyan-400 font-mono">⏱ {data.researchCost ?? 100}</span>
          {data.yearAvailable && (
            <span className="ml-auto text-[10px] text-gray-500">{data.yearAvailable}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !border-gray-900 !w-2.5 !h-2.5" />
    </div>
  );
}

const TECH_CATEGORIES = [
  'industry', 'electronics', 'land_doctrine', 'naval_doctrine',
  'air_doctrine', 'nuclear', 'infantry_weapons', 'armor',
];

// ─── Main component ───────────────────────────────────────────────────────────
// nodeTypes MUST be defined outside the component to avoid ReactFlow warning
const nodeTypes = { tech: TechNode };

const inputCls = "bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none w-full";

export default function TechTreeEditor() {
  const { techNodes, techEdges, setTechNodes, setTechEdges, setActiveAITarget, baseMod } = useModStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const modNames: Record<string, string> = {
    vanilla: 'Vanilla',
    millennium_dawn: 'Millennium Dawn',
    kaiserreich: 'Kaiserreich',
    tno: 'TNO',
    road_to_56: 'Road to 56',
  };
  const currentModName = modNames[baseMod] || baseMod;


  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setTechNodes(nds => {
      const next = [...nds];
      changes.forEach((c) => {
        if (c.type === 'position' && c.position) {
          const idx = next.findIndex(n => n.id === c.id);
          if (idx !== -1) next[idx] = { ...next[idx], position: c.position };
        }
        if (c.type === 'remove') {
          // handled by filter below
        }
      });
      const idsToRemove = changes.filter((c) => c.type === 'remove').map((c) => c.id);
      return next.filter(n => !idsToRemove.includes(n.id));
    });
  }, [setTechNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setTechEdges(eds => {
      const idsToRemove = changes.filter((c) => c.type === 'remove').map((c) => c.id);
      return eds.filter(e => !idsToRemove.includes(e.id));
    });
  }, [setTechEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    const edge: Edge = {
      id: `e-${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      animated: true,
      style: { stroke: '#22d3ee', strokeWidth: 2 },
    };
    setTechEdges(eds => addEdge(edge, eds));
  }, [setTechEdges]);

  useEffect(() => {
    return () => {
      setActiveAITarget({ type: 'none', id: null });
    };
  }, [setActiveAITarget]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setActiveAITarget({ type: 'tech', id: node.id });
  }, [setActiveAITarget]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveAITarget({ type: 'none', id: null });
  }, [setActiveAITarget]);

  const selectedNode = useMemo(() => (techNodes || []).find(n => n.id === selectedNodeId), [techNodes, selectedNodeId]);

  const updateSelected = (key: string, value: unknown) => {
    setTechNodes(nds => nds.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, [key]: value } } : n));
  };

  const addNode = () => {
    const newId = `tech_${Date.now()}`;
    setTechNodes(nds => [...nds, {
      id: newId,
      type: 'tech',
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { techId: `new_tech_${nds.length + 1}`, label: `New Technology ${nds.length + 1}`, category: 'industry', researchCost: 100, yearAvailable: 1936, bonus: '', dependencies: '' },
    }]);
    setSelectedNodeId(newId);
  };

  const deleteSelected = () => {
    if (!selectedNodeId) return;
    setTechNodes(nds => nds.filter(n => n.id !== selectedNodeId));
    setTechEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const generatedCode = useMemo(() => {
    const lines: string[] = ['technologies = {', ''];
    if (!techNodes || techNodes.length === 0) {
      lines.push('\t# Add technologies to generate script');
    } else {
      (techNodes || []).forEach(n => {
        const d = n.data || {};
        // Find prerequisites from edges
        const prereqs = (techEdges || []).filter(e => e.target === n.id).map(e => (techNodes || []).find(nd => nd.id === e.source)?.data?.techId).filter(Boolean);
        lines.push(`\t${d.techId || 'unknown_tech'} = {`);
        lines.push(`\t\tresearch_cost = ${d.researchCost ?? 100}`);
        if (d.yearAvailable) lines.push(`\t\tstart_year = ${d.yearAvailable}`);
        if (d.category) lines.push(`\t\tcategories = { ${d.category} }`);
        if (prereqs.length > 0) {
          lines.push(`\t\tdependencies = {`);
          prereqs.forEach((p) => lines.push(`\t\t\t${p} = 1`));
          lines.push(`\t\t}`);
        }
        if (d.bonus) {
          lines.push(`\t\t# Bonus`);
          d.bonus.split('\n').forEach((l: string) => lines.push(`\t\t${l}`));
        }
        lines.push(`\t}`);
        lines.push('');
      });
    }
    lines.push('}');
    return lines.join('\n');
  }, [techNodes, techEdges]);

  const exportTech = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'custom_technology.txt';
    a.click();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#121212]">
      {/* Toolbar */}
      <div className="h-12 bg-[#1a1a1a] border-b border-gray-800 flex items-center gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-cyan-400" />
          <span className="font-semibold text-gray-200">Tech Tree Editor</span>
          <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{currentModName}</span>
        </div>
        <div className="w-px bg-gray-700 h-6 mx-1" />
        <button onClick={addNode} className="flex items-center gap-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded transition-colors">
          <Plus size={13} /> Add Technology
        </button>
        <button onClick={deleteSelected} disabled={!selectedNodeId} className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded transition-colors disabled:opacity-30">
          <Trash2 size={13} /> Delete
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowCode(v => !v)}
            className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded transition-colors ${
              showCode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Code2 size={13} /> {showCode ? 'Hide Code' : 'Show Code'}
          </button>
          <button onClick={exportTech} className="flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded transition-colors">
            <Download size={13} /> Export .txt
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {(techNodes && techNodes.length > 0) ? (
            <ReactFlow
              nodes={techNodes}
              edges={techEdges || []}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="h-full w-full"
            >
              <Background color="#22d3ee" gap={24} size={0.5} />
              <Controls className="!bg-[#1a1a1a] !border-gray-700 !rounded-lg" />
              <MiniMap
                nodeColor={() => '#22d3ee'}
                maskColor="rgba(0,0,0,0.7)"
                className="!bg-[#1a1a1a] !border-gray-700 !rounded-lg"
              />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]">
              <FlaskConical size={64} className="mb-4 opacity-10" />
              <h2 className="text-xl font-bold text-gray-500">Tech Tree Empty</h2>
              <p className="text-sm mb-6">Start by adding your first technology node.</p>
              <button 
                onClick={addNode}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-8 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Create First Tech
              </button>
            </div>
          )}

          {selectedNodeId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-lg pointer-events-none backdrop-blur-sm">
              Editing Node: {selectedNodeId}
            </div>
          )}
        </div>

        {/* Properties Sidebar */}
        {selectedNode && (
          <div className="w-72 bg-[#1a1a1a] border-l border-gray-800 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Node Properties</h3>
              <p className="text-xs text-gray-600 mt-0.5">ID: {selectedNode.id}</p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Technology ID (script key)</label>
                <input type="text" value={selectedNode.data.techId}
                  onChange={e => updateSelected('techId', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className={`${inputCls} font-mono text-cyan-400`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Display Name</label>
                <input type="text" value={selectedNode.data.label}
                  onChange={e => updateSelected('label', e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Category</label>
                <select value={selectedNode.data.category}
                  onChange={e => updateSelected('category', e.target.value)} className={inputCls}>
                  {TECH_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Research Cost</label>
                  <input type="number" value={selectedNode.data.researchCost}
                    onChange={e => updateSelected('researchCost', Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Year Available</label>
                  <input type="number" value={selectedNode.data.yearAvailable}
                    onChange={e => updateSelected('yearAvailable', Number(e.target.value))} className={inputCls} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-gray-400">research_bonus = {'{'}</label>
                <div className="border border-gray-700 rounded overflow-hidden" style={{ height: '120px' }}>
                  <Editor
                    height="120px"
                    defaultLanguage="plaintext"
                    theme="vs-dark"
                    value={selectedNode.data.bonus || ''}
                    onChange={val => updateSelected('bonus', val || '')}
                    options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Panel */}
        {showCode && (
          <div className="w-80 bg-[#0f0f0f] border-l border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-800 flex items-center gap-2">
              <Code2 size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Generated Script</span>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <pre className="text-xs font-mono text-gray-400 whitespace-pre leading-relaxed">
                {generatedCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
