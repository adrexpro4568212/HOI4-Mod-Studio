import type { Node } from 'reactflow';
import type { HoiEvent, LocalizationEntry } from '../store/useModStore';

export type Severity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  source: 'focus' | 'event' | 'leader' | 'spirit' | 'localization';
  sourceId: string;
  message: string;
  severity: Severity;
  fixLabel?: string;
  fixAction?: () => void;
}

interface ValidationState {
  nodes: Node[];
  localizations: LocalizationEntry[];
  events: HoiEvent[];
}

export function validateModState(state: ValidationState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. FOCUS TREE VALIDATION
  const focusIds = new Set<string>();
  state.nodes.forEach((node) => {
    // Duplicate IDs
    if (focusIds.has(node.id)) {
      issues.push({
        id: `dup-focus-${node.id}`,
        source: 'focus',
        sourceId: node.id,
        message: `Duplicate Focus ID: ${node.id}`,
        severity: 'error',
        fixLabel: 'Rename ID'
      });
    }
    focusIds.add(node.id);

    // Missing Localization
    const locKey = node.data?.label || node.id;
    const hasLoc = state.localizations.some((l) => l.key === locKey || l.key === `${node.id}_name`);
    if (!hasLoc) {
      issues.push({
        id: `loc-focus-${node.id}`,
        source: 'focus',
        sourceId: node.id,
        message: `Missing localization for focus: ${node.id}`,
        severity: 'warning',
        fixLabel: 'Generate Localization'
      });
    }
  });

  // 2. EVENT VALIDATION
  const eventIds = new Set<string>();
  state.events.forEach((event) => {
    if (eventIds.has(event.id)) {
      issues.push({
        id: `dup-event-${event.id}`,
        source: 'event',
        sourceId: event.id,
        message: `Duplicate Event ID: ${event.id}`,
        severity: 'error',
        fixLabel: 'Rename ID'
      });
    }
    eventIds.add(event.id);

    if (event.options.length === 0) {
      issues.push({
        id: `opt-event-${event.id}`,
        source: 'event',
        sourceId: event.id,
        message: `Event ${event.id} has no options (will be unclickable).`,
        severity: 'error',
        fixLabel: 'Add Default Option'
      });
    }
  });

  return issues;
}
