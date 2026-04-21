import type { BaseModType } from './modDictionaries';

export interface ModContentConfig {
  id: BaseModType;
  name: string;
  primaryColor: string;
  accentColor: string;
  themeClass: string;
  tools: string[]; // List of tool IDs enabled for this mod
}

export const baseModContent: Record<BaseModType, ModContentConfig> = {
  vanilla: {
    id: 'vanilla',
    name: 'Vanilla / Historical',
    primaryColor: '#d97706', // amber-600
    accentColor: '#fbbf24', // amber-400
    themeClass: 'theme-vanilla',
    tools: ['focus', 'events', 'leaders', 'spirits', 'decisions', 'localization', 'map', 'division_designer', 'monarchy', 'assets', 'code', 'scripting', 'macros', 'community']
  },
  millennium_dawn: {
    id: 'millennium_dawn',
    name: 'Millennium Dawn',
    primaryColor: '#0891b2', // cyan-600
    accentColor: '#22d3ee', // cyan-400
    themeClass: 'theme-md',
    tools: ['focus', 'events', 'leaders', 'spirits', 'decisions', 'localization', 'map', 'division_designer', 'economy', 'missiles', 'techtree', 'parties', 'conflicts', 'assets', 'code', 'scripting', 'macros', 'community']
  },
  kaiserreich: {
    id: 'kaiserreich',
    name: 'Kaiserreich',
    primaryColor: '#b45309', // amber-700
    accentColor: '#f59e0b', // amber-500
    themeClass: 'theme-kr',
    tools: ['focus', 'events', 'leaders', 'spirits', 'decisions', 'localization', 'map', 'division_designer', 'assets', 'code', 'scripting', 'macros', 'community']
  },
  tno: {
    id: 'tno',
    name: 'The New Order',
    primaryColor: '#7e22ce', // purple-700
    accentColor: '#a855f7', // purple-500
    themeClass: 'theme-tno',
    tools: ['focus', 'events', 'leaders', 'spirits', 'decisions', 'localization', 'map', 'division_designer', 'tno_vars', 'tno_paths', 'assets', 'code', 'scripting', 'macros', 'community']
  },
  road_to_56: {
    id: 'road_to_56',
    name: 'Road to 56',
    primaryColor: '#059669', // emerald-600
    accentColor: '#10b981', // emerald-500
    themeClass: 'theme-r56',
    tools: ['focus', 'events', 'leaders', 'spirits', 'decisions', 'localization', 'map', 'division_designer', 'monarchy', 'assets', 'code', 'scripting', 'macros', 'community']
  }
};
