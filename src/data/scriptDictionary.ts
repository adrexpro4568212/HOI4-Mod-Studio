export interface HOI4Command {
  id: string;
  name: string;
  description: string;
  type: 'effect' | 'trigger';
  snippet: string;
  parameters?: string[];
}

export const scriptDictionary: HOI4Command[] = [
  // EFFECTS
  {
    id: 'add_political_power',
    name: 'Add Political Power',
    description: 'Increases or decreases the country\'s political power.',
    type: 'effect',
    snippet: 'add_political_power = ${1:100}',
    parameters: ['Amount']
  },
  {
    id: 'add_stability',
    name: 'Add Stability',
    description: 'Changes the base stability of the country.',
    type: 'effect',
    snippet: 'add_stability = ${1:0.05}',
    parameters: ['Value (0.01 = 1%)']
  },
  {
    id: 'add_war_support',
    name: 'Add War Support',
    description: 'Changes the war support of the country.',
    type: 'effect',
    snippet: 'add_war_support = ${1:0.05}',
    parameters: ['Value']
  },
  {
    id: 'create_wargoal',
    name: 'Create War Goal',
    description: 'Creates a war goal against a target country.',
    type: 'effect',
    snippet: 'create_wargoal = {\n\ttype = ${1:take_state}\n\ttarget = ${2:TAG}\n}',
    parameters: ['Type', 'Target TAG']
  },
  {
    id: 'set_technology',
    name: 'Set Technology',
    description: 'Unlocks a specific technology.',
    type: 'effect',
    snippet: 'set_technology = { ${1:tech_id} = 1 }',
    parameters: ['Tech ID']
  },

  // TRIGGERS
  {
    id: 'has_war_with',
    name: 'Has War With',
    description: 'Checks if the country is at war with another.',
    type: 'trigger',
    snippet: 'has_war_with = ${1:TAG}',
    parameters: ['Target TAG']
  },
  {
    id: 'is_in_faction',
    name: 'Is in Faction',
    description: 'Checks if the country is part of a faction.',
    type: 'trigger',
    snippet: 'is_in_faction = yes',
    parameters: ['Yes/No']
  },
  {
    id: 'has_government',
    name: 'Has Government',
    description: 'Checks the ruling ideology.',
    type: 'trigger',
    snippet: 'has_government = ${1:fascism}',
    parameters: ['Ideology']
  }
];
