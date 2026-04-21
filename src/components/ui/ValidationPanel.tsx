import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown, Wrench, Search, ArrowRight } from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { validateModState, type ValidationIssue } from '../../utils/validatorLogic';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export default function ValidationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const state = useModStore();
  
  const issues = useMemo(() => validateModState(state), [state]);
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  const applyFix = useCallback((issue: ValidationIssue) => {
    if (issue.fixLabel === 'Generate Localization') {
      state.addLocalizationWithData({
        id: generateId(),
        key: `${issue.sourceId}_name`,
        english: issue.sourceId.replace(/_/g, ' ').toUpperCase(),
        spanish: issue.sourceId.replace(/_/g, ' ').toUpperCase(),
        french: issue.sourceId.replace(/_/g, ' ').toUpperCase(),
      });
    } else if (issue.fixLabel === 'Rename ID') {
      if (issue.source === 'focus') {
        state.setNodes((nds) => nds.map(n => n.id === issue.sourceId ? { ...n, id: `${n.id}_1` } : n));
      }
    } else if (issue.fixLabel === 'Add Default Option') {
       const event = state.events.find(e => e.id === issue.sourceId);
       if (event) {
         state.updateEventById(event.id, {
           options: [...event.options, { name: 'OK', effect: '' }]
         });
       }
    }
  }, [state]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      {/* Mini Toggle Bar */}
      <div 
        className={`h-8 border-t border-gray-800 flex items-center justify-between px-4 cursor-pointer select-none transition-colors ${errorCount > 0 ? 'bg-red-950/20 hover:bg-red-950/40' : 'bg-[#111] hover:bg-[#1a1a1a]'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            Problems
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${errorCount > 0 ? 'text-red-500' : 'text-gray-600'}`}>
              <AlertCircle size={12} /> {errorCount}
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${warningCount > 0 ? 'text-amber-500' : 'text-gray-600'}`}>
              <AlertTriangle size={12} /> {warningCount}
            </div>
            {errorCount === 0 && warningCount === 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                <CheckCircle2 size={12} /> Clear
              </div>
            )}
          </div>
        </div>
        
        <div className="text-[9px] text-gray-500 font-mono">
          validator_v1.0.active
        </div>
      </div>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 280 }}
            exit={{ height: 0 }}
            className="bg-[#0a0a0a] border-t border-gray-800 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {issues.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                  <CheckCircle2 size={48} className="mb-2 text-green-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No issues detected</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {issues.map((issue) => (
                    <div 
                      key={issue.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#111] border border-gray-800/50 hover:border-gray-700 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {issue.severity === 'error' ? (
                          <AlertCircle size={14} className="text-red-500" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-500" />
                        )}
                        <div className="flex flex-col">
                          <div className="text-[11px] text-gray-300 font-medium">{issue.message}</div>
                          <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase font-bold tracking-tighter">
                            <span>{issue.source}</span>
                            <ArrowRight size={8} />
                            <span>{issue.sourceId}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {issue.fixLabel && (
                          <button 
                            onClick={() => applyFix(issue)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-mod-primary/10 hover:bg-mod-primary text-mod-primary hover:text-black rounded-lg text-[10px] font-bold transition-all border border-mod-primary/20"
                          >
                            <Wrench size={12} />
                            {issue.fixLabel}
                          </button>
                        )}
                        <button className="p-1.5 text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          <Search size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-[#111] border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="text-[10px] text-gray-500">Filters:</div>
                 <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold border border-red-500/20">Errors</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold border border-amber-500/20">Warnings</span>
                 </div>
              </div>
              <div className="text-[10px] text-gray-600 font-medium">
                 {issues.length} problems total
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
