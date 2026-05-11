import { motion } from 'framer-motion';
import { Megaphone, Rocket, Target, Sparkles, MessageSquare, BarChart, Loader2, Copy, Check } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useModStore } from '../../store/useModStore';
import { GenerativeService } from '../../services/GenerativeService';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function PomelliOutreach() {
  const { t } = useTranslation();
  
  const { pomelliCampaignTarget,
    setPomelliCampaignTarget,
    pomelliCampaignTopic,
    setPomelliCampaignTopic,
    pomelliGeneratedDraft,
    setPomelliGeneratedDraft,
    isGeneratingPomelli,
    setIsGeneratingPomelli
   } = useModStore(useShallow(state => ({ pomelliCampaignTarget: state.pomelliCampaignTarget, setPomelliCampaignTarget: state.setPomelliCampaignTarget, pomelliCampaignTopic: state.pomelliCampaignTopic, setPomelliCampaignTopic: state.setPomelliCampaignTopic, pomelliGeneratedDraft: state.pomelliGeneratedDraft, setPomelliGeneratedDraft: state.setPomelliGeneratedDraft, isGeneratingPomelli: state.isGeneratingPomelli, setIsGeneratingPomelli: state.setIsGeneratingPomelli })));

  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!pomelliCampaignTopic) return;
    setIsGeneratingPomelli(true);
    
    try {
      const draft = await GenerativeService.generateMarketingCampaign(
        pomelliCampaignTopic,
        pomelliCampaignTarget || 'General HOI4 Players'
      );
      setPomelliGeneratedDraft(draft);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPomelli(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pomelliGeneratedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] text-gray-100 overflow-hidden">
      <div className="flex-none p-6 border-b border-gray-800 bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
              <Megaphone className="text-orange-500" />
              {t('pomelli')}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              AI-powered marketing campaigns and outreach for your mod
            </p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGeneratingPomelli || !pomelliCampaignTopic}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-lg shadow-orange-900/20"
          >
            {isGeneratingPomelli ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
            {isGeneratingPomelli ? 'Generating...' : 'Generate Campaign'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-orange-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-200">Target Audience</h3>
              <input 
                type="text"
                value={pomelliCampaignTarget}
                onChange={(e) => setPomelliCampaignTarget(e.target.value)}
                placeholder="e.g. Hardcore history buffs"
                className="w-full mt-3 bg-[#121212] border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="text-amber-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-200">AI Copywriter</h3>
              <p className="text-sm text-gray-400 mt-2">
                Let Pomelli generate catchy Reddit posts, Steam Workshop descriptions, and Discord announcements.
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart className="text-yellow-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-200">Outreach Analytics</h3>
              <p className="text-sm text-gray-400 mt-2">
                Track how your promotional materials perform across different platforms. (Coming Soon)
              </p>
            </motion.div>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 mt-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="text-gray-400" />
              Prompt Generator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">What is the main feature of your update?</label>
                <textarea 
                  value={pomelliCampaignTopic}
                  onChange={(e) => setPomelliCampaignTopic(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  rows={4}
                  placeholder="e.g. A completely reworked focus tree for Germany with 150 new focuses..."
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleGenerate}
                  disabled={isGeneratingPomelli || !pomelliCampaignTopic}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                  {isGeneratingPomelli ? <Loader2 size={18} className="animate-spin" /> : null}
                  Draft Campaign
                </button>
              </div>
            </div>
          </div>

          {pomelliGeneratedDraft && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-orange-900/20 to-amber-900/10 border border-orange-500/30 rounded-2xl p-8 mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-orange-400 flex items-center gap-2">
                  <Sparkles size={20} />
                  Generated Campaign Draft
                </h2>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <div className="bg-[#121212]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-gray-300 whitespace-pre-wrap leading-relaxed font-serif">
                {pomelliGeneratedDraft}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
