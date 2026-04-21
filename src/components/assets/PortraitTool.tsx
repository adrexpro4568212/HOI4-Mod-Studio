import { useState, useRef } from 'react';
import { User, Download, Scissors, RefreshCw, Palette } from 'lucide-react';
import AssetUploader from '../ui/AssetUploader';
import { Button } from '../ui/button';
import { DDSConverter } from '../../utils/ddsConverter';

export default function PortraitTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Draw to hidden canvas for preview/conversion
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // HOI4 Portraits are 156x210
            ctx.clearRect(0, 0, 156, 210);
            ctx.drawImage(img, 0, 0, 156, 210);
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
      const blob = await DDSConverter.convertToDDS(canvasRef.current, 'DXT1');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portrait_${Date.now()}.dds`;
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
            <User size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Portrait Studio</h3>
            <p className="text-xs text-gray-500 mt-1">Convert leadership photos to standard 156x210 DDS.</p>
          </div>
        </div>

        <AssetUploader 
          onImageSelect={handleFileSelect} 
          aspectRatio={156/210} 
          label="Leader Portrait"
          description="Upload PNG/JPG. We will auto-crop to 156x210."
        />

        <div className="flex items-center gap-3 pt-4">
          <Button 
            disabled={!selectedFile || isConverting} 
            onClick={handleDownloadDDS}
            className="flex-1 bg-mod-primary hover:bg-mod-accent text-black font-bold h-12 rounded-xl transition-all"
          >
            {isConverting ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <Download className="mr-2" size={18} />
            )}
            Download .DDS
          </Button>
          <Button variant="outline" className="h-12 w-12 rounded-xl border-gray-800 text-gray-500">
            <Palette size={18} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Live HOI4 Preview</div>
        <div className="relative w-[156px] h-[210px] bg-[#111] rounded-sm border border-gray-800 shadow-2xl overflow-hidden group">
          <canvas ref={canvasRef} width={156} height={210} className="w-full h-full" />
          {!selectedFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-zinc-900/50">
              <User size={48} strokeWidth={1} />
              <span className="text-[10px] mt-2 font-bold opacity-50">Empty Slot</span>
            </div>
          )}
          
          {/* Mock UI Frame */}
          <div className="absolute inset-0 border-2 border-amber-900/20 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
            <div className="w-full h-1 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-amber-500" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[320px]">
          <div className="p-3 bg-[#1a1a1a] rounded-xl border border-gray-800">
            <div className="text-gray-500 mb-1"><Scissors size={14} /></div>
            <div className="text-[10px] font-bold text-gray-300">Auto-Scaling</div>
            <div className="text-[9px] text-gray-600">Locked to 156x210</div>
          </div>
          <div className="p-3 bg-[#1a1a1a] rounded-xl border border-gray-800">
            <div className="text-gray-500 mb-1"><RefreshCw size={14} /></div>
            <div className="text-[10px] font-bold text-gray-300">Fast Export</div>
            <div className="text-[9px] text-gray-600">DXT1 Compressed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
