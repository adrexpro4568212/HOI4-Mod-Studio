import { Handle, Position } from 'reactflow';
import { Target } from 'lucide-react';

interface FocusNodeProps {
  data: {
    label: string;
    icon?: string;
    cost?: number;
    id?: string;
  };
}

export default function FocusNode({ data }: FocusNodeProps) {
  return (
    <div className="w-48 bg-[#2a2a2a] border border-gray-700 rounded-md shadow-lg overflow-hidden group hover:border-amber-500 transition-colors">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-500 border-2 border-[#121212] rounded-full" 
      />
      
      <div className="p-2 flex items-center justify-between bg-[#1f1f1f] border-b border-gray-700">
        <div className="flex items-center gap-2 flex-1 min-w-0">
           <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-amber-500 shrink-0">
             <Target size={14} />
           </div>
           <span className="text-xs font-mono text-gray-400 truncate">{data.id || 'focus_id'}</span>
        </div>
        <span className="text-xs bg-[#121212] px-1.5 py-0.5 rounded text-amber-500 border border-gray-800 shrink-0 ml-2">
          {data.cost || 10}d
        </span>
      </div>
      
      <div className="p-3 text-center">
        <h3 className="text-sm font-semibold text-gray-200 leading-tight">
          {data.label}
        </h3>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-amber-500 border-2 border-[#121212] rounded-full" 
      />
    </div>
  );
}
