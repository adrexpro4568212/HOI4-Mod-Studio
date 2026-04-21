import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Trash2,
  Zap,
  Terminal,
  FileText,
  BookOpen,
  ShieldCheck,
  Code2,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { AgentService } from '../../services/AgentService';
import type { AgentTask } from '../../services/AgentService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  task?: AgentTask;
  timestamp: number;
}

// ── Agent visual config ────────────────────────────────────────────────────
const AGENT_CONFIG: Record<AgentTask, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  narrative: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: <BookOpen size={10} />,
  },
  scripting: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: <Code2 size={10} />,
  },
  validation: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: <ShieldCheck size={10} />,
  },
};

// ── Main Component ─────────────────────────────────────────────────────────
const AISidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { agentSettings, getModContext, activeAITarget, applyCodeToTarget } = useModStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async (overrideInput?: string, specificTask?: AgentTask) => {
    const messageContent = overrideInput || input;
    if (!messageContent.trim() || isLoading) return;

    const task: AgentTask = specificTask || AgentService.identifyTask(messageContent);

    const userMsg: Message = { role: 'user', content: messageContent, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideInput) setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const context = getModContext();
      const personality = agentSettings.personalities[task];
      const systemPrompt =
        `${personality.prompt}\n\n` +
        `Project Context: ${context}\n` +
        `Rules: Always wrap HOI4 scripts in triple backtick code blocks. Use correct Clausewitz syntax.`;

      const { response, agent } = await AgentService.executeTask(task, messageContent, systemPrompt);

      const assistantMsg: Message = {
        role: 'assistant',
        content: response,
        agent: agent || personality.name,
        task,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to communicate with AI');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for ai-suggest events from FocusTreeBuilder / EventCreator
  useEffect(() => {
    const handleAISuggest = (e: CustomEvent<{ prompt: string; autoSend: boolean; task?: AgentTask }>) => {
      const { prompt, autoSend, task } = e.detail;
      setInput(prompt);
      if (autoSend) handleSend(prompt, task);
    };
    window.addEventListener('ai-suggest', handleAISuggest as EventListener);
    return () => window.removeEventListener('ai-suggest', handleAISuggest as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  // Ping Ollama when sidebar opens
  useEffect(() => {
    if (!isOpen) return;
    const check = async () => {
      try {
        const { OllamaService } = await import('../../services/OllamaService');
        const models = await OllamaService.listModels(agentSettings.ollamaEndpoint);
        setOllamaOnline(models.length > 0);
      } catch {
        setOllamaOnline(false);
      }
    };
    check();
  }, [isOpen, agentSettings.ollamaEndpoint]);

  const renderContent = (content: string, task?: AgentTask) => {
    const blocks = content.split(/(```[\s\S]*?```)/g);
    return blocks.map((block, i) => {
      if (block.startsWith('```')) {
        const lines = block.replace(/^```\w*\n?/, '').replace(/```$/, '');
        return (
          <div key={i} className="relative group my-2">
            <pre className="bg-black/50 border border-white/10 rounded-lg p-3 overflow-x-auto font-mono text-[10px] text-green-300 whitespace-pre-wrap leading-relaxed">
              {lines}
            </pre>
            {activeAITarget?.type && activeAITarget.type !== 'none' && (
              <button
                onClick={() => applyCodeToTarget(lines, task === 'narrative' ? 'narrative' : 'scripting')}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-mod-primary text-black text-[9px] font-bold px-2 py-1 rounded shadow"
              >
                Apply to {activeAITarget.type}
              </button>
            )}
          </div>
        );
      }
      return (
        <span key={i} className="whitespace-pre-wrap leading-relaxed">
          {block}
        </span>
      );
    });
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const getQuickActions = () => {
    if (activeAITarget?.type === 'focus') {
      return [
        {
          label: 'Suggest Focus Effects',
          icon: <Sparkles size={14} />,
          prompt: 'Write a Clausewitz completion_reward block for this focus that fits its context.',
          task: 'scripting' as AgentTask,
        },
        {
          label: 'Write Focus Desc',
          icon: <FileText size={14} />,
          prompt: 'Write a flavorful narrative description for this focus based on its ID.',
          task: 'narrative' as AgentTask,
        },
        {
          label: 'Fix Focus Errors',
          icon: <Terminal size={14} />,
          prompt: 'Check the script of this focus for syntax errors and fix any issues you find.',
          task: 'validation' as AgentTask,
        },
      ];
    }
    if (activeAITarget?.type === 'event') {
      return [
        {
          label: 'Suggest Options',
          icon: <Sparkles size={14} />,
          prompt: 'Suggest 2 Clausewitz option blocks for this event with appropriate effects.',
          task: 'scripting' as AgentTask,
        },
        {
          label: 'Write Event Text',
          icon: <FileText size={14} />,
          prompt: 'Write flavorful narrative text for this event.',
          task: 'narrative' as AgentTask,
        },
        {
          label: 'Fix Triggers',
          icon: <Terminal size={14} />,
          prompt: 'Check the triggers for this event and fix any issues.',
          task: 'validation' as AgentTask,
        },
      ];
    }
    if (activeAITarget?.type === 'tech') {
      return [
        {
          label: 'Suggest Bonuses',
          icon: <Sparkles size={14} />,
          prompt: 'Suggest a Clausewitz effects block for this technology.',
          task: 'scripting' as AgentTask,
        },
        {
          label: 'Write Tech Desc',
          icon: <FileText size={14} />,
          prompt: 'Write a flavorful narrative description for this technology.',
          task: 'narrative' as AgentTask,
        },
      ];
    }
    
    // Default actions
    return [
      {
        label: 'Fix my script',
        icon: <Terminal size={14} />,
        prompt: 'Check this script for syntax errors and fix any issues you find.',
        task: 'validation' as AgentTask,
      },
      {
        label: 'Generate Event',
        icon: <FileText size={14} />,
        prompt: 'Help me design a new narrative event with a title, description and 2 options.',
        task: 'narrative' as AgentTask,
      },
      {
        label: 'Suggest Focus',
        icon: <Sparkles size={14} />,
        prompt: 'Suggest 3 focus tree ideas for a democratic path, with names and brief descriptions.',
        task: 'narrative' as AgentTask,
      },
      {
        label: 'Write Completion Reward',
        icon: <Code2 size={14} />,
        prompt: 'Write a Clausewitz completion_reward block that grants political power and unlocks a decision.',
        task: 'scripting' as AgentTask,
      },
    ];
  };

  const quickActions = getQuickActions();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed right-0 top-0 bottom-0 w-[420px] bg-[#141414] border-l border-gray-800/80 z-[150] flex flex-col shadow-2xl"
        >
          {/* ── Header ── */}
          <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-mod-primary/10 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mod-primary/20 rounded-xl">
                <Bot className="text-mod-primary" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Antigravity AI</h3>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Zap size={9} className="text-amber-500" />
                  {agentSettings.teamModeEnabled ? 'Agent Team Mode' : agentSettings.ollamaModel}
                  {ollamaOnline !== null && (
                    <span className={`ml-1 flex items-center gap-0.5 ${ollamaOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                      {ollamaOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
                      {ollamaOnline ? 'Ollama online' : 'Ollama offline'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
            
            {/* Active Context Banner */}
            <AnimatePresence>
              {activeAITarget?.type && activeAITarget.type !== 'none' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-mod-primary/10 border border-mod-primary/20 rounded-xl p-2.5 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-mod-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-mod-primary uppercase tracking-wider">
                        Context Linked
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Targeting: <span className="text-white font-medium capitalize">{activeAITarget.type}</span> 
                        <span className="text-gray-500 ml-1">({activeAITarget.id})</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4">
                <div className="w-16 h-16 bg-mod-primary/10 rounded-full flex items-center justify-center">
                  <Bot size={32} className="text-mod-primary" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1 text-sm">How can I help you mod today?</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    I have access to your project context and can help with scripts, narrative, and validation.
                  </p>
                </div>

                {/* Agent team legend */}
                {agentSettings.teamModeEnabled && (
                  <div className="w-full grid grid-cols-3 gap-1.5 text-center">
                    {(Object.keys(AGENT_CONFIG) as AgentTask[]).map(type => {
                      const cfg = AGENT_CONFIG[type];
                      const p = agentSettings.personalities[type];
                      return (
                        <div key={type} className={`p-2 rounded-lg border ${cfg.border} ${cfg.bg}`}>
                          <p className={`text-[9px] font-bold ${cfg.color} flex items-center justify-center gap-1`}>
                            {cfg.icon} {p.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 w-full">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action.prompt, action.task)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-mod-primary/30 hover:bg-mod-primary/5 transition-all text-left group"
                    >
                      <div className="text-mod-primary group-hover:scale-110 transition-transform shrink-0">
                        {action.icon}
                      </div>
                      <span className="text-[10px] text-gray-300 font-medium leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const taskCfg = msg.task ? AGENT_CONFIG[msg.task] : null;
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.role === 'assistant' && msg.agent && (
                    <span
                      className={`text-[9px] font-bold mb-1 ml-1 flex items-center gap-1 ${taskCfg?.color ?? 'text-mod-primary'}`}
                    >
                      {taskCfg?.icon ?? <Sparkles size={8} />}
                      {msg.agent}
                    </span>
                  )}
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-mod-primary text-black font-medium rounded-tr-none'
                        : `rounded-tl-none border ${taskCfg?.border ?? 'border-white/5'} ${taskCfg?.bg ?? 'bg-[#1e1e1e]'} text-gray-200`
                    }`}
                  >
                    {msg.role === 'assistant' ? renderContent(msg.content, msg.task) : msg.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay }}
                        className="w-1.5 h-1.5 bg-mod-primary rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-red-400 leading-relaxed whitespace-pre-wrap">{error}</p>
              </div>
            )}
          </div>

          {/* ── Input Area ── */}
          <div className="p-4 border-t border-gray-800/80 bg-black/30 shrink-0">
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Antigravity AI..."
                className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:border-mod-primary/60 outline-none transition-all resize-none min-h-[46px] max-h-[140px] placeholder:text-gray-600"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-mod-primary text-black hover:scale-105 active:scale-95'
                    : 'text-gray-600 pointer-events-none'
                }`}
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-[9px] text-center text-gray-600 mt-2">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISidebar;
