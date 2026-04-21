import { useState, useRef } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetUploaderProps {
  onImageSelect: (file: File) => void;
  aspectRatio?: number;
  label?: string;
  description?: string;
}

export default function AssetUploader({ onImageSelect, aspectRatio, label, description }: AssetUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      return;
    }

    setStatus('processing');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      onImageSelect(file);
      setTimeout(() => setStatus('success'), 800);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label || 'Upload Asset'}</label>
        {status === 'success' && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-bold text-mod-accent flex items-center gap-1">
            <CheckCircle2 size={12} /> READY FOR DDS
          </motion.span>
        )}
      </div>

      <div 
        className={`relative aspect-[${aspectRatio || 1}] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-6 ${
          dragActive ? 'border-mod-primary bg-mod-primary/5' : 'border-gray-800 bg-[#151515] hover:border-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 w-full h-full"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <p className="text-white text-xs font-bold">Click to change</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setPreview(null); setStatus('idle'); }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-4">
                <Upload size={24} />
              </div>
              <p className="text-xs font-bold text-gray-300 mb-1">Drag & drop your image</p>
              <p className="text-[10px] text-gray-500 max-w-[180px]">{description || 'PNG or JPG. Best results with square or 156x210.'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'processing' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-mod-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
