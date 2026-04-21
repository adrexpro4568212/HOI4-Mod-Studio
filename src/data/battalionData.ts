import type { BaseModType } from "./modDictionaries";

export interface BattalionType {
  id: string;
  name: string;
  category: 'infantry' | 'mobile' | 'armor' | 'artillery' | 'support' | 'special';
  icon: string;
  stats: {
    combat_width: number;
    soft_attack: number;
    hard_attack: number;
    defense: number;
    breakthrough: number;
    training_time?: number;
  };
}

export const MOD_BATTALIONS: Record<BaseModType, BattalionType[]> = {
  vanilla: [
    { id: 'infantry', name: 'Infantry', category: 'infantry', icon: 'infantry_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 2 } },
    { id: 'artillery', name: 'Artillery', category: 'artillery', icon: 'artillery_icon', stats: { combat_width: 3, soft_attack: 25, hard_attack: 1, defense: 10, breakthrough: 5 } },
    { id: 'light_armor', name: 'Light Tank', category: 'armor', icon: 'light_tank_icon', stats: { combat_width: 2, soft_attack: 10, hard_attack: 4, defense: 15, breakthrough: 25 } },
    { id: 'motorized', name: 'Motorized', category: 'mobile', icon: 'motorized_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 4 } },
  ],
  millennium_dawn: [
    { id: 'modern_infantry', name: 'Modern Infantry', category: 'infantry', icon: 'modern_inf_icon', stats: { combat_width: 2, soft_attack: 15, hard_attack: 8, defense: 45, breakthrough: 10 } },
    { id: 'mechanized_infantry', name: 'Mechanized', category: 'mobile', icon: 'mech_inf_icon', stats: { combat_width: 2, soft_attack: 25, hard_attack: 15, defense: 60, breakthrough: 35 } },
    { id: 'mbt', name: 'Main Battle Tank', category: 'armor', icon: 'mbt_icon', stats: { combat_width: 3, soft_attack: 45, hard_attack: 55, defense: 40, breakthrough: 85 } },
    { id: 'attack_heli', name: 'Attack Heli', category: 'special', icon: 'heli_icon', stats: { combat_width: 1, soft_attack: 60, hard_attack: 45, defense: 5, breakthrough: 15 } },
  ],
  kaiserreich: [
    { id: 'infantry', name: 'Infantry', category: 'infantry', icon: 'infantry_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 2 } },
    { id: 'militia', name: 'Militia', category: 'infantry', icon: 'militia_icon', stats: { combat_width: 1, soft_attack: 1, hard_attack: 0.1, defense: 10, breakthrough: 0.5 } },
    { id: 'irregulars', name: 'Irregulars', category: 'infantry', icon: 'irreg_icon', stats: { combat_width: 1, soft_attack: 2, hard_attack: 0.2, defense: 15, breakthrough: 1 } },
  ],
  tno: [
    { id: 'infantry', name: 'Infantry', category: 'infantry', icon: 'infantry_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 2 } },
    { id: 'airborne', name: 'Airborne', category: 'special', icon: 'airborne_icon', stats: { combat_width: 2, soft_attack: 4, hard_attack: 0.8, defense: 18, breakthrough: 3 } },
    { id: 'elite_infantry', name: 'Elite Infantry', category: 'special', icon: 'elite_inf_icon', stats: { combat_width: 2, soft_attack: 8, hard_attack: 2, defense: 35, breakthrough: 8 } },
  ],
  road_to_56: [
    { id: 'infantry', name: 'Infantry', category: 'infantry', icon: 'infantry_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 2 } },
    { id: 'bicycle_infantry', name: 'Bicycle Inf', category: 'mobile', icon: 'bike_icon', stats: { combat_width: 2, soft_attack: 3, hard_attack: 0.5, defense: 20, breakthrough: 3 } },
    { id: 'jungle_infantry', name: 'Jungle Inf', category: 'special', icon: 'jungle_icon', stats: { combat_width: 2, soft_attack: 4, hard_attack: 0.5, defense: 25, breakthrough: 2 } },
  ],
};
