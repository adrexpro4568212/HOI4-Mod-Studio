import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Copy, Check, Globe, Loader2, FileCode, CheckCircle2 } from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { auth, shareExportedMod } from '../../services/firebase';
import { 
  generateFocusTreeText, 
  generateEventsText, 
  generateIdeasText, 
  generateDecisionsText, 
  generateCharactersText, 
  generateLocalizationText 
} from '../../utils/export';

interface CloudExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudExportDialog({ isOpen, onClose }: CloudExportDialogProps) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const state = useModStore();

  const handleShare = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSharing(true);
    try {
      // 1. Generate full mod bundle as a single text block for simplicity in this MVP
      // In a real app, we might store this as a JSON or multiple files
      const fullModCode = `
### FOCUS TREE ###
${generateFocusTreeText(state.nodes, state.edges)}

### EVENTS ###
${generateEventsText(state.events)}

### IDEAS ###
${generateIdeasText(state.spirits)}

### DECISIONS ###
${generateDecisionsText(state.decisionCategories)}

### CHARACTERS ###
${generateCharactersText(state.leaders)}

### LOCALIZATION (EN) ###
${generateLocalizationText(state.localizations, 'english')}
      `.trim();

      const shareId = await shareExportedMod(user.uid, state.projectName || 'My Custom Mod', fullModCode);
      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);
    } catch (e) {
      console.error("Failed to share mod", e);
    } finally {
      setSharing(false);
    }
  };

  const copyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-mod-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mod-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--mod-glow)]">
                  <Share2 size={22} className="text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Share to Cloud</h2>
                  <p className="text-xs text-gray-500">Publish your mod scripts and get a shareable link.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {!shareUrl ? (
                <div className="space-y-6">
                  <div className="bg-[#111] border border-gray-800 rounded-xl p-4 flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Globe size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200">Public Access</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Generating a cloud link allows anyone with the URL to view and download your mod's script files.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Included Components</h5>
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { name: 'Focus Tree', count: state.nodes.length },
                         { name: 'Events', count: state.events.length },
                         { name: 'National Spirits', count: state.spirits.length },
                         { name: 'Decisions', count: state.decisionCategories.length }
                       ].map(comp => (
                         <div key={comp.name} className="flex items-center justify-between bg-[#141414] border border-gray-800/50 px-3 py-2 rounded-lg">
                           <span className="text-xs text-gray-400">{comp.name}</span>
                           <span className="text-xs font-mono text-mod-accent">{comp.count}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    disabled={sharing || !auth.currentUser}
                    className="w-full py-4 bg-mod-primary hover:bg-mod-primary/80 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-mod-primary/10 active:scale-95"
                  >
                    {sharing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
                    {sharing ? 'Generating Link...' : 'Publish to Mod Cloud'}
                  </button>
                  
                  {!auth.currentUser && (
                    <p className="text-[10px] text-center text-red-400">You must be signed in to share mods.</p>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 py-4"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Mod Published!</h3>
                    <p className="text-sm text-gray-400">Your mod is now live on the HOI4 Mod Studio cloud.</p>
                  </div>

                  <div className="bg-[#111] border border-gray-800 rounded-xl p-2 flex items-center gap-3">
                    <div className="flex-1 px-3 py-2 text-sm text-mod-accent font-mono truncate select-all">
                      {shareUrl}
                    </div>
                    <button 
                      onClick={copyLink}
                      className="p-3 bg-mod-primary hover:bg-mod-primary/80 text-black rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex gap-3">
                     <button 
                       onClick={onClose}
                       className="flex-1 py-3 border border-gray-800 hover:bg-white/5 rounded-xl text-sm font-medium transition-colors"
                     >
                       Done
                     </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="p-4 bg-[#141414] border-t border-gray-800 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 opacity-40 grayscale">
                 <FileCode size={14} />
                 <span className="text-[10px] font-medium">Auto-generated scripts</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700" />
              <div className="flex items-center gap-1.5 opacity-40 grayscale">
                 <Globe size={14} />
                 <span className="text-[10px] font-medium">Public URL</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
