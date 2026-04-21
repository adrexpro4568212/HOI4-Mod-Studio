import { useCallback, useRef } from 'react';
import { useHistoryStore } from '../store/historyStore';
import { useModStore } from '../store/useModStore';

function getCurrentSnapshot(): unknown {
  return {
    nodes: useModStore.getState().nodes,
    edges: useModStore.getState().edges,
    events: useModStore.getState().events,
    spirits: useModStore.getState().spirits,
    decisionCategories: useModStore.getState().decisionCategories,
    leaders: useModStore.getState().leaders,
    localizations: useModStore.getState().localizations,
    macros: useModStore.getState().macros,
    states: useModStore.getState().states,
    divisionTemplates: useModStore.getState().divisionTemplates,
    armyGroups: useModStore.getState().armyGroups,
    economyConfig: useModStore.getState().economyConfig,
    missiles: useModStore.getState().missiles,
    techNodes: useModStore.getState().techNodes,
    techEdges: useModStore.getState().techEdges,
    politicalParties: useModStore.getState().politicalParties,
    civilConflicts: useModStore.getState().civilConflicts,
    monarchyConfig: useModStore.getState().monarchyConfig,
    tnoVariables: useModStore.getState().tnoVariables,
    tnoPaths: useModStore.getState().tnoPaths,
  };
}

export function useUndoRedo() {
  const { pushState, undo, redo, canUndo, canRedo, clear } = useHistoryStore();
  const isUndoRedoOperation = useRef(false);

  const saveState = useCallback(() => {
    if (!isUndoRedoOperation.current) {
      const snapshot = getCurrentSnapshot();
      pushState(snapshot);
    }
  }, [pushState]);

  const undoAction = useCallback(() => {
    const snapshot = getCurrentSnapshot();
    isUndoRedoOperation.current = true;
    const result = undo(snapshot);
    isUndoRedoOperation.current = false;
    return result;
  }, [undo]);

  const redoAction = useCallback(() => {
    const snapshot = getCurrentSnapshot();
    isUndoRedoOperation.current = true;
    const result = redo(snapshot);
    isUndoRedoOperation.current = false;
    return result;
  }, [redo]);

  const clearHistory = useCallback(() => {
    clear();
  }, [clear]);

  return {
    saveState,
    undo: undoAction,
    redo: redoAction,
    canUndo: canUndo(),
    canRedo: canRedo(),
    clearHistory,
  };
}