
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Layers, Download, Sliders, Type, Trash2, Edit2, Upload } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useModStore } from '../../store/useModStore';
import type { PhotoshootElement } from '../../store/useModStore';
import * as htmlToImage from 'html-to-image';

export default function PhotoshootStudio() {
  const { t } = useTranslation();
  
  const photoshootElements = useModStore((state) => state.photoshootElements);
  const activePhotoshootElementId = useModStore((state) => state.activePhotoshootElementId);
  const setActivePhotoshootElementId = useModStore((state) => state.setActivePhotoshootElementId);
  const addPhotoshootElement = useModStore((state) => state.addPhotoshootElement);
  const updatePhotoshootElement = useModStore((state) => state.updatePhotoshootElement);
  const deletePhotoshootElement = useModStore((state) => state.deletePhotoshootElement);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);

  const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newElement: PhotoshootElement = {
        id: `img_${Date.now()}`,
        type: 'image',
        content: base64,
        x: 50,
        y: 50,
        zIndex: photoshootElements.length + 1,
        width: 300,
      };
      addPhotoshootElement(newElement);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddText = () => {
    const newElement: PhotoshootElement = {
      id: `txt_${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      zIndex: photoshootElements.length + 1,
      fontSize: 32,
      color: '#ffffff',
    };
    addPhotoshootElement(newElement);
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setActivePhotoshootElementId(null); // Deselect before export to remove outlines

    try {
      // Small delay to ensure state updates (like deselection) are rendered
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `mod-promo-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  }, [canvasRef, setActivePhotoshootElementId]);

  const activeElement = photoshootElements.find(e => e.id === activePhotoshootElementId);

  return (
    <div className="h-full flex flex-col bg-[#121212] text-gray-100 overflow-hidden">
      <div className="flex-none p-6 border-b border-gray-800 bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
              <Camera className="text-pink-500" />
              {t('photoshoot')}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create stunning promotional materials and propaganda for your mod
            </p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportImage} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <Upload size={18} />
              Import Assets
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg transition-all shadow-lg shadow-pink-900/20 ${
                isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-500 hover:scale-105'
              }`}
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export Image'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools & Properties */}
        <div className="w-72 border-r border-gray-800 bg-[#161616] flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} /> Elements & Properties
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Element Creation */}
            <div className="space-y-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-pink-500/50 hover:bg-gray-800 transition-all text-left"
              >
                <div className="bg-pink-500/10 p-2 rounded-lg text-pink-400">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Add Image</h3>
                  <p className="text-xs text-gray-500">Upload background or character</p>
                </div>
              </button>
              
              <button 
                onClick={handleAddText}
                className="w-full flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all text-left"
              >
                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                  <Type size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Add Text</h3>
                  <p className="text-xs text-gray-500">Add propaganda typography</p>
                </div>
              </button>
            </div>

            {/* Properties Panel (Contextual) */}
            {activeElement && (
              <div className="border-t border-gray-800 pt-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Edit2 size={14} className="text-pink-400" />
                  Edit {activeElement.type === 'text' ? 'Text' : 'Image'}
                </h3>
                
                {activeElement.type === 'text' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Text Content</label>
                      <textarea 
                        value={activeElement.content}
                        onChange={(e) => updatePhotoshootElement(activeElement.id, { content: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-pink-500 focus:outline-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="space-y-1 flex-1">
                        <label className="text-xs text-gray-500">Font Size</label>
                        <input 
                          type="number"
                          value={activeElement.fontSize || 32}
                          onChange={(e) => updatePhotoshootElement(activeElement.id, { fontSize: Number(e.target.value) })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-pink-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Color</label>
                        <input 
                          type="color"
                          value={activeElement.color || '#ffffff'}
                          onChange={(e) => updatePhotoshootElement(activeElement.id, { color: e.target.value })}
                          className="w-10 h-9 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {activeElement.type === 'image' && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Width (px)</label>
                    <input 
                      type="number"
                      value={activeElement.width || 300}
                      onChange={(e) => updatePhotoshootElement(activeElement.id, { width: Number(e.target.value) })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div 
          className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-8"
          onClick={() => setActivePhotoshootElementId(null)}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div 
            ref={canvasRef}
            className="w-full max-w-4xl aspect-video bg-black relative overflow-hidden shadow-2xl rounded-sm ring-1 ring-gray-800"
            style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {photoshootElements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 pointer-events-none">
                <Camera size={48} className="mb-4 opacity-50" />
                <p>Add elements from the sidebar to begin</p>
              </div>
            )}
            
            {photoshootElements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  updatePhotoshootElement(el.id, {
                    x: el.x + info.offset.x,
                    y: el.y + info.offset.y
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoshootElementId(el.id);
                }}
                initial={{ x: el.x, y: el.y }}
                animate={{ x: el.x, y: el.y }}
                style={{ zIndex: el.zIndex }}
                className={`absolute cursor-move ${
                  activePhotoshootElementId === el.id ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-black' : ''
                }`}
              >
                {el.type === 'image' ? (
                  <img 
                    src={el.content} 
                    alt="Element" 
                    draggable={false}
                    style={{ width: el.width || 'auto', height: el.height || 'auto', display: 'block' }}
                  />
                ) : (
                  <div 
                    style={{ 
                      fontSize: el.fontSize || 32, 
                      color: el.color || '#fff',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.2
                    }}
                  >
                    {el.content}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Layers */}
        <div className="w-64 border-l border-gray-800 bg-[#161616] flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} /> Layers
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {photoshootElements.length === 0 && (
              <p className="text-xs text-gray-600 text-center mt-4">No layers yet</p>
            )}
            {[...photoshootElements].sort((a, b) => b.zIndex - a.zIndex).map((el) => (
              <div 
                key={el.id}
                onClick={() => setActivePhotoshootElementId(el.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${
                  activePhotoshootElementId === el.id 
                    ? 'bg-gray-800 border-pink-500/50' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {el.type === 'image' ? (
                    <ImageIcon size={14} className="text-pink-400 flex-none" />
                  ) : (
                    <Type size={14} className="text-blue-400 flex-none" />
                  )}
                  <span className="text-sm text-gray-300 truncate">
                    {el.type === 'image' ? 'Image Layer' : el.content.substring(0, 15) || 'Empty Text'}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhotoshootElement(el.id);
                    if (activePhotoshootElementId === el.id) setActivePhotoshootElementId(null);
                  }}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

