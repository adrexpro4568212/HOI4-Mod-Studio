import { useState, useEffect, useCallback } from 'react';
import { useModStore } from '../../store/useModStore';
import {
  fetchCommunityTemplates,
  shareAsTemplate,
} from '../../services/firebase';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import {
  Globe, Search, Upload, Download, Heart, Clock, Tag, Filter,
  Star, AlertCircle, Loader2, PackageOpen, CheckCircle2, X, Crown, Shield, Zap, BookOpen
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorUid: string;
  baseMod: string;
  category: TemplateCategory;
  tags: string[];
  likes: number;
  downloads: number;
  createdAt: { seconds: number } | null;
  // Payload
  nodes?: unknown[];
  edges?: unknown[];
  events?: unknown[];
  spirits?: unknown[];
  decisionCategories?: unknown[];
}

type TemplateCategory = 'focus_tree' | 'events' | 'spirits' | 'decisions' | 'full_nation';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_MOD_OPTIONS = [
  { id: 'all', label: 'All Mods', color: 'text-gray-400' },
  { id: 'vanilla', label: 'Vanilla', color: 'text-gray-300' },
  { id: 'millennium_dawn', label: 'Millennium Dawn', color: 'text-blue-400' },
  { id: 'kaiserreich', label: 'Kaiserreich', color: 'text-amber-400' },
  { id: 'tno', label: 'The New Order', color: 'text-purple-400' },
  { id: 'road_to_56', label: 'Road to 56', color: 'text-green-400' },
];

const CATEGORY_META: Record<TemplateCategory, { label: string; icon: React.ReactNode; color: string }> = {
  focus_tree: { label: 'Focus Tree', icon: <Zap size={11} />, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  events: { label: 'Events', icon: <BookOpen size={11} />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  spirits: { label: 'Nat. Spirits', icon: <Shield size={11} />, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  decisions: { label: 'Decisions', icon: <Star size={11} />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  full_nation: { label: 'Full Nation', icon: <Crown size={11} />, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
};

// ─── Seed data for demo (shown when Firestore is empty / loading) ─────────────

const DEMO_TEMPLATES: CommunityTemplate[] = [
  {
    id: 'd1', title: 'German Empire Focus Tree', description: 'Complete focus tree for a restored German Empire. Includes 42 focuses with branching paths for military, industry and diplomacy.', authorName: 'Kaiser_Modder', authorUid: 'demo1', baseMod: 'kaiserreich', category: 'focus_tree', tags: ['germany', 'monarchy', 'kaiserreich'], likes: 312, downloads: 1540, createdAt: null, nodes: [], edges: [],
  },
  {
    id: 'd2', title: 'Cold War Events Pack', description: '20 immersive Cold War country events for Millennium Dawn. Covers proxy wars, espionage, arms races and diplomatic crises.', authorName: 'MDModTeam', authorUid: 'demo2', baseMod: 'millennium_dawn', category: 'events', tags: ['cold war', 'md', 'events'], likes: 187, downloads: 892, createdAt: null, events: [],
  },
  {
    id: 'd3', title: 'Soviet National Spirits', description: '8 national spirits for the Soviet Union covering industrialization, purges, and military doctrine for vanilla HOI4.', authorName: 'RedArmyMod', authorUid: 'demo3', baseMod: 'vanilla', category: 'spirits', tags: ['soviet', 'ussr', 'spirits'], likes: 256, downloads: 2100, createdAt: null, spirits: [],
  },
  {
    id: 'd4', title: 'TNO Russia Full Nation', description: 'Full nation template for Russian warlord states in TNO. Includes variables, ideology paths, events and focus tree skeleton.', authorName: 'TNO_Builder', authorUid: 'demo4', baseMod: 'tno', category: 'full_nation', tags: ['russia', 'warlords', 'tno'], likes: 423, downloads: 3200, createdAt: null,
  },
  {
    id: 'd5', title: 'R56 Monarchy Restoration Decisions', description: '6 decisions for restoring various European monarchies in Road to 56. Includes event chains and stability effects.', authorName: 'CrownRestorer', authorUid: 'demo5', baseMod: 'road_to_56', category: 'decisions', tags: ['monarchy', 'r56', 'decisions'], likes: 98, downloads: 445, createdAt: null,
  },
  {
    id: 'd6', title: 'Japan Industrial Focus Tree', description: 'Detailed industrial branch focus tree for Japan. 18 focuses covering zaibatsu, naval production and air supremacy.', authorName: 'NipponModder', authorUid: 'demo6', baseMod: 'vanilla', category: 'focus_tree', tags: ['japan', 'industry', 'vanilla'], likes: 192, downloads: 880, createdAt: null,
  },
];

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ user, onClose, onShared }: { user: User; onClose: () => void; onShared: () => void }) {
  const modStore = useModStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('focus_tree');
  const [tags, setTags] = useState('');
  const [sharing, setSharing] = useState(false);
  const [done, setDone] = useState(false);

  const handleShare = async () => {
    if (!title.trim()) return;
    setSharing(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category,
        baseMod: modStore.baseMod,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        likes: 0,
        downloads: 0,
      };
      if (category === 'focus_tree' || category === 'full_nation') {
        payload.nodes = modStore.nodes;
        payload.edges = modStore.edges;
      }
      if (category === 'events' || category === 'full_nation') payload.events = modStore.events;
      if (category === 'spirits' || category === 'full_nation') payload.spirits = modStore.spirits;
      if (category === 'decisions' || category === 'full_nation') payload.decisionCategories = modStore.decisionCategories;

      await shareAsTemplate(user.uid, user.displayName ?? 'Anonymous', payload);
      setDone(true);
      setTimeout(() => { onShared(); onClose(); }, 1500);
    } catch {
      setSharing(false);
    }
  };

  const inp = "bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-full";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">Share Template</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 size={40} className="text-green-400" />
              <p className="text-white font-semibold">Template Published!</p>
              <p className="text-gray-500 text-sm text-center">Your template is now available in the Community Hub.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inp} placeholder="e.g. German Empire Focus Tree" maxLength={60} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inp} resize-none`} rows={3} placeholder="What does this template include?" maxLength={200} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(CATEGORY_META) as TemplateCategory[]).map(cat => {
                    const m = CATEGORY_META[cat];
                    return (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all ${category === cat ? m.color : 'border-gray-700 text-gray-600 hover:text-gray-400 hover:border-gray-600'}`}>
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inp} placeholder="germany, monarchy, vanilla..." />
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-lg p-3 text-xs text-gray-500">
                📦 Will include: <span className="text-gray-300">
                  {category === 'focus_tree' ? 'Focus Tree nodes & edges' :
                   category === 'events' ? 'All events' :
                   category === 'spirits' ? 'National Spirits' :
                   category === 'decisions' ? 'Decision categories' :
                   'Full nation data (focus tree, events, spirits, decisions)'}
                </span> from your current project.
                <br />🌍 Base mod: <span className="text-amber-400">{BASE_MOD_OPTIONS.find(b => b.id === modStore.baseMod)?.label}</span>
              </div>
              <button onClick={handleShare} disabled={!title.trim() || sharing}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm">
                {sharing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {sharing ? 'Publishing...' : 'Publish Template'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ tpl, onImport }: { tpl: CommunityTemplate; onImport: (t: CommunityTemplate) => void }) {
  const catMeta = CATEGORY_META[tpl.category];
  const modMeta = BASE_MOD_OPTIONS.find(b => b.id === tpl.baseMod);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 600)); // brief visual feedback
    onImport(tpl);
    setImporting(false);
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-700 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">{tpl.title}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">by {tpl.authorName}</p>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold flex-shrink-0 ${catMeta.color}`}>
          {catMeta.icon} {catMeta.label}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tpl.description}</p>

      {/* Tags */}
      {tpl.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tpl.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-800">
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
          <span className={`font-semibold ${modMeta?.color ?? 'text-gray-500'}`}>{modMeta?.label ?? tpl.baseMod}</span>
          <span className="flex items-center gap-0.5"><Heart size={9} /> {tpl.likes.toLocaleString()}</span>
          <span className="flex items-center gap-0.5"><Download size={9} /> {tpl.downloads.toLocaleString()}</span>
        </div>
        <button onClick={handleImport} disabled={importing}
          className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {importing ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
          {importing ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunityHub() {
  const modStore = useModStore();
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<CommunityTemplate[]>(DEMO_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modFilter, setModFilter] = useState('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'likes' | 'recent'>('downloads');
  const [showShareModal, setShowShareModal] = useState(false);
  const [importedId, setImportedId] = useState<string | null>(null);
  const [importError, setImportError] = useState('');

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Fetch templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityTemplates(40);
      if (data.length > 0) {
        setTemplates(data as CommunityTemplate[]);
      } else {
        setTemplates(DEMO_TEMPLATES); // fallback to demo if empty
      }
    } catch {
      setTemplates(DEMO_TEMPLATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadTemplates]);

  // Import handler
  const handleImport = useCallback((tpl: CommunityTemplate) => {
    setImportError('');
    try {
      if (tpl.nodes && Array.isArray(tpl.nodes)) modStore.setNodes(tpl.nodes as Parameters<typeof modStore.setNodes>[0]);
      if (tpl.edges && Array.isArray(tpl.edges)) modStore.setEdges(tpl.edges as Parameters<typeof modStore.setEdges>[0]);
      setImportedId(tpl.id);
      setTimeout(() => setImportedId(null), 3000);
    } catch {
      setImportError('Import failed. Template may have incompatible data.');
    }
  }, [modStore]);

  // Filter & sort
  const filtered = templates
    .filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.includes(search.toLowerCase()));
      const matchMod = modFilter === 'all' || t.baseMod === modFilter;
      const matchCat = catFilter === 'all' || t.category === catFilter;
      return matchSearch && matchMod && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'likes') return b.likes - a.likes;
      const ta = a.createdAt?.seconds ?? 0;
      const tb = b.createdAt?.seconds ?? 0;
      return tb - ta;
    });

  return (
    <div className="w-full h-full flex flex-col bg-[#121212] overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-[#161616]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Globe size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Community Hub</h2>
              <p className="text-xs text-gray-500">{templates.length} templates · shared by the community</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {importedId && (
              <div className="flex items-center gap-1.5 text-xs text-green-400 animate-pulse">
                <CheckCircle2 size={13} /> Imported!
              </div>
            )}
            {importError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={13} /> {importError}
              </div>
            )}
            {user ? (
              <button onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 text-sm bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Upload size={14} /> Share Template
              </button>
            ) : (
              <p className="text-xs text-gray-600 italic">Sign in to share templates</p>
            )}
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="Search templates, tags..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none" />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-gray-800 rounded-lg p-1">
            {(['downloads', 'likes', 'recent'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${sortBy === s ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>
                {s === 'downloads' ? '⬇ Downloads' : s === 'likes' ? '❤ Likes' : '🕒 Recent'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sidebar + Grid ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar filters */}
        <div className="w-48 border-r border-gray-800 bg-[#161616] flex-shrink-0 overflow-y-auto p-3 flex flex-col gap-4">
          {/* Mod filter */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <Filter size={10} /> Base Mod
            </p>
            <div className="flex flex-col gap-0.5">
              {BASE_MOD_OPTIONS.map(m => (
                <button key={m.id} onClick={() => setModFilter(m.id)}
                  className={`text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${modFilter === m.id ? `bg-amber-500/10 ${m.color} font-bold` : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <Tag size={10} /> Category
            </p>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setCatFilter('all')}
                className={`text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${catFilter === 'all' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}>
                All Categories
              </button>
              {(Object.entries(CATEGORY_META) as [TemplateCategory, typeof CATEGORY_META[TemplateCategory]][]).map(([id, meta]) => (
                <button key={id} onClick={() => setCatFilter(id)}
                  className={`text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${catFilter === id ? `${meta.color} bg-opacity-10` : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}>
                  {meta.icon} {meta.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading community templates...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <PackageOpen size={48} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm font-medium">No templates found</p>
              <p className="text-gray-700 text-xs mt-1">Try different filters or be the first to share!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-600">{filtered.length} template{filtered.length !== 1 ? 's' : ''} found</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Clock size={11} />
                  <span>Demo data — sign in & share to add real templates</span>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                {filtered.map(tpl => (
                  <TemplateCard key={tpl.id} tpl={tpl} onImport={handleImport} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && user && (
        <ShareModal
          user={user}
          onClose={() => setShowShareModal(false)}
          onShared={loadTemplates}
        />
      )}
    </div>
  );
}
