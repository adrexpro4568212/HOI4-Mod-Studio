import { useState, useRef } from 'react';
import { Flag, Download, RefreshCw, Layers } from 'lucide-react';
import AssetUploader from '../ui/AssetUploader';
import { Button } from '../ui/button';
import { DDSConverter } from '../../utils/ddsConverter';

const FLAG_SIZES = [
  { id: 'large', name: 'Large (82x52)', width: 82, height: 52 },
  { id: 'medium', name: 'Medium (41x26)', width: 41, height: 26 },
  { id: 'small', name: 'Small (10x7)', width: 10, height: 7 },
];

export default function FlagTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRefs = {
    large: useRef<HTMLCanvasElement>(null),
    medium: useRef<HTMLCanvasElement>(null),
    small: useRef<HTMLCanvasElement>(null),
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        FLAG_SIZES.forEach(size => {
          const canvas = canvasRefs[size.id as keyof typeof canvasRefs].current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, size.width, size.height);
              ctx.drawImage(img, 0, 0, size.width, size.height);
            }
          }
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadSize = async (sizeId: string) => {
    const size = FLAG_SIZES.find(s => s.id === sizeId);
    const canvas = canvasRefs[sizeId as keyof typeof canvasRefs].current;
    if (!size || !canvas) return;

    setIsConverting(true);
    try {
      const blob = await DDSConverter.convertToDDS(canvas, 'DXT1');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flag_${sizeId}_${Date.now()}.dds`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAll = async () => {
    for (const size of FLAG_SIZES) {
      await downloadSize(size.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-mod-primary/10 flex items-center justify-center text-mod-primary">
            <Flag size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Flag Generator</h3>
            <p className="text-xs text-gray-500 mt-1">Generate the 3 required HOI4 flag sizes in one click.</p>
          </div>
        </div>

        <AssetUploader 
          onImageSelect={handleFileSelect} 
          aspectRatio={82/52} 
          label="Flag Texture"
          description="Upload PNG/JPG. We will generate L/M/S versions."
        />

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            disabled={!selectedFile || isConverting} 
            onClick={downloadAll}
            className="w-full bg-mod-primary hover:bg-mod-accent text-black font-bold h-12 rounded-xl transition-all"
          >
            {isConverting ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <Download className="mr-2" size={18} />
            )}
            Download All Sizes (.DDS)
          </Button>
          
          <div className="grid grid-cols-3 gap-2">
            {FLAG_SIZES.map(size => (
              <Button 
                key={size.id}
                variant="outline" 
                size="sm"
                disabled={!selectedFile}
                onClick={() => downloadSize(size.id)}
                className="text-[10px] h-8 border-gray-800 text-gray-400 hover:text-white"
              >
                {size.id.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">Generated Assets</div>
        
        <div className="space-y-8 w-full max-w-[300px]">
          {FLAG_SIZES.map(size => (
            <div key={size.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl border border-gray-800">
              <div className="flex items-center gap-4">
                <div 
                  className="bg-black/40 border border-gray-700 shadow-lg flex items-center justify-center overflow-hidden"
                  style={{ width: size.width * 1.5, height: size.height * 1.5 }}
                >
                  <canvas 
                    ref={canvasRefs[size.id as keyof typeof canvasRefs]} 
                    width={size.width} 
                    height={size.height} 
                    className="w-full h-full image-pixelated"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">{size.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase">gfx/flags/{size.id === 'large' ? '' : size.id + '/'}</div>
                </div>
              </div>
              <div className="text-mod-primary">
                <Layers size={14} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-mod-primary/5 rounded-xl border border-mod-primary/10 max-w-[300px]">
          <p className="text-[10px] text-mod-primary leading-relaxed">
            <strong>Pro Tip:</strong> Flags in HOI4 use a special DXT1 format without mipmaps. This generator is optimized for the best possible quality at small scales.
          </p>
        </div>
      </div>
    </div>
  );
}
