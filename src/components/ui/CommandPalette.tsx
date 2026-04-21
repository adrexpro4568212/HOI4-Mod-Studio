import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

export interface CommandPaletteAction {
  id: string;
  label: string;
  section: string;
  keywords: string;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
  placeholder: string;
}

export default function CommandPalette({ isOpen, onClose, actions, placeholder }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return actions
      .filter((action) => {
        if (!normalized) return true;
        return (
          action.label.toLowerCase().includes(normalized) ||
          action.keywords.includes(normalized) ||
          action.section.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 12);
  }, [actions, query]);

  const closePalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        closePalette();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePalette();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closePalette]);

  useEffect(() => {
    if (!isOpen || filteredActions.length === 0) return;
    const clamped = Math.min(activeIndex, Math.max(filteredActions.length - 1, 0));
    itemRefs.current[clamped]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filteredActions, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
        >
          <motion.div
            ref={paletteRef}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-[#151515] shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-800 bg-[#1a1a1a]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveIndex((prev) => Math.min(prev + 1, Math.max(filteredActions.length - 1, 0)));
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveIndex((prev) => Math.max(prev - 1, 0));
                    }
                    if (e.key === 'Enter' && filteredActions[activeIndex]) {
                      e.preventDefault();
                      filteredActions[activeIndex].run();
                      closePalette();
                    }
                  }}
                  placeholder={placeholder}
                  className="w-full bg-[#101010] border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 focus:border-mod-primary outline-none"
                />
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {filteredActions.length === 0 && (
                <div className="p-5 text-sm text-gray-500 text-center">No matching actions</div>
              )}

              {filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => {
                    action.run();
                    closePalette();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${index === activeIndex ? 'bg-mod-primary/10 border-mod-primary/40 text-mod-primary' : 'bg-[#1a1a1a] border-gray-800 text-gray-300 hover:text-white hover:border-mod-primary/40 hover:bg-[#202020]'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">{action.section}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-800 bg-[#121212] flex items-center justify-between text-[10px] text-gray-500">
              <span>Enter to run selected action</span>
              <span>Esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
