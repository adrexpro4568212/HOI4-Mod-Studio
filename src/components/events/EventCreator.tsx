import { useMemo, useRef, useState, useEffect } from 'react';
import { serializeClausewitz } from '../../utils/clausewitz';
import type { ClausewitzObject } from '../../utils/clausewitz';
import { Image as ImageIcon, Plus, Trash2, Code2, ChevronLeft, ChevronRight, Settings, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import Editor from '@monaco-editor/react';
import { auth, uploadPortrait } from '../../services/firebase';

export default function EventCreator() {
  const { 
    events, 
    activeEventIndex, 
    setActiveEventIndex, 
    addEvent, 
    deleteEvent, 
    updateActiveEvent, 
    addOptionToActiveEvent, 
    updateOptionInActiveEvent, 
    removeOptionFromActiveEvent,
    setActiveAITarget
  } = useModStore();

  const activeEvent = events[activeEventIndex] || events[0];
  const { id: eventId, title, desc, picture, isTriggeredOnly, fireOnlyOnce, hidden, mtth, trigger, immediate, options } = activeEvent;

  useEffect(() => {
    if (eventId) {
      setActiveAITarget({ type: 'event', id: eventId });
    }
    return () => {
      setActiveAITarget({ type: 'none', id: null });
    };
  }, [eventId, setActiveAITarget]);

  // ── AI Suggestion Dispatcher ──────────────────────────────
  const handleAISuggest = (field: string, currentVal: string) => {
    const taskMap: Record<string, 'narrative' | 'scripting'> = {
      title: 'narrative',
      desc: 'narrative',
      trigger: 'scripting',
      immediate: 'scripting',
      option: 'scripting'
    };

    const promptMap: Record<string, string> = {
      title: `Generate a catchy HOI4 event title for an event about: ${currentVal || 'a political crisis'}`,
      desc: `Write a historical or narrative description for a HOI4 event with the title: "${title}". Use a serious tone.`,
      trigger: `Generate a Clausewitz script trigger for an event that should happen when: ${currentVal || 'the country is at war'}`,
      immediate: `Generate an immediate Clausewitz effect block for: ${currentVal || 'notifying other countries'}`,
      option: `Generate a Clausewitz effect script for an event option named "${currentVal}".`
    };

    window.dispatchEvent(new CustomEvent('ai-suggest', { 
      detail: { 
        prompt: promptMap[field] || `Help me with this: ${currentVal}`,
        autoSend: true,
        task: taskMap[field] || 'narrative'
      } 
    }));
  };
  // ─────────────────────────────────────────────────────────

  // ── Image picker ──────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determines if `picture` is a base64 data URL or a GFX key
  const isBase64 = picture.startsWith('data:image');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (user) {
      setUploading(true);
      try {
        const url = await uploadPortrait(user.uid, file, file.name);
        updateActiveEvent({ picture: url });
      } catch (e) {
        console.error("Cloud upload failed", e);
        const reader = new FileReader();
        reader.onload = () => {
          updateActiveEvent({ picture: reader.result as string });
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        updateActiveEvent({ picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    
    e.target.value = '';
  };

  const clearImage = () => updateActiveEvent({ picture: 'GFX_report_event_001' });
  // ─────────────────────────────────────────────────────────

  const generatedCode = useMemo(() => {
    const formattedOptions = options.map(opt => ({
      name: `"${opt.name}"`,
      __raw_inject: { __raw: opt.effect }
    }));

    const eventData: { country_event: Record<string, unknown> } = {
      country_event: {
        id: eventId,
        title: title,
        desc: desc,
        picture: picture,
        is_triggered_only: isTriggeredOnly,
      }
    };

    if (hidden) eventData.country_event.hidden = true;
    if (fireOnlyOnce) eventData.country_event.fire_only_once = true;
    if (!isTriggeredOnly && mtth) eventData.country_event.mean_time_to_happen = { days: mtth };
    if (trigger) eventData.country_event.trigger = { __raw_inject: { __raw: trigger } };
    if (immediate) eventData.country_event.immediate = { __raw_inject: { __raw: immediate } };

    if (formattedOptions.length > 0) {
      eventData.country_event.option = formattedOptions;
    }
    
    return serializeClausewitz(eventData as unknown as ClausewitzObject);
  }, [eventId, title, desc, picture, isTriggeredOnly, fireOnlyOnce, hidden, mtth, trigger, immediate, options]);


  return (
    <div className="w-full h-full flex bg-[#121212]">
      {/* Editor Form */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-gray-200">Creador de Eventos</h2>
             
             {/* Multi-event selector */}
             <div className="flex items-center gap-2 bg-[#1a1a1a] rounded p-1 border border-gray-800">
                <button 
                  onClick={() => setActiveEventIndex(Math.max(0, activeEventIndex - 1))}
                  disabled={activeEventIndex === 0}
                  className="p-1 hover:bg-gray-700 rounded disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-mono text-gray-400 min-w-[60px] text-center">
                  {activeEventIndex + 1} / {events.length}
                </span>
                <button 
                  onClick={() => setActiveEventIndex(Math.min(events.length - 1, activeEventIndex + 1))}
                  disabled={activeEventIndex === events.length - 1}
                  className="p-1 hover:bg-gray-700 rounded disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
           </div>

           <div className="flex gap-2">
             <button 
                onClick={addEvent}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-semibold rounded text-sm transition-colors"
             >
                Nuevo Evento
             </button>
             <button 
                onClick={() => deleteEvent(activeEventIndex)}
                className="px-3 py-2 bg-red-900/50 hover:bg-red-500 text-white font-semibold rounded text-sm transition-colors border border-red-500/50"
             >
                Borrar
             </button>
           </div>
        </div>

        {/* Basic Properties Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 flex flex-col gap-4 shadow-lg">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2">Propiedades Básicas</h3>
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-gray-400">Event ID</label>
              <input type="text" value={eventId} onChange={e => updateActiveEvent({ id: e.target.value })} className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-gray-400">Event Picture</label>
              <div className="flex gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <input
                  type="text"
                  value={isBase64 ? '[Custom Image — uploaded]' : picture}
                  onChange={e => updateActiveEvent({ picture: e.target.value })}
                  placeholder="GFX_report_event_001"
                  readOnly={isBase64}
                  className={`flex-1 bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none ${
                    isBase64 ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
                {isBase64 ? (
                  <button
                    onClick={clearImage}
                    title="Remove custom image"
                    className="bg-red-900/50 hover:bg-red-500 p-2 rounded border border-red-500/50 text-red-300 hover:text-white transition-colors"
                  >
                    <X size={18}/>
                  </button>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title={auth.currentUser ? "Upload image to cloud" : "Upload image from disk"}
                    className="bg-amber-500/10 hover:bg-amber-500/30 p-2 rounded border border-amber-500/40 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18}/>}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400">Title</label>
              <button 
                onClick={() => handleAISuggest('title', title)}
                className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Sparkles size={10} /> AI Suggest
              </button>
            </div>
            <input type="text" value={title} onChange={e => updateActiveEvent({ title: e.target.value })} className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400">Description</label>
              <button 
                onClick={() => handleAISuggest('desc', desc)}
                className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Sparkles size={10} /> AI Suggest
              </button>
            </div>
            <textarea value={desc} onChange={e => updateActiveEvent({ desc: e.target.value })} rows={4} className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none resize-none" />
          </div>

          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="triggered" checked={isTriggeredOnly} onChange={e => updateActiveEvent({ isTriggeredOnly: e.target.checked })} className="accent-amber-500" />
              <label htmlFor="triggered" className="text-sm text-gray-300">Is Triggered Only</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fireOnlyOnce" checked={fireOnlyOnce || false} onChange={e => updateActiveEvent({ fireOnlyOnce: e.target.checked })} className="accent-amber-500" />
              <label htmlFor="fireOnlyOnce" className="text-sm text-gray-300">Fire Only Once</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hidden" checked={hidden || false} onChange={e => updateActiveEvent({ hidden: e.target.checked })} className="accent-amber-500" />
              <label htmlFor="hidden" className="text-sm text-gray-300">Hidden</label>
            </div>
          </div>

          {!isTriggeredOnly && (
            <div className="flex flex-col gap-1 border-t border-gray-800 pt-4 mt-2">
              <label className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Mean Time To Happen (Days)</label>
              <input type="number" value={mtth || 1} onChange={e => updateActiveEvent({ mtth: Number(e.target.value) })} className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-32" />
            </div>
          )}
        </div>

        {/* Code Blocks (Trigger / Immediate) */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 flex flex-col gap-4 shadow-lg">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Settings size={16}/> Advanced Logic
          </h3>
          
          <div className="flex gap-4 h-48">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-gray-400">trigger = {'{'}</label>
                <button 
                  onClick={() => handleAISuggest('trigger', trigger || '')}
                  className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Sparkles size={10} /> AI
                </button>
              </div>
              <div className="flex-1 border border-gray-700 rounded overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  theme="vs-dark"
                  value={trigger || ''}
                  onChange={(val) => updateActiveEvent({ trigger: val })}
                  options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-gray-400">immediate = {'{'}</label>
                <button 
                  onClick={() => handleAISuggest('immediate', immediate || '')}
                  className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Sparkles size={10} /> AI
                </button>
              </div>
              <div className="flex-1 border border-gray-700 rounded overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="plaintext"
                  theme="vs-dark"
                  value={immediate || ''}
                  onChange={(val) => updateActiveEvent({ immediate: val })}
                  options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Options Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Opciones del Evento</h3>
            <button onClick={addOptionToActiveEvent} className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              <Plus size={14} /> Añadir Opción
            </button>
          </div>

          {options.map((opt, index) => (
            <div key={opt.id || index} className="flex flex-col gap-3 bg-[#121212] border border-gray-800 p-4 rounded relative group">
               <button onClick={() => removeOptionFromActiveEvent(index)} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Trash2 size={16} />
               </button>
               
               <div className="flex flex-col gap-1 w-11/12">
                 <label className="text-xs text-gray-400">Option Name (Tooltip)</label>
                 <input type="text" value={opt.name} onChange={e => updateOptionInActiveEvent(index, 'name', e.target.value)} className="bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none" />
               </div>
               
               <div className="flex flex-col gap-1 h-32">
                 <div className="flex justify-between items-center">
                   <label className="text-xs text-gray-400 flex items-center gap-1"><Code2 size={12}/> Effects (Script)</label>
                   <button 
                     onClick={() => handleAISuggest('option', opt.name)}
                     className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                   >
                     <Sparkles size={10} /> AI Suggest
                   </button>
                 </div>
                 <div className="flex-1 border border-gray-700 rounded overflow-hidden">
                   <Editor
                     height="100%"
                     defaultLanguage="plaintext"
                     theme="vs-dark"
                     value={opt.effect || ''}
                     onChange={(val) => updateOptionInActiveEvent(index, 'effect', val || '')}
                     options={{ minimap: { enabled: false }, fontSize: 11, lineNumbers: 'off', scrollBeyondLastLine: false }}
                   />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Visual Preview & Code */}
      <div className="w-[450px] bg-[#161616] border-l border-gray-800 flex flex-col">
         {/* Live Game Preview (HOI4 Style) */}
         <div className="flex-1 p-6 flex flex-col items-center justify-center border-b border-gray-800">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-6 w-full text-center">Live Game Preview</h3>
            
            {/* Fake HOI4 Event Window */}
            <div className="w-[380px] bg-[#2a2a2a] border-2 border-[#151515] shadow-2xl relative select-none">
              <div className="h-6 bg-[#1a1a1a] flex justify-center items-center border-b border-[#151515]">
                 <span className="text-[10px] text-gray-400 tracking-widest">{title.toUpperCase()}</span>
              </div>
              <div className="w-full h-32 bg-gray-800 flex items-center justify-center border-b border-gray-900 relative overflow-hidden">
                {isBase64 ? (
                  <img
                    src={picture}
                    alt="event"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={48} className="text-gray-600 absolute" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {isBase64 && (
                  <span className="absolute bottom-1 right-2 text-[9px] text-gray-400 font-mono bg-black/50 px-1 rounded">
                    {picture.length > 40 ? 'custom image' : picture}
                  </span>
                )}
              </div>
              
              <div className="p-4 flex flex-col gap-4">
                 <p className="text-sm text-gray-300 font-serif leading-relaxed text-justify h-32 overflow-y-auto pr-2 custom-scrollbar">
                   {desc}
                 </p>
                 
                 <div className="flex flex-col gap-2 mt-2">
                   {options.map((opt, i) => (
                     <button key={i} className="w-full bg-[#333] hover:bg-[#444] border border-[#222] text-sm text-gray-200 py-2 px-3 text-left shadow-sm truncate">
                       {opt.name}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
         </div>

         {/* Code Preview */}
         <div className="h-64 p-4 flex flex-col gap-2 bg-[#0f0f0f]">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={14} className="text-amber-500"/> Generated Script
            </h3>
            <div className="bg-[#121212] border border-gray-800 rounded p-3 flex-1 overflow-auto">
              <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
         </div>
      </div>
    </div>
  );
}
