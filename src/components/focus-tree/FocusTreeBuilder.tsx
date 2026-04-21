import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  addEdge
} from 'reactflow';
import type {
  Node,
  Edge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import FocusNode from './FocusNode';
import { serializeClausewitz } from '../../utils/clausewitz';
import type { ClausewitzObject } from '../../utils/clausewitz';
import { Settings, Code2, X, Plus, Shuffle, GitCommit, Sparkles, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useModStore } from '../../store/useModStore';

// nodeTypes MUST be defined outside the component to avoid ReactFlow warning
const nodeTypes = {
  focus: FocusNode,
};


export default function FocusTreeBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges, addFocusNode, setActiveAITarget } = useModStore();
  const clearFocusTree = useModStore((state) => state.clearFocusTree);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [edgeMode, setEdgeMode] = useState<'prerequisite' | 'mutually_exclusive'>('prerequisite');
  const [isGenerating] = useState<string | null>(null);

  const handleAIAction = (type: 'description' | 'reward') => {
    if (!selectedNode) return;
    
    const task = type === 'description' ? 'narrative' : 'scripting';
    const prompt = type === 'description' 
      ? `Write a historical description for a HOI4 focus named "${selectedNode.data.label || selectedNode.data.id}". Current context: ${useModStore.getState().baseMod}.`
      : `Generate a HOI4 Clausewitz completion reward script for a focus named "${selectedNode.data.label || selectedNode.data.id}".`;

    window.dispatchEvent(new CustomEvent('ai-suggest', { 
      detail: { 
        prompt,
        autoSend: true,
        task: task
      } 
    }));
  };



  useEffect(() => {
    return () => {
      setActiveAITarget({ type: 'none', id: null });
    };
  }, [setActiveAITarget]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setActiveAITarget({ type: 'focus', id: node.id });
  }, [setActiveAITarget]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setActiveAITarget({ type: 'none', id: null });
  }, [setActiveAITarget]);

  const localOnConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    const isExclusive = edgeMode === 'mutually_exclusive';
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      animated: true,
      style: isExclusive 
        ? { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' } 
        : { stroke: '#f59e0b', strokeWidth: 2 },
      data: { type: isExclusive ? 'mutually_exclusive' : 'prerequisite' }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [edgeMode, setEdges]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const updateSelectedNodeData = (key: string, value: unknown) => {
    if (!selectedNodeId) return;
    setNodes(nds => nds.map(node => {
      if (node.id === selectedNodeId) {
        return { ...node, data: { ...node.data, [key]: value } };
      }
      return node;
    }));
  };

  const addNode = () => {
    addFocusNode();
    // No podemos hacer setSelectedNodeId fácilmente aquí porque newNodeId se genera en la store. 
    // Por simplicidad, el usuario puede hacer click en el nodo nuevo.
  };

  const generatedCode = useMemo(() => {
    if (selectedNode) {
      // Código de 1 solo nodo (el seleccionado)
      const focusData: { focus: Record<string, unknown> } = {
        focus: {
          id: selectedNode.data.id || 'unknown_id',
          icon: selectedNode.data.icon || 'GFX_goal_unknown',
          x: Math.round(selectedNode.position.x / 100),
          y: Math.round(selectedNode.position.y / 100),
          cost: Number(selectedNode.data.cost) || 10,
        }
      };

      if (selectedNode.data.available) focusData.focus.available = { __raw_inject: { __raw: selectedNode.data.available } };
      if (selectedNode.data.bypass) focusData.focus.bypass = { __raw_inject: { __raw: selectedNode.data.bypass } };
      if (selectedNode.data.completion_reward) focusData.focus.completion_reward = { __raw_inject: { __raw: selectedNode.data.completion_reward } };

      const exEdges = edges.filter(e => (e.source === selectedNode.id || e.target === selectedNode.id) && e.data?.type === 'mutually_exclusive');
      if (exEdges.length > 0) {
         focusData.focus.mutually_exclusive = exEdges.map(edge => {
            const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
            const otherNode = nodes.find(n => n.id === otherNodeId);
            return otherNode ? { focus: otherNode.data.id } : null;
         }).filter(Boolean);
      }

      return serializeClausewitz(focusData as unknown as ClausewitzObject);
    } else {
      // Código de todo el árbol
      const allFocuses = nodes.map(node => {
        // Buscar prerrequisitos (conexiones donde este nodo es el target)
        const incomingEdges = edges.filter(e => e.target === node.id && e.data?.type !== 'mutually_exclusive');
        const prerequisites = incomingEdges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          return sourceNode ? { focus: sourceNode.data.id } : null;
        }).filter(Boolean);

        const focusObj: Record<string, unknown> = {
          id: node.data.id || 'unknown_id',
          icon: node.data.icon || 'GFX_goal_unknown',
          x: Math.round(node.position.x / 100),
          y: Math.round(node.position.y / 100),
          cost: Number(node.data.cost) || 10,
        };

        if (prerequisites.length > 0) focusObj.prerequisite = prerequisites;
        if (node.data.available) focusObj.available = { __raw_inject: { __raw: node.data.available } };
        if (node.data.bypass) focusObj.bypass = { __raw_inject: { __raw: node.data.bypass } };
        if (node.data.completion_reward) focusObj.completion_reward = { __raw_inject: { __raw: node.data.completion_reward } };

        const exEdges = edges.filter(e => (e.source === node.id || e.target === node.id) && e.data?.type === 'mutually_exclusive');
        if (exEdges.length > 0) {
           focusObj.mutually_exclusive = exEdges.map(edge => {
              const otherNodeId = edge.source === node.id ? edge.target : edge.source;
              const otherNode = nodes.find(n => n.id === otherNodeId);
              return otherNode ? { focus: otherNode.data.id } : null;
           }).filter(Boolean);
        }

        return focusObj;
      });

      const treeData = {
        focus_tree: {
          id: 'my_custom_tree',
          focus: allFocuses
        }
      };
      return serializeClausewitz(treeData as unknown as ClausewitzObject);
    }
  }, [selectedNode, nodes, edges]);

  return (
    <div className="w-full h-full relative flex">
      {/* Lienzo Principal */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={localOnConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#121212]"
        >
          {/* Toolbar over the canvas */}
          <div className="absolute top-4 left-4 z-10 flex gap-4">
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800 shadow-xl">
              <button 
                onClick={addNode}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded text-sm font-semibold transition-colors mr-2"
              >
                <Plus size={16} /> Añadir Enfoque
              </button>
              <div className="flex border border-gray-700 rounded overflow-hidden mr-2 bg-[#111]">
                <button 
                  onClick={() => setEdgeMode('prerequisite')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${edgeMode === 'prerequisite' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                  title="Draw Prerequisites (Solid Line)"
                >
                  <GitCommit size={14} /> Prerequisite
                </button>
                <button 
                  onClick={() => setEdgeMode('mutually_exclusive')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${edgeMode === 'mutually_exclusive' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                  title="Draw Mutually Exclusive (Red Dashed Line)"
                >
                  <Shuffle size={14} /> Exclusive
                </button>
              </div>
              <button 
                onClick={clearFocusTree}
                className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded text-sm font-semibold transition-colors"
              >
                <X size={16} /> Limpiar
              </button>
            </div>
          </div>

          <Background color="#333" gap={16} />
          <Controls className="bg-[#1a1a1a] border-gray-800 fill-gray-300" />
          <MiniMap 
            nodeColor="#f59e0b" 
            maskColor="rgba(18, 18, 18, 0.7)"
            className="bg-[#1a1a1a] border border-gray-800"
          />
        </ReactFlow>
      </div>

      {/* Panel Lateral Derecho (Propiedades) */}
      {selectedNode && (
        <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 flex flex-col h-full shadow-xl">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
            <h2 className="font-semibold text-gray-200 flex items-center gap-2">
              <Settings size={18} className="text-amber-500"/> Propiedades
            </h2>
            <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Formulario */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Focus ID</label>
              <input 
                type="text" 
                value={selectedNode.data.id || ''} 
                onChange={(e) => updateSelectedNodeData('id', e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Título Visible</label>
              <input 
                type="text" 
                value={selectedNode.data.label || ''} 
                onChange={(e) => updateSelectedNodeData('label', e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coste (Días)</label>
              <input 
                type="number" 
                value={selectedNode.data.cost || 0} 
                onChange={(e) => updateSelectedNodeData('cost', e.target.value)}
                className="bg-[#121212] border border-gray-700 text-gray-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Descripción Histórica</span>
                <button 
                  onClick={() => handleAIAction('description')}
                  disabled={isGenerating !== null}
                  className="text-amber-500 hover:text-amber-400 p-1 rounded hover:bg-amber-500/10 transition-all disabled:opacity-30"
                  title="Generate with AI"
                >
                  {isGenerating === 'description' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </label>
              <textarea 
                rows={3}
                value={selectedNode.data.description || ''} 
                onChange={(e) => updateSelectedNodeData('description', e.target.value)}
                placeholder="Escribe la descripción histórica o usa la IA..."
                className="bg-[#121212] border border-gray-700 text-gray-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1 h-32">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">Available (Trigger)</label>
              <div className="flex-1 border border-gray-700 rounded overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  theme="vs-dark"
                  value={selectedNode.data.available || ''}
                  onChange={(val) => updateSelectedNodeData('available', val)}
                  options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 h-32">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">Bypass (Trigger)</label>
              <div className="flex-1 border border-gray-700 rounded overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  theme="vs-dark"
                  value={selectedNode.data.bypass || ''}
                  onChange={(val) => updateSelectedNodeData('bypass', val)}
                  options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 h-40">
              <label className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1">Completion Reward</span>
                <button 
                  onClick={() => handleAIAction('reward')}
                  disabled={isGenerating !== null}
                  className="text-amber-500 hover:text-amber-400 p-1 rounded hover:bg-amber-500/10 transition-all disabled:opacity-30"
                  title="Generate Script with AI"
                >
                  {isGenerating === 'reward' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </label>
              <div className="flex-1 border border-amber-900 rounded overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  theme="vs-dark"
                  value={selectedNode.data.completion_reward || ''}
                  onChange={(val) => updateSelectedNodeData('completion_reward', val)}
                  options={{ minimap: { enabled: false }, fontSize: 12, lineNumbers: 'off', scrollBeyondLastLine: false }}
                />
              </div>
            </div>

            <hr className="border-gray-800 my-2" />

            {/* Code Preview */}
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Code2 size={14} className="text-amber-500"/> Code Preview
              </h3>
              <div className="bg-[#121212] border border-gray-800 rounded p-3 flex-1">
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Si NO hay nodo seleccionado, mostramos un panel de "Vista Global" con el código del árbol completo */}
      {!selectedNode && (
        <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 flex flex-col h-full shadow-xl">
          <div className="p-4 border-b border-gray-800 bg-[#222]">
            <h2 className="font-semibold text-gray-200">Visión Global del Árbol</h2>
            <p className="text-xs text-gray-500 mt-1">Selecciona un nodo para editar sus propiedades.</p>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={14} className="text-amber-500"/> Full Tree Script
            </h3>
            <div className="bg-[#121212] border border-gray-800 rounded p-3 flex-1 overflow-auto">
              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
