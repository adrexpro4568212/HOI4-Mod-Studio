import { Editor } from '@monaco-editor/react';
import { useModStore } from '../../store/useModStore';
import { 
  generateFocusTreeText, 
  generateEventsText, 
  generateIdeasText, 
  generateDecisionsText, 
  generateCharactersText, 
  generateLocalizationText 
} from '../../utils/export';
import { useMemo } from 'react';

export default function CodeEditor() {
  const { 
    activeFilePath, 
    nodes, edges, events, spirits, decisionCategories, leaders, localizations 
  } = useModStore();

  const editorContent = useMemo(() => {
    if (!activeFilePath) return '// Select a file from the explorer to preview its contents.';

    switch (activeFilePath) {
      case 'common/national_focus/my_custom_tree.txt':
        return generateFocusTreeText(nodes, edges) || '# No focuses defined yet.';
      case 'events/my_events.txt':
        return generateEventsText(events) || '# No events defined yet.';
      case 'common/ideas/my_ideas.txt':
        return generateIdeasText(spirits) || '# No ideas defined yet.';
      case 'common/decisions/my_decisions.txt':
        return generateDecisionsText(decisionCategories) || '# No decisions defined yet.';
      case 'common/characters/my_characters.txt':
        return generateCharactersText(leaders) || '# No characters defined yet.';
      case 'localisation/my_mod_l_english.yml':
        // Monaco editor gets confused by BOM, but for preview it's fine.
        return generateLocalizationText(localizations, 'english') || '# No localization defined yet.';
      default:
        return '// Unsupported file path.';
    }
  }, [activeFilePath, nodes, edges, events, spirits, decisionCategories, leaders, localizations]);

  const isYaml = activeFilePath?.endsWith('.yml');

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e]">
      <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-800 text-sm font-mono text-gray-300 shadow-sm flex items-center justify-between">
        <span>{activeFilePath || 'No file selected'}</span>
        {activeFilePath && (
          <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            Preview Only
          </span>
        )}
      </div>
      <div className="flex-1 relative">
        {!activeFilePath ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            Select a file from the Explorer to preview the generated script.
          </div>
        ) : (
          <Editor
            height="100%"
            language={isYaml ? 'yaml' : 'plaintext'}
            theme="vs-dark"
            value={editorContent}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        )}
      </div>
    </div>
  );
}
