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

export function checkClausewitzSyntax(script: string | undefined): string | null {
  if (!script || typeof script !== 'string') return null;
  
  let braces = 0;
  let inQuotes = false;
  let prevChar = '';

  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    
    // Toggle quotes if we see an unescaped quotation mark
    if (char === '"' && prevChar !== '\\') {
      inQuotes = !inQuotes;
    }
    
    // Only count braces if we are not inside a string literal
    if (!inQuotes) {
      if (char === '{') braces++;
      if (char === '}') braces--;
    }
    
    prevChar = char;
    
    // If braces go negative, there's a stray closing brace before an opening one
    if (braces < 0) {
      return "Unexpected closing brace '}'. Check for extra or unbalanced braces.";
    }
  }

  if (inQuotes) return 'Unclosed quotation mark \'"\'.';
  if (braces > 0) return `Missing ${braces} closing brace(s) '}'.`;
  
  return null;
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

    // Syntax validation for scripts
    const nodeData = node.data as Record<string, string | undefined>;
    if (nodeData) {
      const availErr = checkClausewitzSyntax(nodeData.available);
      if (availErr) issues.push({ id: `syn-focus-avail-${node.id}`, source: 'focus', sourceId: node.id, message: `Syntax Error in Available: ${availErr}`, severity: 'error' });

      const bypassErr = checkClausewitzSyntax(nodeData.bypass);
      if (bypassErr) issues.push({ id: `syn-focus-bypass-${node.id}`, source: 'focus', sourceId: node.id, message: `Syntax Error in Bypass: ${bypassErr}`, severity: 'error' });

      const rewardErr = checkClausewitzSyntax(nodeData.completion_reward);
      if (rewardErr) issues.push({ id: `syn-focus-reward-${node.id}`, source: 'focus', sourceId: node.id, message: `Syntax Error in Completion Reward: ${rewardErr}`, severity: 'error' });
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

    // Syntax validation for event scripts
    const triggerErr = checkClausewitzSyntax(event.trigger);
    if (triggerErr) issues.push({ id: `syn-evt-trigger-${event.id}`, source: 'event', sourceId: event.id, message: `Syntax Error in Trigger: ${triggerErr}`, severity: 'error' });

    const immErr = checkClausewitzSyntax(event.immediate);
    if (immErr) issues.push({ id: `syn-evt-imm-${event.id}`, source: 'event', sourceId: event.id, message: `Syntax Error in Immediate: ${immErr}`, severity: 'error' });

    event.options.forEach((opt, idx) => {
      const effectErr = checkClausewitzSyntax(opt.effect);
      if (effectErr) issues.push({ id: `syn-evt-opt-${event.id}-${idx}`, source: 'event', sourceId: event.id, message: `Syntax Error in Option "${opt.name}": ${effectErr}`, severity: 'error' });
    });
  });

  return issues;
}
