export interface UnitStats {
  soft_attack: number;
  hard_attack: number;
  breakthrough: number;
  defense: number;
  organization: number;
  combat_width: number;
}

export const unitStats: Record<string, UnitStats> = {
  // Vanilla / Common
  infantry: { soft_attack: 6, hard_attack: 1, breakthrough: 2, defense: 22, organization: 60, combat_width: 2 },
  artillery_brigade: { soft_attack: 25, hard_attack: 2, breakthrough: 6, defense: 10, organization: 0, combat_width: 3 },
  anti_tank_brigade: { soft_attack: 4, hard_attack: 15, breakthrough: 1, defense: 6, organization: 0, combat_width: 2 },
  anti_air_brigade: { soft_attack: 8, hard_attack: 4, breakthrough: 1, defense: 6, organization: 0, combat_width: 2 },
  cavalry: { soft_attack: 6, hard_attack: 1, breakthrough: 4, defense: 20, organization: 60, combat_width: 2 },
  motorized: { soft_attack: 6, hard_attack: 1, breakthrough: 4, defense: 22, organization: 60, combat_width: 2 },
  mechanized: { soft_attack: 8, hard_attack: 4, breakthrough: 12, defense: 30, organization: 60, combat_width: 2 },
  light_armor: { soft_attack: 12, hard_attack: 8, breakthrough: 30, defense: 10, organization: 10, combat_width: 2 },
  medium_armor: { soft_attack: 20, hard_attack: 15, breakthrough: 60, defense: 20, organization: 10, combat_width: 2 },
  heavy_armor: { soft_attack: 30, hard_attack: 25, breakthrough: 90, defense: 35, organization: 10, combat_width: 2 },

  // Millennium Dawn
  light_infantry: { soft_attack: 8, hard_attack: 2, breakthrough: 3, defense: 25, organization: 65, combat_width: 2 },
  mechanized_infantry: { soft_attack: 12, hard_attack: 10, breakthrough: 20, defense: 40, organization: 60, combat_width: 2 },
  motorized_infantry: { soft_attack: 10, hard_attack: 5, breakthrough: 8, defense: 30, organization: 60, combat_width: 2 },
  marine_infantry: { soft_attack: 10, hard_attack: 4, breakthrough: 6, defense: 28, organization: 70, combat_width: 2 },
  main_battle_tank: { soft_attack: 45, hard_attack: 40, breakthrough: 120, defense: 50, organization: 15, combat_width: 2 },
  ifv: { soft_attack: 18, hard_attack: 25, breakthrough: 40, defense: 35, organization: 20, combat_width: 2 },
  apc: { soft_attack: 10, hard_attack: 8, breakthrough: 15, defense: 30, organization: 25, combat_width: 2 },
  sp_artillery: { soft_attack: 40, hard_attack: 5, breakthrough: 10, defense: 15, organization: 5, combat_width: 3 },
  mlrs: { soft_attack: 60, hard_attack: 2, breakthrough: 5, defense: 8, organization: 2, combat_width: 3 },

  // TNO
  elite_infantry: { soft_attack: 12, hard_attack: 3, breakthrough: 6, defense: 35, organization: 75, combat_width: 2 },
  heliborne_infantry: { soft_attack: 15, hard_attack: 6, breakthrough: 12, defense: 20, organization: 55, combat_width: 2 },
  mbt: { soft_attack: 50, hard_attack: 45, breakthrough: 150, defense: 60, organization: 15, combat_width: 2 },

  // Support Units
  engineer: { soft_attack: 1, hard_attack: 0, breakthrough: 1, defense: 15, organization: 0, combat_width: 0 },
  recon: { soft_attack: 2, hard_attack: 1, breakthrough: 2, defense: 2, organization: 0, combat_width: 0 },
  military_police: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 1, organization: 0, combat_width: 0 },
  maintenance_company: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  field_hospital: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  signal_company: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  logistic_company: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  combat_engineer: { soft_attack: 2, hard_attack: 1, breakthrough: 2, defense: 20, organization: 0, combat_width: 0 },
  uav_recon: { soft_attack: 5, hard_attack: 2, breakthrough: 5, defense: 2, organization: 0, combat_width: 0 },
  electronic_warfare: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  attack_helicopter: { soft_attack: 30, hard_attack: 15, breakthrough: 10, defense: 5, organization: 0, combat_width: 0 },
  transport_helicopter: { soft_attack: 0, hard_attack: 0, breakthrough: 0, defense: 0, organization: 0, combat_width: 0 },
  attack_helicopter_support: { soft_attack: 35, hard_attack: 20, breakthrough: 15, defense: 5, organization: 0, combat_width: 0 },
};

export const calculateStats = (regiments: (string | null)[][], support: (string | null)[]) => {
  const total = {
    soft_attack: 0,
    hard_attack: 0,
    breakthrough: 0,
    defense: 0,
    organization: 0,
    combat_width: 0,
    unit_count: 0,
  };

  const processUnit = (unitId: string | null) => {
    if (!unitId || !unitStats[unitId]) return;
    const stats = unitStats[unitId];
    total.soft_attack += stats.soft_attack;
    total.hard_attack += stats.hard_attack;
    total.breakthrough += stats.breakthrough;
    total.defense += stats.defense;
    total.organization += stats.organization;
    total.combat_width += stats.combat_width;
    if (stats.organization > 0) total.unit_count++;
  };

  regiments.flat().forEach(processUnit);
  support.forEach(processUnit);

  // Average organization
  if (total.unit_count > 0) {
    total.organization = total.organization / total.unit_count;
  }

  return total;
};
