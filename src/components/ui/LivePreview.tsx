import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import type { DecisionCategory, HoiEvent, NationalSpirit } from '../../store/useModStore';
import type { Node } from 'reactflow';

interface LivePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreviewType = 'event' | 'focus' | 'spirit' | 'decision';
type PreviewDecision = DecisionCategory['decisions'][number];
type PreviewItem = HoiEvent | Node | NationalSpirit | PreviewDecision;

function isEvent(item: PreviewItem | undefined): item is HoiEvent {
  return !!item && 'options' in item && 'title' in item;
}

function isNode(item: PreviewItem | undefined): item is Node {
  return !!item && 'data' in item && 'position' in item;
}

function isSpirit(item: PreviewItem | undefined): item is NationalSpirit {
  return !!item && 'modifiers' in item && 'picture' in item;
}

function isDecision(item: PreviewItem | undefined): item is PreviewDecision {
  return !!item && 'effects' in item && 'cost' in item && 'trigger' in item;
}

export default function LivePreview({ isOpen, onClose }: LivePreviewProps) {
  const { events, nodes, spirits, decisionCategories } = useModStore();
  const [previewType, setPreviewType] = useState<PreviewType>('event');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getCurrentContent = () => {
    switch (previewType) {
      case 'event':
        return { items: events, title: 'Events' };
      case 'focus':
        return { items: nodes, title: 'Focus Tree' };
      case 'spirit':
        return { items: spirits, title: 'National Spirits' };
      case 'decision':
        return { items: decisionCategories.flatMap(c => c.decisions), title: 'Decisions' };
    }
  };

  const content = getCurrentContent();
  const items = content.items as PreviewItem[];
  const currentItem = items[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const renderEventPreview = () => {
    if (!isEvent(currentItem)) return <EmptyState />;
    const event = currentItem;

    return (
      <div className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <span className="text-xs text-gray-500">{event.picture || 'No image'}</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
          <h3 className="font-bold text-white mb-2">{event.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{event.desc}</p>
        </div>
        <div className="space-y-2">
          {event.options?.map((opt, idx: number) => (
            <button
              key={idx}
              className="w-full text-left p-3 rounded-lg bg-[#222] border border-gray-700 hover:border-mod-primary transition-colors"
            >
              <span className="text-sm text-gray-300">{opt.name || `Option ${idx + 1}`}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFocusPreview = () => {
    const focus = isNode(currentItem) ? currentItem.data as Record<string, unknown> : null;
    if (!focus) return <EmptyState />;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-mod-primary/20 to-transparent rounded-lg p-6 border border-mod-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-mod-primary flex items-center justify-center">
                <span className="text-black font-bold text-sm">{(focus.cost as number | undefined) || 70}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">{(focus.label as string | undefined) || 'Focus'}</h3>
              <span className="text-xs text-gray-500">{(focus.id as string | undefined) || 'focus_id'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">{(focus.description as string | undefined) || 'No description'}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Completion Reward</h4>
          <pre className="text-xs text-mod-accent font-mono overflow-x-auto">
            {(focus.completion_reward as string | undefined) || 'No reward set'}
          </pre>
        </div>
      </div>
    );
  };

  const renderSpiritPreview = () => {
    if (!isSpirit(currentItem)) return <EmptyState />;
    const spirit = currentItem;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">{spirit.name}</h3>
              <span className="text-xs text-gray-500">{spirit.id}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {spirit.modifiers?.map((mod, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <span className="text-sm text-gray-300">{mod.type}</span>
              <span className="text-sm font-bold text-mod-accent">{mod.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDecisionPreview = () => {
    if (!isDecision(currentItem)) return <EmptyState />;
    const decision = currentItem;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-transparent rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{decision.cost}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">{decision.name}</h3>
              <span className="text-xs text-gray-500">{decision.id}</span>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Trigger</h4>
          <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
            {decision.trigger || 'No trigger'}
          </pre>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    switch (previewType) {
      case 'event': return renderEventPreview();
      case 'focus': return renderFocusPreview();
      case 'spirit': return renderSpiritPreview();
      case 'decision': return renderDecisionPreview();
      default: return <EmptyState />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex bg-black/90 backdrop-blur-md"
        >
          <div className="w-64 bg-[#111] border-r border-gray-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white">Live Preview</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {(['event', 'focus', 'spirit', 'decision'] as PreviewType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setPreviewType(type); setCurrentIndex(0); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    previewType === type
                      ? 'bg-mod-primary/20 text-mod-primary border border-mod-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
              <div className="flex items-center gap-4">
                <button onClick={prev} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <span className="text-sm text-gray-400">
                  {currentIndex + 1} / {items.length}
                </span>
                <button onClick={next} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                {renderPreview()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <p className="text-sm">No items to preview</p>
    </div>
  );
}
