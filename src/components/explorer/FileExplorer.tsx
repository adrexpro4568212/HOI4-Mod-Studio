import { useState } from 'react';
import { useModStore } from '../../store/useModStore';
import { ChevronRight, ChevronDown, Folder, FileText, FileCode } from 'lucide-react';

export default function FileExplorer() {
  const { 
    nodes, events, spirits, decisionCategories, leaders, localizations,
    activeFilePath, setActiveFilePath 
  } = useModStore();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'common': true,
    'common/national_focus': true,
    'events': true,
    'localisation': true
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Build the virtual file system
  const files = [
    { path: 'common/national_focus/my_custom_tree.txt', show: nodes.length > 0 },
    { path: 'common/ideas/my_ideas.txt', show: spirits.length > 0 },
    { path: 'common/decisions/my_decisions.txt', show: decisionCategories.length > 0 },
    { path: 'common/characters/my_characters.txt', show: leaders.length > 0 },
    { path: 'events/my_events.txt', show: events.length > 0 },
    { path: 'localisation/my_mod_l_english.yml', show: localizations.length > 0 }
  ].filter(f => f.show);

  const renderFolder = (folderName: string, folderPath: string, children: React.ReactNode) => {
    const isExpanded = expandedFolders[folderPath];
    return (
      <div className="flex flex-col select-none">
        <div 
          className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#2a2a2a] cursor-pointer text-gray-300 rounded transition-colors"
          onClick={() => toggleFolder(folderPath)}
        >
          {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
          <Folder size={14} className="text-amber-500" />
          <span className="text-sm font-medium tracking-wide">{folderName}</span>
        </div>
        {isExpanded && (
          <div className="pl-4 ml-[7px] border-l border-gray-800 flex flex-col">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (fileName: string, filePath: string, isYaml: boolean = false) => {
    const isActive = activeFilePath === filePath;
    return (
      <div 
        className={`flex items-center gap-1.5 px-2 py-1 ml-1 cursor-pointer rounded transition-colors ${
          isActive ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-[#2a2a2a] text-gray-400'
        }`}
        onClick={() => setActiveFilePath(filePath)}
      >
        {isYaml ? <FileCode size={14} className="text-blue-400" /> : <FileText size={14} className="text-gray-500" />}
        <span className="text-sm truncate">{fileName}</span>
      </div>
    );
  };

  // Check existence
  const hasCommon = files.some(f => f.path.startsWith('common/'));

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {files.length === 0 ? (
        <div className="text-center p-4 text-xs text-gray-500 italic mt-4">
          No files generated yet. Start creating content to see project files here.
        </div>
      ) : (
        <div className="space-y-0.5">
          {hasCommon && renderFolder('common', 'common', (
            <>
              {nodes.length > 0 && renderFolder('national_focus', 'common/national_focus', renderFile('my_custom_tree.txt', 'common/national_focus/my_custom_tree.txt'))}
              {spirits.length > 0 && renderFolder('ideas', 'common/ideas', renderFile('my_ideas.txt', 'common/ideas/my_ideas.txt'))}
              {decisionCategories.length > 0 && renderFolder('decisions', 'common/decisions', renderFile('my_decisions.txt', 'common/decisions/my_decisions.txt'))}
              {leaders.length > 0 && renderFolder('characters', 'common/characters', renderFile('my_characters.txt', 'common/characters/my_characters.txt'))}
            </>
          ))}
          {events.length > 0 && renderFolder('events', 'events', renderFile('my_events.txt', 'events/my_events.txt'))}
          {localizations.length > 0 && renderFolder('localisation', 'localisation', renderFile('my_mod_l_english.yml', 'localisation/my_mod_l_english.yml', true))}
        </div>
      )}
    </div>
  );
}
