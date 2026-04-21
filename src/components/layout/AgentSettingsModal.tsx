import { AnimatePresence, motion } from 'framer-motion';
import AgentTeamSettings from '../ui/AgentTeamSettings';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentSettingsModal({ isOpen, onClose }: AgentSettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="agent-settings-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <AgentTeamSettings onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
