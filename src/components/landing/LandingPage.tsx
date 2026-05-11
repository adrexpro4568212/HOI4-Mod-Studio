"use client"

import { useState, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { GitBranch, FileText, Play, Code2, Sparkles, Terminal, X, Globe, BookOpen, ChevronDown, CheckCircle2, Trees, Users, Zap, Layers, Rss, Wrench, Star, Shield, Package, LogIn, Cloud, Milestone, Camera, Target } from "lucide-react"
import { fetchChangelog } from '../../services/firebase';
import { useModStore } from "../../store/useModStore"
import type { BaseModType } from "../../data/modDictionaries"
import { useTranslation } from '../../hooks/useTranslation';
import AuthModal from '../auth/AuthModal';
import { onAuthChange, loginWithGoogle, type User } from '../../services/firebase';

// ============================================================================
// DATA
// ============================================================================

const features = [
  {
    icon: GitBranch,
    title: "Visual Focus Tree Builder",
    description:
      "Drag and drop nodes, connect them, and generate code automatically. No more manual scripting for your focus trees.",
    isNew: false,
    titleKey: 'featureFocusTitle',
    descKey: 'featureFocusDesc'
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Mod in your native language. Full support for English, Spanish, Russian, German, French, Portuguese, and Chinese.",
    isNew: true,
    titleKey: 'featureLangTitle',
    descKey: 'featureLangDesc'
  },
  {
    icon: Play,
    title: "Live Event Simulator",
    description:
      "Write your events and see exactly how the HOI4 popup will look in the game engine. Test before you export.",
    isNew: false,
    titleKey: 'featureEventTitle',
    descKey: 'featureEventDesc'
  },
  {
    icon: Rss,
    title: "Dev Tracker & Roadmap",
    description:
      "Stay informed with real-time updates on new features and the project roadmap directly within the studio.",
    isNew: true,
    titleKey: 'featureTrackerTitle',
    descKey: 'featureTrackerDesc'
  },
  {
    icon: Cloud,
    title: "Cloud & Community Hub",
    description:
      "Save projects to Firebase, sync across devices, and share your templates with the global modding community.",
    isNew: true,
    titleKey: 'featureCloudTitle',
    descKey: 'featureCloudDesc'
  },
  {
    icon: Milestone,
    title: "Visual Tech Tree Canvas",
    description:
      "A ReactFlow-powered editor for designing technology trees. Connect prerequisites and bonuses with a visual node system.",
    isNew: true,
    titleKey: 'featureTechTitle',
    descKey: 'featureTechDesc'
  },
  {
    icon: Layers,
    title: "Mod-Specific Power Tools",
    description:
      "Adapts automatically to Millennium Dawn (Economy), TNO (Narrative Paths), and Kaiserreich (Civil War systems).",
    isNew: true,
    titleKey: 'featureModsTitle',
    descKey: 'featureModsDesc'
  },
  {
    icon: Code2,
    title: "Clausewitz Parser",
    description:
      "An intelligent engine that guarantees 100% valid Paradox script output. Never worry about syntax errors again.",
    isNew: false,
    titleKey: 'featureParserTitle',
    descKey: 'featureParserDesc'
  },
  {
    icon: Zap,
    title: "Instant Export",
    description:
      "Package your entire project into valid game files with a single click. Ready to play immediately.",
    isNew: false,
    titleKey: 'featureExportTitle',
    descKey: 'featureExportDesc'
  },
  {
    icon: Sparkles,
    title: "AI Smart Translation",
    description: "Translate your mod to 7 languages instantly with AI. Context-aware and culturally accurate.",
    isNew: true,
    titleKey: 'aiTranslationTitle',
    descKey: 'aiTranslationDesc'
  },
  {
    icon: Camera,
    title: "Photoshoot Propaganda",
    description: "Design immersive propaganda posters and event newsreels with our integrated visual studio.",
    isNew: true,
    titleKey: 'propagandaTitle',
    descKey: 'propagandaDesc'
  },
  {
    icon: Target,
    title: "Google Pomelli Outreach",
    description: "Powered by the Pomelli engine to expand your mod's reach to thousands of new players automatically.",
    isNew: true,
    titleKey: 'pomelliTitle',
    descKey: 'pomelliDesc'
  },
]

const guideSteps = [
  {
    id: 1,
    icon: Globe,
    titleKey: "guideStep1Title",
    badgeKey: "guideStep1Badge",
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    content: [
      { headingKey: "guideStep1H1", textKey: "guideStep1T1" },
      { headingKey: "guideStep1H2", textKey: "guideStep1T2" },
      { headingKey: "guideStep1H3", textKey: "guideStep1T3" }
    ]
  },
  {
    id: 2,
    icon: Trees,
    titleKey: "guideStep2Title",
    badgeKey: "guideStep2Badge",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    content: [
      { headingKey: "guideStep2H1", textKey: "guideStep2T1" },
      { headingKey: "guideStep2H2", textKey: "guideStep2T2" },
      { headingKey: "guideStep2H3", textKey: "guideStep2T3" },
      { headingKey: "guideStep2H4", textKey: "guideStep2T4" }
    ]
  },
  {
    id: 3,
    icon: Play,
    titleKey: "guideStep3Title",
    badgeKey: "guideStep3Badge",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    content: [
      { headingKey: "guideStep3H1", textKey: "guideStep3T1" },
      { headingKey: "guideStep3H2", textKey: "guideStep3T2" },
      { headingKey: "guideStep3H3", textKey: "guideStep3T3" },
      { headingKey: "guideStep3H4", textKey: "guideStep3T4" },
      { headingKey: "guideStep3H5", textKey: "guideStep3T5" }
    ]
  },
  {
    id: 4,
    icon: Users,
    titleKey: "guideStep4Title",
    badgeKey: "guideStep4Badge",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    content: [
      { headingKey: "guideStep4H1", textKey: "guideStep4T1" },
      { headingKey: "guideStep4H2", textKey: "guideStep4T2" }
    ]
  },
  {
    id: 5,
    icon: Zap,
    titleKey: "guideStep5Title",
    badgeKey: "guideStep5Badge",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/30",
    content: [
      { headingKey: "guideStep5H1", textKey: "guideStep5T1" },
      { headingKey: "guideStep5H2", textKey: "guideStep5T2" },
      { headingKey: "guideStep5H3", textKey: "guideStep5T3" }
    ]
  },
  {
    id: 6,
    icon: Layers,
    titleKey: "guideStep6Title",
    badgeKey: "guideStep6Badge",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    content: [
      { headingKey: "guideStep6H1", textKey: "guideStep6T1" },
      { headingKey: "guideStep6H2", textKey: "guideStep6T2" },
      { headingKey: "guideStep6H3", textKey: "guideStep6T3" }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

// ============================================================================
// HEADER
// ============================================================================

function Header({ onOpenApp, onViewDocs, user }: { onOpenApp: () => void; onViewDocs: () => void; user: User | null }) {
  const [showAuth, setShowAuth] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass glass-border"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 glow-amber-sm">
              <GitBranch className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              {t('appTitle')}
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onViewDocs}
                variant="outline"
                className="border-gray-700 hover:bg-[#1a1a1a] hover:text-white font-medium"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t('docs')}
              </Button>
            </motion.div>

            {!user && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => setShowAuth(true)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white font-medium"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('signIn')}
                </Button>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onOpenApp}
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold glow-amber-sm"
              >
                {user ? `${t('hiUser')}, ${user.displayName?.split(' ')[0]}` : t('openWebApp')}
              </Button>
            </motion.div>
          </div>
        </nav>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </motion.header>
  )
}

// ============================================================================
// HERO
// ============================================================================

function Hero({ onOpenApp, onViewDocs, user }: { onOpenApp: () => void; onViewDocs: () => void; user: User | null }) {
  const { setLanguage  } = useModStore(useShallow(state => ({ setLanguage: state.setLanguage })));
  const { t, language } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9]"
        >
          <span className="text-white">{t('landingTitle').split(' ').slice(0, 2).join(' ')} </span>
          <span className="text-amber-500 italic block mt-2">{t('landingTitle').split(' ').slice(2).join(' ')}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          {t('landingSubtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-gray-800 flex-wrap justify-center gap-1">
              {(['en', 'es', 'ru', 'de', 'fr', 'pt', 'zh'] as const).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all uppercase ${language === lang ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {!user && (
              <Button 
                onClick={() => loginWithGoogle()}
                variant="outline"
                className="bg-white hover:bg-gray-100 text-black border-none font-bold rounded-full px-6 flex items-center gap-2 shadow-lg shadow-white/5"
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                Google
              </Button>
            )}
            <Button 
              onClick={onOpenApp}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full px-6 shadow-lg shadow-amber-500/20"
            >
              {t('openApp')}
            </Button>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onViewDocs}
              className="border-gray-700 hover:bg-[#1a1a1a] hover:text-white font-medium px-8"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('viewDocumentation')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Visual Editor Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute -inset-1 rounded-2xl animated-border opacity-50 blur-sm pointer-events-none" />
          <div className="relative rounded-2xl glass glass-border p-2 glow-amber">
            <div className="rounded-xl bg-[#0d0d0d] overflow-hidden">
              {/* Mock Editor Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500 font-mono">focus_tree_editor.hoi4</span>
                </div>
              </div>
              
              {/* Mock Node Editor */}
              <div className="relative h-80 sm:h-96 bg-[#0a0a0a] p-6 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                {/* Nodes */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="absolute left-1/2 top-8 -translate-x-1/2"
                >
                  <div className="glass glass-border rounded-lg px-4 py-3 glow-amber-sm">
                    <div className="text-xs font-mono text-amber-500 mb-1">start</div>
                    <div className="text-sm font-medium text-white">National Focus</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  className="absolute left-1/4 top-32 -translate-x-1/2"
                >
                  <div className="glass glass-border rounded-lg px-4 py-3">
                    <div className="text-xs font-mono text-gray-400 mb-1">political</div>
                    <div className="text-sm font-medium text-white">Political Path</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="absolute left-3/4 top-32 -translate-x-1/2"
                >
                  <div className="glass glass-border rounded-lg px-4 py-3">
                    <div className="text-xs font-mono text-gray-400 mb-1">military</div>
                    <div className="text-sm font-medium text-white">Military Path</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  className="absolute left-1/4 top-56 -translate-x-1/2"
                >
                  <div className="glass glass-border rounded-lg px-4 py-3">
                    <div className="text-xs font-mono text-gray-400 mb-1">event</div>
                    <div className="text-sm font-medium text-white">Trigger Event</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                  className="absolute left-3/4 top-56 -translate-x-1/2"
                >
                  <div className="glass glass-border rounded-lg px-4 py-3">
                    <div className="text-xs font-mono text-gray-400 mb-1">bonus</div>
                    <div className="text-sm font-medium text-white">Army Bonus +10%</div>
                  </div>
                </motion.div>

                {/* Connection lines - SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    x1="50%" y1="68" x2="25%" y2="128"
                    stroke="rgba(245, 158, 11, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    x1="50%" y1="68" x2="75%" y2="128"
                    stroke="rgba(245, 158, 11, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    x1="25%" y1="168" x2="25%" y2="224"
                    stroke="rgba(163, 163, 163, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    x1="75%" y1="168" x2="75%" y2="224"
                    stroke="rgba(163, 163, 163, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURES
// ============================================================================

function Features() {
  const { t } = useTranslation();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-gradient">
            {t('powerfulFeatures')}
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            {t('featuresSubtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature: typeof features[0]) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group relative"
            >
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative h-full glass glass-border rounded-2xl p-8 glow-amber-sm hover:glow-amber transition-shadow duration-300">
                {feature.isNew && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/20">
                      <Sparkles size={10} /> {t('newFeatureBadge')}
                    </span>
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-6 group-hover:bg-amber-500/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.titleKey ? t(feature.titleKey) : feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.descKey ? t(feature.descKey) : feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// AUDIENCE
// ============================================================================

function Audience() {
  const { t } = useTranslation();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-gradient">
            {t('builtForEveryone')}
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            {t('builtForEveryoneSub')}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* For Beginners */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative h-full glass glass-border rounded-2xl p-10 glow-amber-sm group-hover:glow-amber transition-shadow duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-6">
                <Sparkles className="h-7 w-7 text-amber-500" />
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  {t('forBeginners')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('visualToolsTitle')}
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{t('visualToolsL1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{t('visualToolsL2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{t('visualToolsL3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{t('visualToolsL4')}</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* For Experts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-gray-500/20 via-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative h-full glass glass-border rounded-2xl p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-800 mb-6">
                <Terminal className="h-7 w-7 text-gray-400" />
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t('forExperts')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('rawScriptTitle')}
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  <span>{t('rawScriptL1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  <span>{t('rawScriptL2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  <span>{t('rawScriptL3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  <span>{t('rawScriptL4')}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// DOCUMENTATION / USER GUIDE
// ============================================================================

function Documentation({ docRef }: { docRef: React.RefObject<HTMLElement | null> }) {
  const [openStep, setOpenStep] = useState<number | null>(1);
  const { t } = useTranslation();

  return (
    <section ref={docRef} className="relative py-32 overflow-hidden" id="documentation">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
            <BookOpen size={14} /> {t('userGuide')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-gradient">
            {t('howToUse')}
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            {t('howToUseSub')}
          </p>
        </motion.div>

        <div className="space-y-4">
          {guideSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass glass-border rounded-2xl overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 flex-shrink-0">
                    <step.icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="font-semibold text-white text-base">{t(step.titleKey)}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${step.badgeColor}`}>
                        {t(step.badgeKey)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{step.content.length} {step.content.length > 1 ? t('sections') : t('section')}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openStep === step.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
              </button>

              {/* Accordion Body */}
              <AnimatePresence initial={false}>
                {openStep === step.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-gray-800/60 pt-4 space-y-5">
                      {step.content.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-200 mb-1">{t(item.headingKey)}</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{t(item.textKey)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CHANGELOG FEED
// ============================================================================

type ChangeType = 'feature' | 'fix' | 'content' | 'improvement';

interface ChangelogEntry {
  id: string;
  title: string;
  date: string;
  type: ChangeType;
  description: string;
  tags?: string[];
}

const CHANGE_META: Record<ChangeType, { label: string; icon: React.ReactNode; color: string; dot: string }> = {
  feature:     { label: 'New Feature',  icon: <Star size={11} />,    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',   dot: 'bg-amber-400' },
  fix:         { label: 'Bug Fix',      icon: <Wrench size={11} />,  color: 'text-red-400 bg-red-500/10 border-red-500/30',         dot: 'bg-red-400' },
  content:     { label: 'New Content',  icon: <Package size={11} />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-400' },
  improvement: { label: 'Improvement', icon: <Shield size={11} />,  color: 'text-green-400 bg-green-500/10 border-green-500/30',   dot: 'bg-green-400' },
};

const LOCAL_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'cl10', title: 'Global Outreach & Community Growth', date: 'April 21, 2026', type: 'improvement',
    description: 'We have launched a global community awareness initiative. HOI4 Mod Studio is now reaching thousands of new modders through our latest marketing campaign.',
    tags: ['Community', 'Growth', 'Global'],
  },
  {
    id: 'cl9', title: 'Global Update: 7 Languages & Dev Tracker', date: 'April 20, 2026', type: 'feature',
    description: 'We have added full translation support for 7 languages and a built-in Dev Tracker to keep you updated on our progress and future roadmap.',
    tags: ['Localization', 'Roadmap', 'UX'],
  },
  {
    id: 'cl8', title: 'Firebase Cloud Save & Community Hub', date: 'April 19, 2026', type: 'feature',
    description: 'Save your projects to Firestore with one click. Login with Google and your work persists across all your devices. Community Hub lets you share and import templates.',
    tags: ['Firebase', 'Cloud', 'Collaboration'],
  },
  {
    id: 'cl7', title: 'Monarchy Editor — Road to 56', date: 'April 19, 2026', type: 'content',
    description: 'Full royal house system for R56. Configure 4 monarchy forms, add pretenders with portraits, set claim strengths and generate restoration decisions + country events.',
    tags: ['Road to 56', 'Monarchy'],
  },
  {
    id: 'cl6', title: 'TNO Variable & Ideology Path Editors', date: 'April 19, 2026', type: 'content',
    description: 'Two new TNO-exclusive tools: a spreadsheet-style variable editor with 16 autocomplete suggestions, and an ideology path builder with visual flow diagrams.',
    tags: ['TNO', 'Variables', 'Ideology'],
  },
  {
    id: 'cl5', title: 'Kaiserreich Tools — Civil Wars & Parties', date: 'April 19, 2026', type: 'content',
    description: 'Political Party Editor with popularity spectrum and portrait uploads. Civil Conflict Editor with 4 war types, Monaco scripting and full start_civil_war output.',
    tags: ['Kaiserreich', 'Civil War', 'Parties'],
  },
  {
    id: 'cl4', title: 'Tech Tree Editor (Universal Canvas)', date: 'April 18, 2026', type: 'feature',
    description: 'ReactFlow-powered canvas for building technology trees. Create nodes, connect prerequisites with edges, and edit research_bonus via Monaco sidebar.',
    tags: ['Tech Tree', 'Universal', 'Canvas'],
  },
  {
    id: 'cl3', title: 'Millennium Dawn — Economy & Missile Editors', date: 'April 18, 2026', type: 'content',
    description: 'Economy Editor with GDP/tax/debt KPIs and scripted_effect export. Missile Editor with automatic SRBM/MRBM/ICBM classification, silo management and nuclear yields.',
    tags: ['Millennium Dawn', 'Economy', 'Military'],
  },
  {
    id: 'cl2', title: 'Focus Tree — Monaco Editor Integration', date: 'April 17, 2026', type: 'improvement',
    description: 'Available, Bypass and Completion Reward fields in Focus Tree nodes now use Monaco Editor with full Clausewitz syntax. Interactive canvas supports node drag & connect.',
    tags: ['Focus Tree', 'Monaco'],
  },
  {
    id: 'cl1', title: 'HOI4 Mod Studio v1.0 — Initial Launch', date: 'April 17, 2026', type: 'feature',
    description: 'First public release. Visual focus tree builder, event creator with live preview, leader creator, national spirits, decisions editor, localization manager and Clausewitz script export.',
    tags: ['Launch', 'Core'],
  },
];

function ChangelogFeed() {
  const [entries, setEntries] = useState<ChangelogEntry[]>(LOCAL_CHANGELOG);
  const [expanded, setExpanded] = useState<string | null>('cl8');
  const { t } = useTranslation();

  useEffect(() => {
    fetchChangelog(15)
      .then(data => {
        if (data.length > 0) setEntries(data as ChangelogEntry[]);
      })
      .catch(() => {}); // silently fallback to local data
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
            <Rss size={13} /> {t('changelogBadge')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient">
            {t('whatsNewTitle')}
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            {t('whatsNewSub')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-gray-700/50 to-transparent" />

          <div className="space-y-4">
            {entries.map((entry, i) => {
              const meta = CHANGE_META[entry.type];
              const isOpen = expanded === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                  className="relative pl-16"
                >
                  {/* Dot on timeline */}
                  <div className={`absolute left-[22px] top-5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${meta.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />

                  <button
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    className="w-full text-left group"
                  >
                    <div className={`glass glass-border rounded-xl px-5 py-4 transition-all duration-200 ${
                      isOpen ? 'border-amber-500/20 bg-amber-500/3' : 'hover:border-gray-700 hover:bg-white/3'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>
                              {meta.icon} {meta.label}
                            </span>
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <CheckCircle2 size={9} className="text-gray-700" /> {entry.date}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {entry.title}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 mt-1"
                        >
                          <ChevronDown size={15} className="text-gray-600" />
                        </motion.div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-gray-400 leading-relaxed mt-3 border-t border-gray-800 pt-3">
                              {entry.description}
                            </p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {entry.tags.map(tag => (
                                  <span key={tag} className="text-[9px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t border-gray-800/50">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <GitBranch className="h-4 w-4 text-amber-500" />
            </div>
            <span className="font-semibold text-white">{t('appTitle')}</span>
          </div>

          <div className="flex items-center gap-6">
            <motion.a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="sr-only">Discord</span>
            </motion.a>
            
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">GitHub</span>
            </motion.a>
          </div>

          <p className="text-sm text-gray-500">
            {t('footerCopyrightPrefix')} {new Date().getFullYear()} {t('footerCopyrightSuffix')}
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LandingPage({ onOpenApp }: { onOpenApp: () => void }) {
  const [showModSelector, setShowModSelector] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { setBaseMod  } = useModStore(useShallow(state => ({ setBaseMod: state.setBaseMod })));
  const docRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    return onAuthChange(u => setUser(u));
  }, []);

  const scrollToDocs = () => {
    docRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartModding = () => {
    setShowModSelector(true);
  };

  const handleSelectMod = (mod: BaseModType) => {
    setBaseMod(mod);
    setShowModSelector(false);
    onOpenApp();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans relative">
      <Header onOpenApp={handleStartModding} onViewDocs={scrollToDocs} user={user} />
      <Hero onOpenApp={handleStartModding} onViewDocs={scrollToDocs} user={user} />
      <Features />
      <Audience />
      <Documentation docRef={docRef} />
      <ChangelogFeed />
      <Footer />

      {/* Mod Selector Modal */}
      {showModSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
              <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                <Globe size={18} className="text-amber-500" />
                {t('selectBaseModTitle')}
              </h2>
              <button onClick={() => setShowModSelector(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-400 mb-6">
                {t('selectBaseModDesc')}
              </p>

              <button 
                onClick={() => handleSelectMod('vanilla')}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-amber-500 bg-[#111] hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="font-semibold text-white group-hover:text-amber-500">{t('vanillaTitle')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('vanillaDesc')}</div>
              </button>

              <button 
                onClick={() => handleSelectMod('millennium_dawn')}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-amber-500 bg-[#111] hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="font-semibold text-white group-hover:text-amber-500 flex items-center gap-2">
                  {t('mdTitle')} <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded border border-amber-500/30">{t('badgePopular')}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t('mdDesc')}</div>
              </button>

              <button 
                onClick={() => handleSelectMod('kaiserreich')}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-amber-500 bg-[#111] hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="font-semibold text-white group-hover:text-amber-500 flex items-center gap-2">
                  {t('krTitle')} <span className="text-[10px] px-1.5 py-0.5 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30">{t('badgeAltHistory')}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t('krDesc')}</div>
              </button>

              <button 
                onClick={() => handleSelectMod('tno')}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-amber-500 bg-[#111] hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="font-semibold text-white group-hover:text-amber-500 flex items-center gap-2">
                  {t('tnoTitle')} <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded border border-red-500/30">{t('badgeNarrative')}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t('tnoDesc')}</div>
              </button>

              <button 
                onClick={() => handleSelectMod('road_to_56')}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-amber-500 bg-[#111] hover:bg-[#1a1a1a] transition-all group"
              >
                <div className="font-semibold text-white group-hover:text-amber-500">{t('r56Title')}</div>
                <div className="text-xs text-gray-500 mt-1">{t('r56Desc')}</div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
