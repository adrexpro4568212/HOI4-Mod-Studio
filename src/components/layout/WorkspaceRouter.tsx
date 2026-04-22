import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import FileExplorer from '../explorer/FileExplorer';
import FocusTreeBuilder from '../focus-tree/FocusTreeBuilder';
import EventCreator from '../events/EventCreator';
import LeaderCreator from '../leaders/LeaderCreator';
import NationalSpiritsCreator from '../spirits/NationalSpiritsCreator';
import DecisionCreator from '../decisions/DecisionCreator';
import LocalizationEditor from '../localization/LocalizationEditor';
import CodeEditor from '../editor/CodeEditor';
import MacroEditor from '../macros/MacroEditor';
import EconomyEditor from '../economy/EconomyEditor';
import MissileEditor from '../missiles/MissileEditor';
import TechTreeEditor from '../tech-tree/TechTreeEditor';
import PoliticalPartyEditor from '../parties/PoliticalPartyEditor';
import CivilConflictEditor from '../conflicts/CivilConflictEditor';
import TNOVariableEditor from '../tno-variables/TNOVariableEditor';
import IdeologyPathEditor from '../tno-paths/IdeologyPathEditor';
import MonarchyEditor from '../monarchy/MonarchyEditor';
import CommunityHub from '../community/CommunityHub';
import MapEditor from '../map/MapEditor';
import DivisionEditor from '../divisions/DivisionEditor';
import AssetsView from '../assets/AssetsView';
import ScriptingLab from '../scripting/ScriptingLab';
import GUIEditor from '../gui/GUIEditor';

interface WorkspaceRouterProps {
  activeTab: string;
}

export default function WorkspaceRouter({ activeTab }: WorkspaceRouterProps) {
  return (
    <main className="flex-1 flex overflow-hidden">
      <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col z-10">
        <div className="p-3 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Menu size={14} /> Explorer
        </div>
        <FileExplorer />
      </aside>

      <div className="flex-1 bg-[#121212] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {activeTab === 'focus' && <FocusTreeBuilder />}
            {activeTab === 'events' && <EventCreator />}
            {activeTab === 'leaders' && <LeaderCreator />}
            {activeTab === 'spirits' && <NationalSpiritsCreator />}
            {activeTab === 'decisions' && <DecisionCreator />}
            {activeTab === 'localization' && <LocalizationEditor />}
            {activeTab === 'code' && <CodeEditor />}
            {activeTab === 'macros' && <MacroEditor />}
            {activeTab === 'economy' && <EconomyEditor />}
            {activeTab === 'missiles' && <MissileEditor />}
            {activeTab === 'techtree' && <TechTreeEditor />}
            {activeTab === 'parties' && <PoliticalPartyEditor />}
            {activeTab === 'conflicts' && <CivilConflictEditor />}
            {activeTab === 'tno_vars' && <TNOVariableEditor />}
            {activeTab === 'tno_paths' && <IdeologyPathEditor />}
            {activeTab === 'monarchy' && <MonarchyEditor />}
            {activeTab === 'community' && <CommunityHub />}
            {activeTab === 'map' && <MapEditor />}
            {activeTab === 'division_designer' && <DivisionEditor />}
            {activeTab === 'assets' && <AssetsView />}
            {activeTab === 'gui_editor' && <GUIEditor />}
            {activeTab === 'scripting' && <ScriptingLab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
