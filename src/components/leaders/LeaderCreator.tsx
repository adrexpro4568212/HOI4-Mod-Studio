import React, { useRef, useState } from 'react';
import { useModStore } from '../../store/useModStore';
import { Plus, Trash2, Upload, User, Shield, Award, Loader2 } from 'lucide-react';
import { modDictionaries } from '../../data/modDictionaries';
import { auth, uploadPortrait } from '../../services/firebase';

export default function LeaderCreator() {
  const { 
    baseMod,
    leaders, 
    activeLeaderIndex, 
    setActiveLeaderIndex, 
    addLeader, 
    deleteLeader, 
    updateActiveLeader,
    toggleTraitForActiveLeader
  } = useModStore();

  const currentDict = modDictionaries[baseMod];
  const ideologies = currentDict.ideologies;
  const availableTraits = currentDict.leaderTraits;

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeLeader = leaders[activeLeaderIndex];

  if (!activeLeader) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (user) {
      // Cloud Upload
      setUploading(true);
      try {
        const url = await uploadPortrait(user.uid, file, file.name);
        updateActiveLeader({ picture: url });
      } catch (e) {
        console.error("Cloud upload failed, falling back to local", e);
        // Fallback to base64 if cloud fails
        const reader = new FileReader();
        reader.onloadend = () => {
          updateActiveLeader({ picture: reader.result as string });
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    } else {
      // Local fallback (Base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        updateActiveLeader({ picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full bg-[#121212] text-gray-200">
      {/* Left Sidebar - Leaders List */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="font-bold text-sm tracking-wider uppercase text-gray-400">Commanders</h2>
          <button 
            onClick={addLeader}
            className="p-1 hover:bg-gray-700 rounded text-amber-500 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {leaders.map((leader, idx) => (
            <div 
              key={leader.id}
              onClick={() => setActiveLeaderIndex(idx)}
              className={`p-3 rounded cursor-pointer flex justify-between items-center transition-all group ${
                activeLeaderIndex === idx 
                  ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-l-2 border-amber-500' 
                  : 'hover:bg-[#2a2a2a] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <User size={16} className={activeLeaderIndex === idx ? 'text-amber-500' : 'text-gray-500'} />
                <span className="truncate text-sm font-medium">{leader.name || 'Unnamed Leader'}</span>
              </div>
              {leaders.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLeader(idx);
                  }}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white">Character Builder</h1>
            <p className="text-gray-400 mt-1">Design and customize military commanders and political leaders.</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Portrait Upload Section */}
            <div className="col-span-1 space-y-4">
              <div className="bg-[#1c1b1b] rounded-lg p-4 shadow-lg border border-gray-800/50">
                <div className="aspect-[3/4] bg-[#0a0a0a] rounded overflow-hidden relative group border border-gray-800">
                  {activeLeader.picture ? (
                    <img src={activeLeader.picture} alt="Portrait" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                      <User size={48} className="mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-wider">No Portrait</span>
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    {!auth.currentUser && (
                       <p className="text-[10px] text-amber-400/80 px-4 text-center">Sign in for cloud storage</p>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">Recommended size: 156x210px</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="col-span-2 space-y-6">
              <div className="bg-[#1c1b1b] p-6 rounded-lg shadow-lg border border-gray-800/50 space-y-6">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Character Name</label>
                  <input 
                    type="text" 
                    value={activeLeader.name}
                    onChange={(e) => updateActiveLeader({ name: e.target.value })}
                    className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors"
                    placeholder="e.g. Erwin Rommel"
                  />
                </div>

                {/* Ideology */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Shield size={14} /> Ideology Focus
                  </label>
                  <select 
                    value={activeLeader.ideology}
                    onChange={(e) => updateActiveLeader({ ideology: e.target.value })}
                    className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 cursor-pointer"
                  >
                    {ideologies.map(ideology => (
                      <option key={ideology.id} value={ideology.id}>{ideology.name}</option>
                    ))}
                  </select>
                </div>

                {/* Traits */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award size={14} /> Assigned Traits
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTraits.map(trait => {
                      const isActive = activeLeader.traits.some(t => t.id === trait.id);
                      return (
                        <button
                          key={trait.id}
                          onClick={() => toggleTraitForActiveLeader(trait)}
                          className={`flex items-center gap-3 p-3 rounded text-left transition-all ${
                            isActive 
                              ? 'bg-[#2a2a2a] border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                              : 'bg-[#0a0a0a] border border-transparent hover:bg-[#1a1a1a]'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-gray-600'}`} />
                          <span className={`text-sm ${isActive ? 'text-amber-400 font-medium' : 'text-gray-400'}`}>
                            {trait.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
