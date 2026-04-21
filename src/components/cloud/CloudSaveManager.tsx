import { useState, useEffect, useCallback } from 'react';
import { type User } from 'firebase/auth';
import {
  logout,
  onAuthChange,
  saveProjectToCloud,
  loadProjectFromCloud,
} from '../../services/firebase';
import { useModStore } from '../../store/useModStore';
import {
  Cloud, LogIn, LogOut, Save, CheckCircle2, AlertCircle,
  Loader2, User as UserIcon, RefreshCw
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

type SyncStatus = 'idle' | 'saving' | 'loading' | 'saved' | 'error';

export default function CloudSaveManager() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const modStore = useModStore();

  const getStatusIcon = () => {
    if (status === 'saving' || status === 'loading') return <Loader2 size={14} className="animate-spin text-mod-accent" />;
    if (status === 'saved') return <CheckCircle2 size={14} className="text-green-400" />;
    if (status === 'error') return <AlertCircle size={14} className="text-red-400" />;
    return <Cloud size={14} className="text-gray-500" />;
  };

  const loadFromCloud = useCallback(async () => {
    if (!user) return;
    setSyncStatus('loading');
    setErrorMsg('');
    try {
      const data = await loadProjectFromCloud(user.uid);
      if (!data) {
        setErrorMsg('No cloud save found for your account.');
        setSyncStatus('error');
        return;
      }
      if (data.baseMod) modStore.setBaseMod(data.baseMod as Parameters<typeof modStore.setBaseMod>[0]);
      if (data.nodes) modStore.setNodes(data.nodes as Parameters<typeof modStore.setNodes>[0]);
      if (data.edges) modStore.setEdges(data.edges as Parameters<typeof modStore.setEdges>[0]);
      if (data.events) modStore.setEvents(data.events as Parameters<typeof modStore.setEvents>[0]);
      if (data.leaders) modStore.setLeaders(data.leaders as Parameters<typeof modStore.setLeaders>[0]);
      if (data.spirits) modStore.setSpirits(data.spirits as Parameters<typeof modStore.setSpirits>[0]);
      if (data.decisionCategories) modStore.setDecisionCategories(data.decisionCategories as Parameters<typeof modStore.setDecisionCategories>[0]);
      if (data.localizations) modStore.setLocalizations(data.localizations as Parameters<typeof modStore.setLocalizations>[0]);
      
      // Load specialized tools
      if (data.economyConfig) modStore.setEconomyConfig(data.economyConfig as Parameters<typeof modStore.setEconomyConfig>[0]);
      if (data.missiles) modStore.setMissiles(data.missiles as Parameters<typeof modStore.setMissiles>[0]);
      if (data.techNodes) modStore.setTechNodes(data.techNodes as Parameters<typeof modStore.setTechNodes>[0]);
      if (data.techEdges) modStore.setTechEdges(data.techEdges as Parameters<typeof modStore.setTechEdges>[0]);
      if (data.politicalParties) modStore.setPoliticalParties(data.politicalParties as Parameters<typeof modStore.setPoliticalParties>[0]);
      if (data.civilConflicts) modStore.setCivilConflicts(data.civilConflicts as Parameters<typeof modStore.setCivilConflicts>[0]);
      if (data.monarchyConfig) modStore.setMonarchyConfig(data.monarchyConfig as Parameters<typeof modStore.setMonarchyConfig>[0]);
      if (data.tnoVariables) modStore.setTnoVariables(data.tnoVariables as Parameters<typeof modStore.setTnoVariables>[0]);
      if (data.tnoPaths) modStore.setTnoPaths(data.tnoPaths as Parameters<typeof modStore.setTnoPaths>[0]);

      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setErrorMsg('Load failed. Check your connection.');
      setSyncStatus('error');
    }
  }, [user, modStore]);

  const saveToCloud = useCallback(async () => {
    if (!user) return;
    setSyncStatus('saving');
    setErrorMsg('');
    try {
      const snapshot = {
        baseMod: modStore.baseMod,
        nodes: modStore.nodes,
        edges: modStore.edges,
        events: modStore.events,
        leaders: modStore.leaders,
        spirits: modStore.spirits,
        decisionCategories: modStore.decisionCategories,
        localizations: modStore.localizations,
        // Specialized tools
        economyConfig: modStore.economyConfig,
        missiles: modStore.missiles,
        techNodes: modStore.techNodes,
        techEdges: modStore.techEdges,
        politicalParties: modStore.politicalParties,
        civilConflicts: modStore.civilConflicts,
        monarchyConfig: modStore.monarchyConfig,
        tnoVariables: modStore.tnoVariables,
        tnoPaths: modStore.tnoPaths,
      };
      await saveProjectToCloud(user.uid, snapshot as Record<string, unknown>);
      setLastSaved(new Date());
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setErrorMsg('Save failed. Check your connection.');
      setSyncStatus('error');
    }
  }, [user, modStore]);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u);
      setAuthLoading(false);
      // Auto-load if it's a new login and local store is mostly empty
      if (u && modStore.nodes.length <= 1 && modStore.events.length <= 1) {
        loadFromCloud();
      }
    });
    return unsub;
  }, [loadFromCloud, modStore.nodes.length, modStore.events.length]); 


  const handleLogout = async () => {
    await logout();
    setSyncStatus('idle');
    setLastSaved(null);
  };


  // ─── Not logged in ───────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        <Loader2 size={14} className="animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 text-xs bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 hover:border-mod-primary/50 text-gray-300 hover:text-mod-accent px-3 py-1.5 rounded-lg transition-all"
        >
          <LogIn size={13} className="text-mod-primary" />
          <span>Sign in with Account</span>
        </button>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  // ─── Logged in ───────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center gap-2">
      {/* Status badge */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {getStatusIcon()}
        {status === 'saving' && <span>Saving...</span>}
        {status === 'loading' && <span>Loading...</span>}
        {status === 'saved' && <span className="text-green-400">Synced!</span>}
        {status === 'error' && <span className="text-red-400 max-w-32 truncate">{errorMsg}</span>}
        {status === 'idle' && lastSaved && (
          <span className="text-gray-600">
            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={saveToCloud}
        disabled={status === 'saving'}
        title="Save to Cloud"
        className="flex items-center gap-1.5 text-xs bg-mod-primary/10 hover:bg-mod-primary/20 text-mod-accent border border-mod-primary/30 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
      >
        <Save size={12} />
        <span>Save ☁️</span>
      </button>

      {/* Load button */}
      <button
        onClick={loadFromCloud}
        disabled={status === 'loading'}
        title="Load from Cloud"
        className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-gray-200 border border-gray-700 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
      >
        <RefreshCw size={12} />
      </button>

      {/* User avatar + logout */}
      <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg px-2 py-1">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
        ) : (
          <UserIcon size={14} className="text-gray-500" />
        )}
        <span className="text-xs text-gray-400 max-w-20 truncate">{user.displayName?.split(' ')[0] ?? 'User'}</span>
        <button onClick={handleLogout} title="Sign out" className="text-gray-600 hover:text-red-400 transition-colors ml-1">
          <LogOut size={11} />
        </button>
      </div>
    </div>
  );
}
