import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { OllamaService } from '../../services/OllamaService';

interface AgentTeamSettingsProps {
  onClose: () => void;
}

const AgentTeamSettings: React.FC<AgentTeamSettingsProps> = ({ onClose }) => {
  const { agentSettings, setAgentSettings, fetchOllamaModels } = useModStore();
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'online' | 'offline'>('idle');
  const [activeTab, setActiveTab] = useState<'orchestration' | 'personalities'>('orchestration');

  const checkOllama = useCallback(async () => {
    setIsCheckingOllama(true);
    const isOnline = await OllamaService.checkStatus(agentSettings.ollamaEndpoint);
    setOllamaStatus(isOnline ? 'online' : 'offline');
    if (isOnline) {
      await fetchOllamaModels();
    }
    setIsCheckingOllama(false);
  }, [agentSettings.ollamaEndpoint, fetchOllamaModels]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void checkOllama();
    }, 0);
    return () => window.clearTimeout(id);
  }, [checkOllama]);

  const updatePersonality = (key: keyof typeof agentSettings.personalities, field: 'name' | 'prompt', value: string) => {
    const currentPersonalities = agentSettings.personalities ?? {};
    const newPersonalities = {
      ...currentPersonalities,
      [key]: {
        ...(currentPersonalities[key] ?? {}),
        [field]: value
      }
    };
    setAgentSettings({ personalities: newPersonalities as Parameters<typeof setAgentSettings>[0]['personalities'] });
  };

  const providers = [
    { id: 'gemini', name: 'Google Gemini', icon: <Zap className="text-blue-400" size={16} />, desc: 'Remote - High creativity & lore' },
    { id: 'ollama', name: 'Ollama Local', icon: <Cpu className="text-amber-400" size={16} />, desc: 'Local - Fast scripting & privacy' }
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-mod-primary/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mod-primary/20 rounded-xl">
            <Bot className="text-mod-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Agent Team</h2>
            <p className="text-xs text-gray-400">Collaborate between local and cloud AI specialists</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={checkOllama}
            disabled={isCheckingOllama}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={isCheckingOllama ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
        {/* Toggle Master */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <Layers className="text-mod-primary" size={20} />
            <div>
              <p className="text-sm font-bold text-white">Enable Multi-Agent Team</p>
              <p className="text-xs text-gray-500">Allow agents to work together on different tasks</p>
            </div>
          </div>
          <button 
            onClick={() => setAgentSettings({ teamModeEnabled: !agentSettings.teamModeEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${agentSettings.teamModeEnabled ? 'bg-mod-primary' : 'bg-gray-700'}`}
          >
            <motion.div 
              animate={{ x: agentSettings.teamModeEnabled ? 26 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        <AnimatePresence>
          {agentSettings.teamModeEnabled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                <button 
                  onClick={() => setActiveTab('orchestration')}
                  className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${activeTab === 'orchestration' ? 'border-mod-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  Orchestration
                </button>
                <button 
                  onClick={() => setActiveTab('personalities')}
                  className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${activeTab === 'personalities' ? 'border-mod-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  Personalities
                </button>
              </div>

              {activeTab === 'orchestration' ? (
                <>
                  {/* Task Routing */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <ChevronRight size={14} className="text-mod-primary" />
                      Task Orchestration
                    </h3>
                    
                    {[
                      { label: 'Historical Narrative', providerKey: 'narrativeProvider' as const, modelKey: 'narrativeModel' as const },
                      { label: 'Clausewitz Scripting', providerKey: 'scriptingProvider' as const, modelKey: 'scriptingModel' as const },
                      { label: 'Code Validation', providerKey: 'validationProvider' as const, modelKey: 'validationModel' as const }
                    ].map((task) => (
                      <div key={task.providerKey} className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-gray-300">{task.label}</p>
                          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            {providers.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => setAgentSettings({ [task.providerKey]: p.id })}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${
                                  agentSettings[task.providerKey] === p.id 
                                    ? 'bg-mod-primary text-black' 
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                {p.icon}
                                {p.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {agentSettings[task.providerKey] === 'ollama' && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 pl-4"
                          >
                            <div className="h-4 w-px bg-gray-800" />
                            <label className="text-[9px] font-bold text-gray-600 uppercase shrink-0">Model Specialist:</label>
                            <select 
                              value={agentSettings[task.modelKey]}
                              onChange={(e) => setAgentSettings({ [task.modelKey]: e.target.value })}
                              className="flex-1 bg-black/40 border border-white/5 rounded-md px-2 py-1 text-[10px] text-gray-300 focus:border-mod-primary outline-none appearance-none"
                            >
                              {agentSettings.availableModels.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Local AI Config */}
                  <div className="space-y-4 pt-4 border-t border-gray-800">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Server size={14} className="text-amber-500" />
                      Local AI (Ollama) Settings
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Model Selection</label>
                        <select 
                          value={agentSettings.ollamaModel}
                          onChange={(e) => setAgentSettings({ ollamaModel: e.target.value })}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-mod-primary outline-none appearance-none"
                        >
                          {agentSettings.availableModels.length > 0 ? (
                            agentSettings.availableModels.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))
                          ) : (
                            <option value={agentSettings.ollamaModel}>{agentSettings.ollamaModel} (cached)</option>
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Endpoint URL</label>
                        <input 
                          type="text" 
                          value={agentSettings.ollamaEndpoint}
                          onChange={(e) => setAgentSettings({ ollamaEndpoint: e.target.value })}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-mod-primary outline-none"
                        />
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      ollamaStatus === 'online' 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/5 border-red-500/20 text-red-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {ollamaStatus === 'online' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {ollamaStatus === 'online' ? 'Ollama is running and ready' : 'Ollama is offline or unreachable'}
                        </div>
                        <button 
                          onClick={checkOllama}
                          disabled={isCheckingOllama}
                          className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                        >
                          Test Connection
                        </button>
                      </div>
                      
                      {ollamaStatus === 'offline' && (
                        <div className="text-[10px] bg-black/20 p-2 rounded border border-white/5 text-gray-400">
                          <p className="font-bold text-gray-300 mb-1">Setup Tip:</p>
                          <p>1. Ensure Ollama is running.</p>
                          <p>2. Set environment variable: <code className="text-amber-400">OLLAMA_ORIGINS="*"</code></p>
                          <p>3. Restart Ollama after setting the variable.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {Object.entries(agentSettings.personalities ?? {}).map(([key, p]) => (
                    <div key={key} className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            key === 'narrative' ? 'bg-blue-400' : key === 'scripting' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <h4 className="text-xs font-bold text-white uppercase tracking-widest">{key} Specialist</h4>
                        </div>
                        <input 
                          type="text" 
                          value={p?.name ?? ''}
                          onChange={(e) => updatePersonality(key as keyof typeof agentSettings.personalities, 'name', e.target.value)}
                          className="bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] text-mod-primary outline-none focus:border-mod-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">System Prompt Override</label>
                        <textarea 
                          value={p?.prompt ?? ''}
                          onChange={(e) => updatePersonality(key as keyof typeof agentSettings.personalities, 'prompt', e.target.value)}
                          rows={3}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-300 focus:border-mod-primary outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 bg-black/20 border-t border-gray-800 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-2 rounded-xl bg-mod-primary text-black font-bold text-sm hover:scale-105 transition-transform"
        >
          Confirm Configuration
        </button>
      </div>
    </motion.div>
  );
};

export default AgentTeamSettings;
