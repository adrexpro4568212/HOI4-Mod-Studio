import type { Edge, Node } from 'reactflow';
import { useModStore } from '../store/useModStore';
import type {
  HoiState,
  DivisionTemplate,
  HoiEvent,
  NationalSpirit,
  DecisionCategory,
  Leader,
  LocalizationEntry,
  EconomyConfig,
  MissileType,
  PoliticalParty,
  CivilConflict,
  MonarchyConfig,
  TNOVariable,
  IdeologyPath,
} from '../store/useModStore';
import { serializeClausewitz } from './clausewitz';
import type { ClausewitzObject } from './clausewitz';

interface FocusNodeData {
  id?: string;
  icon?: string;
  cost?: number | string;
}

interface TechNodeData {
  id?: string;
  category?: string;
  cost?: number;
}

export function generateFocusTreeText(nodes: Node[], edges: Edge[]) {
  if (nodes.length === 0) return '';

  const allFocuses = nodes.map((node) => {
    const nodeData = (node.data ?? {}) as FocusNodeData;
    const incomingEdges = edges.filter((e) => e.target === node.id);
    const prerequisites = incomingEdges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const sourceData = (sourceNode?.data ?? {}) as FocusNodeData;
        return sourceNode ? { focus: sourceData.id } : null;
      })
      .filter((value): value is { focus: string | undefined } => value !== null);

    const focusObj: Record<string, unknown> = {
      id: nodeData.id || 'unknown_id',
      icon: nodeData.icon || 'GFX_goal_unknown',
      cost: Number(nodeData.cost) || 10,
    };

    if (prerequisites.length > 0) {
      focusObj.prerequisite = prerequisites;
    }

    return focusObj;
  });

  return serializeClausewitz({
    focus_tree: {
      id: 'my_custom_tree',
      focus: allFocuses,
    },
  } as unknown as ClausewitzObject);
}

export function generateEventsText(events: HoiEvent[]) {
  if (events.length === 0) return '';

  const formattedEvents = events.map((ev) => {
    const formattedOptions = ev.options.map((opt) => ({
      name: `"${opt.name}"`,
      __raw_inject: { __raw: opt.effect },
    }));

    return {
      id: ev.id,
      title: ev.title,
      desc: ev.desc,
      picture: ev.picture,
      is_triggered_only: ev.isTriggeredOnly ? 'yes' : 'no',
      fire_only_once: ev.fireOnlyOnce ? 'yes' : undefined,
      hidden: ev.hidden ? 'yes' : undefined,
      trigger: ev.trigger ? { __raw: ev.trigger } : undefined,
      immediate: ev.immediate ? { __raw: ev.immediate } : undefined,
      mean_time_to_happen: ev.mtth ? { days: ev.mtth } : undefined,
      option: formattedOptions,
    };
  });

  return serializeClausewitz({
    add_namespace: 'country',
    __raw_inject: { __raw: '\n' },
    country_event: formattedEvents,
  });
}

export function generateIdeasText(spirits: NationalSpirit[]) {
  if (spirits.length === 0) return '';

  const ideasDict = spirits.reduce<Record<string, { picture: string; modifier?: Record<string, number> }>>((acc, spirit) => {
    const spiritId = spirit.id || 'unknown_spirit';
    const modDict = spirit.modifiers.reduce<Record<string, number>>((modAcc, mod) => {
      if (mod.type && mod.value) {
        modAcc[mod.type] = Number(mod.value);
      }
      return modAcc;
    }, {});

    acc[spiritId] = {
      picture: spirit.picture || 'generic_idea',
      modifier: Object.keys(modDict).length > 0 ? modDict : undefined,
    };
    return acc;
  }, {});

  return serializeClausewitz({ ideas: { country: ideasDict } });
}

export function generateDecisionsText(decisionCategories: DecisionCategory[]) {
  if (decisionCategories.length === 0) return '';

  const decisionsDict = decisionCategories.reduce<Record<string, Record<string, unknown>>>((acc, cat) => {
    const catId = cat.id || 'unknown_category';

    acc[catId] = cat.decisions.reduce<Record<string, unknown>>((decAcc, dec) => {
      const decId = dec.id || 'unknown_decision';
      decAcc[decId] = {
        cost: dec.cost || 0,
        custom_cost_trigger: dec.trigger ? { [dec.trigger]: 'yes' } : undefined,
      };
      return decAcc;
    }, {});

    return acc;
  }, {});

  return serializeClausewitz({ decisions: decisionsDict } as unknown as ClausewitzObject);
}

export function generateCharactersText(leaders: Leader[]) {
  if (leaders.length === 0) return '';

  const charactersDict = leaders.reduce<Record<string, unknown>>((acc, leader) => {
    const leaderId = leader.id || 'unknown_character';
    acc[leaderId] = {
      name: leader.name || 'Unnamed',
      portraits: { civilian: { large: `GFX_portrait_${leaderId}` } },
      country_leader: {
        ideology: leader.ideology || 'neutrality',
        traits: leader.traits.map((t) => t.id),
      },
    };
    return acc;
  }, {});

  return serializeClausewitz({ characters: charactersDict } as unknown as ClausewitzObject);
}

export function generateLocalizationText(localizations: LocalizationEntry[], lang: 'english' | 'spanish' | 'french') {
  if (localizations.length === 0) return '';
  const bom = '\uFEFF';
  let locText = bom + `l_${lang}:\n`;
  localizations.forEach((loc) => {
    const value = loc[lang];
    if (loc.key && value) locText += `  ${loc.key}:0 "${value}"\n`;
  });
  return locText;
}

export function generateStateText(state: HoiState) {
  return serializeClausewitz({
    state: {
      id: state.id,
      name: `"${state.name}"`,
      manpower: state.manpower,
      state_category: state.category,
      history: {
        owner: state.owner,
        victory_points: { __raw: `${state.provinces.split(' ')[0] || '1'} 1` },
      },
      provinces: { __raw: state.provinces },
    },
  });
}

export function generateDivisionsText(templates: DivisionTemplate[]) {
  let code = 'units = {\n';
  templates.forEach((t) => {
    code += `\tdivision_template = {\n\t\tname = "${t.name}"\n\n`;

    code += `\t\tregiments = {\n`;
    t.regiments.forEach((row, rIdx) => {
      row.forEach((unit, cIdx) => {
        if (unit) {
          code += `\t\t\t${unit} = { x = ${cIdx} y = ${rIdx} }\n`;
        }
      });
    });
    code += `\t\t}\n\n`;

    code += `\t\tsupport = {\n`;
    t.support.forEach((unit, idx) => {
      if (unit) {
        code += `\t\t\t${unit} = { x = 0 y = ${idx} }\n`;
      }
    });
    code += `\t\t}\n`;
    code += '\t}\n';
  });
  code += '}';
  return code;
}

export function generateEconomyText(config: EconomyConfig) {
  return [
    '### Economy Configuration (Millennium Dawn Style)',
    `set_variable = { global.gdp = ${config.gdp} }`,
    `set_variable = { global.gdp_per_capita = ${config.gdpPerCapita} }`,
    `set_variable = { global.debt = ${config.debt} }`,
    `set_variable = { global.corporate_tax = ${config.corporateTax} }`,
    `set_variable = { global.population_tax = ${config.populationTax} }`,
    '',
    '### Modifiers',
    `add_timed_modifier = { name = foreign_investment_bonus days = -1 value = ${config.foreignInvestmentFactor} }`,
  ].join('\n');
}

export function generateMissilesText(missiles: MissileType[]) {
  if (missiles.length === 0) return '';
  const lines = ['### Missile Systems (Millennium Dawn)'];
  missiles.forEach((m) => {
    lines.push(`${m.id} = {`);
    lines.push(`\tname = "${m.name}"`);
    lines.push(`\tcategory = ${m.category}`);
    lines.push(`\trange = ${m.rangeKm}`);
    lines.push(`\twarhead_yield = ${m.warheadYield}`);
    lines.push(`\taccuracy = ${m.accuracy}`);
    lines.push(`\tsilos_required = ${m.silosRequired}`);
    lines.push(`\trequires_nuclear = ${m.requiresNuclear ? 'yes' : 'no'}`);
    lines.push('}');
  });
  return lines.join('\n');
}

export function generateTechTreeText(nodes: Node[], edges: Edge[]) {
  if (nodes.length === 0) return '';

  const formattedTechs = nodes.map((node) => {
    const nodeData = (node.data ?? {}) as TechNodeData;
    const prerequisites = edges
      .filter((e) => e.target === node.id)
      .map((e) => {
        const src = nodes.find((n) => n.id === e.source);
        const srcData = (src?.data ?? {}) as TechNodeData;
        return src ? srcData.id : null;
      })
      .filter((v): v is string => Boolean(v));

    return {
      id: nodeData.id,
      folder: nodeData.category,
      cost: nodeData.cost,
      dependencies: prerequisites,
    };
  });

  return serializeClausewitz({ technologies: formattedTechs });
}

export function generatePartiesText(parties: PoliticalParty[]) {
  if (parties.length === 0) return '';
  const lines = ['### Political Parties (Kaiserreich)'];
  parties.forEach((p) => {
    lines.push(`set_party_name = { ideology = ${p.ideology} long_name = "${p.longName}" name = "${p.name}" }`);
    lines.push(`set_party_popularity = { ideology = ${p.ideology} popularity = ${p.popularity / 100} }`);
    if (p.isRuling) {
      lines.push(`set_politics = { ruling_party = ${p.ideology} }`);
    }
  });
  return lines.join('\n');
}

export function generateCivilConflictsText(conflicts: CivilConflict[]) {
  if (conflicts.length === 0) return '';
  const formattedConflicts = conflicts.map((c) => ({
    id: c.id,
    name: `"${c.name}"`,
    war_type: c.warType,
    rebel_tag: c.rebelTag,
    rebel_ideology: c.rebelIdeology,
    rebel_mil_strength: c.rebelMilStrength,
    starting_state: c.startingState,
    trigger: { __raw: c.triggerScript },
    on_start: { __raw: c.onStartEffect },
  }));
  return serializeClausewitz({ civil_conflicts: formattedConflicts });
}

export function generateMonarchyText(config: MonarchyConfig) {
  if (!config.countryTag) return '';

  const pretenders = config.pretenders.map((p) => ({
    id: p.id,
    name: `"${p.name}"`,
    title: `"${p.title}"`,
    ideology: p.ideology,
    claim_strength: p.claimStrength,
  }));

  return serializeClausewitz({
    monarchy_setup: {
      tag: config.countryTag,
      royal_house: `"${config.royalHouseName}"`,
      form: config.monarchyForm,
      current_monarch: `"${config.currentMonarchName}"`,
      pretender: pretenders,
    },
  });
}

export function generateTNOText(variables: TNOVariable[], paths: IdeologyPath[]) {
  if (variables.length === 0 && paths.length === 0) return '';
  const lines = ['### TNO Variables and Paths'];

  variables.forEach((v) => {
    lines.push(`${v.op} = { var = ${v.id} value = ${v.value} } # ${v.comment}`);
  });

  paths.forEach((p) => {
    lines.push(`set_ideology_path = { ideology = ${p.rootIdeology} name = "${p.displayName}" }`);
  });

  return lines.join('\n');
}

export function exportModFiles() {
  const state = useModStore.getState();
  const {
    nodes,
    edges,
    events,
    spirits,
    decisionCategories,
    leaders,
    localizations,
    states,
    divisionTemplates,
    economyConfig,
    missiles,
    techNodes,
    techEdges,
    politicalParties,
    civilConflicts,
    monarchyConfig,
    tnoVariables,
    tnoPaths,
  } = state;

  const downloadFile = (filename: string, content: string) => {
    if (!content) return;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  downloadFile('my_custom_focus_tree.txt', generateFocusTreeText(nodes, edges));
  downloadFile('my_events.txt', generateEventsText(events));
  downloadFile('my_ideas.txt', generateIdeasText(spirits));
  downloadFile('my_decisions.txt', generateDecisionsText(decisionCategories));

  if (leaders.length > 0) downloadFile('my_characters.txt', generateCharactersText(leaders));

  downloadFile('my_mod_l_english.yml', generateLocalizationText(localizations, 'english'));

  if (economyConfig.gdp > 0) downloadFile('economy_setup.txt', generateEconomyText(economyConfig));
  if (missiles.length > 0) downloadFile('missile_systems.txt', generateMissilesText(missiles));
  if (techNodes.length > 0) downloadFile('tech_tree.txt', generateTechTreeText(techNodes, techEdges));
  if (politicalParties.length > 0) downloadFile('political_parties.txt', generatePartiesText(politicalParties));
  if (civilConflicts.length > 0) downloadFile('civil_conflicts.txt', generateCivilConflictsText(civilConflicts));
  if (monarchyConfig.countryTag) downloadFile('monarchy_setup.txt', generateMonarchyText(monarchyConfig));
  if (tnoVariables.length > 0 || tnoPaths.length > 0) downloadFile('tno_content.txt', generateTNOText(tnoVariables, tnoPaths));

  states.forEach((stateItem) => {
    downloadFile(`state_${stateItem.id}.txt`, generateStateText(stateItem));
  });

  if (divisionTemplates.length > 0) {
    downloadFile('my_division_templates.txt', generateDivisionsText(divisionTemplates));
  }
}
