import { useModStore } from '../../store/useModStore';
import { baseModContent } from '../../data/baseModContent';
import { ShieldCheck, Info } from 'lucide-react';

export default function ModContextBanner() {
  const { baseMod } = useModStore();
  const config = baseModContent[baseMod];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-800 rounded-lg group hover:border-mod-primary transition-colors">
      <div className="w-5 h-5 rounded flex items-center justify-center bg-mod-primary/10 text-mod-primary">
        <ShieldCheck size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold leading-none">Editing In Context</span>
        <span className="text-[11px] font-bold text-gray-200 leading-tight group-hover:text-mod-accent transition-colors">
          {config.name}
        </span>
      </div>
      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info size={12} className="text-gray-600" />
      </div>
    </div>
  );
}
