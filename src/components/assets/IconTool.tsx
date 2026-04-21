import { useState, useRef } from 'react';
import { Target, Calendar, Download, RefreshCw, Layers, Monitor } from 'lucide-react';
import AssetUploader from '../ui/AssetUploader';
import { Button } from '../ui/button';
import { DDSConverter } from '../../utils/ddsConverter';

const ICON_PRESETS = [
  { id: 'focus', name: 'Focus Icon', width: 60, height: 60, icon: Target, path: 'gfx/interface/goals/' },
  { id: 'event', name: 'Event Image', width: 450, height: 210, icon: Calendar, path: 'gfx/event_pictures/' },
  { id: 'spirit', name: 'National Spirit', width: 60, height: 60, icon: Monitor, path: 'gfx/interface/ideas/' },
];

export default function IconTool() {
  const [activePreset, setActivePreset] = useState(ICON_PRESETS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, activePreset.width, activePreset.height);
            ctx.drawImage(img, 0, 0, activePreset.width, activePreset.height);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadDDS = async () => {
    if (!canvasRef.current) return;
    setIsConverting(true);
    try {
      const blob = await DDSConverter.convertToDDS(canvasRef.current, 'DXT5'); // DXT5 for alpha support in icons
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activePreset.id}_${Date.now()}.dds`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-mod-primary/10 flex items-center justify-center text-mod-primary">
            <activePreset.icon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Icon & Event Studio</h3>
            <p className="text-xs text-gray-500 mt-1">Professional assets for Focus Trees and Events.</p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-gray-800">
          {ICON_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                setActivePreset(preset);
                setSelectedFile(null); // Clear on preset change to avoid wrong aspect ratio previews
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                activePreset.id === preset.id 
                  ? 'bg-mod-primary text-black' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <preset.icon size={12} />
              {preset.name}
            </button>
          ))}
        </div>

        <AssetUploader 
          key={activePreset.id} // Force re-render on preset change
          onImageSelect={handleFileSelect} 
          aspectRatio={activePreset.width / activePreset.height} 
          label={`${activePreset.name} Source`}
          description={`Auto-resize to ${activePreset.width}x${activePreset.height}. PNG recommended for icons.`}
        />

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            disabled={!selectedFile || isConverting} 
            onClick={handleDownloadDDS}
            className="w-full bg-mod-primary hover:bg-mod-accent text-black font-bold h-12 rounded-xl transition-all"
          >
            {isConverting ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <Download className="mr-2" size={18} />
            )}
            Download {activePreset.name} (.DDS)
          </Button>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 italic">
            <Layers size={10} />
            Output Path: {activePreset.path}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">Asset Pre-visualization</div>
        
        <div 
          className="relative bg-zinc-900 rounded-lg border border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center group"
          style={{ 
            width: Math.min(300, activePreset.width * 2), 
            height: Math.min(300, activePreset.height * 2) 
          }}
        >
          <canvas 
            ref={canvasRef} 
            width={activePreset.width} 
            height={activePreset.height} 
            className="w-full h-full object-contain image-pixelated" 
          />
          {!selectedFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
              <activePreset.icon size={48} strokeWidth={1} />
              <span className="text-[10px] mt-2 font-bold opacity-30">Preview Area</span>
            </div>
          )}
          
          {/* Overlay Grid */}
          <div className="absolute inset-0 border border-white/5 pointer-events-none group-hover:border-mod-primary/20 transition-colors" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[320px]">
          <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-gray-800">
            <div className="text-[10px] font-bold text-gray-300">Transparency</div>
            <div className="text-[9px] text-gray-600 mt-1">DXT5 compression ensures smooth alpha edges for UI icons.</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-gray-800">
            <div className="text-[10px] font-bold text-gray-300">Legacy Comp.</div>
            <div className="text-[9px] text-gray-600 mt-1">Compatible with all HOI4 versions (Vanilla & Mods).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
