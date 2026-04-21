export type BaseModType = 'vanilla' | 'millennium_dawn' | 'kaiserreich' | 'tno' | 'road_to_56';

export interface Unit {
  id: string;
  name: string;
  type: 'infantry' | 'armor' | 'mobile' | 'artillery' | 'support';
}

export interface ModDictionary {
  ideologies: { id: string; name: string }[];
  leaderTraits: { id: string; name: string }[];
  modifiers: { id: string; name: string }[];
  battalions: Unit[];
  supportUnits: Unit[];
}

export const modDictionaries: Record<BaseModType, ModDictionary> = {
  vanilla: {
    ideologies: [
      { id: 'democratic', name: 'Democratic' },
      { id: 'fascism', name: 'Fascism' },
      { id: 'communism', name: 'Communism' },
      { id: 'neutrality', name: 'Non-Aligned' }
    ],
    leaderTraits: [
      { id: 'dictator', name: 'Dictator' },
      { id: 'democratic_reformer', name: 'Democratic Reformer' },
      { id: 'communist_revolutionary', name: 'Communist Revolutionary' },
      { id: 'fascist_demagogue', name: 'Fascist Demagogue' },
      { id: 'captain_of_industry', name: 'Captain of Industry' },
      { id: 'fortification_engineer', name: 'Fortification Engineer' }
    ],
    modifiers: [
      { id: 'political_power_gain', name: 'Political Power Gain' },
      { id: 'stability_factor', name: 'Stability' },
      { id: 'war_support_factor', name: 'War Support' },
      { id: 'consumer_goods_expected_multiplier', name: 'Consumer Goods Factories' },
      { id: 'industrial_capacity_factory', name: 'Factory Output' },
      { id: 'production_factory_max_efficiency_factor', name: 'Production Efficiency Cap' },
      { id: 'research_speed_factor', name: 'Research Speed' },
      { id: 'training_time_army_factor', name: 'Division Training Time' },
      { id: 'army_org_factor', name: 'Army Organization' }
    ],
    battalions: [
      { id: 'infantry', name: 'Infantry', type: 'infantry' },
      { id: 'artillery_brigade', name: 'Artillery', type: 'artillery' },
      { id: 'anti_tank_brigade', name: 'Anti-Tank', type: 'artillery' },
      { id: 'anti_air_brigade', name: 'Anti-Air', type: 'artillery' },
      { id: 'cavalry', name: 'Cavalry', type: 'mobile' },
      { id: 'motorized', name: 'Motorized', type: 'mobile' },
      { id: 'mechanized', name: 'Mechanized', type: 'mobile' },
      { id: 'light_armor', name: 'Light Tank', type: 'armor' },
      { id: 'medium_armor', name: 'Medium Tank', type: 'armor' },
      { id: 'heavy_armor', name: 'Heavy Tank', type: 'armor' }
    ],
    supportUnits: [
      { id: 'engineer', name: 'Engineers', type: 'support' },
      { id: 'recon', name: 'Reconnaissance', type: 'support' },
      { id: 'military_police', name: 'Military Police', type: 'support' },
      { id: 'maintenance_company', name: 'Maintenance', type: 'support' },
      { id: 'field_hospital', name: 'Field Hospital', type: 'support' },
      { id: 'signal_company', name: 'Signal Company', type: 'support' },
      { id: 'logistic_company', name: 'Logistics', type: 'support' }
    ]
  },
  millennium_dawn: {
    ideologies: [
      { id: 'western_outlook', name: 'Western Outlook' },
      { id: 'emerging_outlook', name: 'Emerging Outlook' },
      { id: 'nationalist_outlook', name: 'Nationalist Outlook' },
      { id: 'salafist_outlook', name: 'Salafist Outlook' },
      { id: 'non_aligned', name: 'Non-Aligned' }
    ],
    leaderTraits: [
      { id: 'md_corrupt_leader', name: 'Corrupt Leader' },
      { id: 'md_economic_reformer', name: 'Economic Reformer' },
      { id: 'md_military_background', name: 'Military Background' },
      { id: 'md_oligarch_puppet', name: 'Oligarch Puppet' },
      { id: 'md_islamic_scholar', name: 'Islamic Scholar' },
      { id: 'md_eu_enthusiast', name: 'EU Enthusiast' }
    ],
    modifiers: [
      { id: 'tax_cost', name: 'Tax Rate Modifier' },
      { id: 'gdp_growth', name: 'GDP Growth Rate' },
      { id: 'energy_cost', name: 'Energy Consumption' },
      { id: 'weekly_population', name: 'Population Growth' },
      { id: 'foreign_investment_factor', name: 'Foreign Investment Attraction' },
      { id: 'corruption_factor', name: 'Corruption Level' },
      { id: 'political_power_gain', name: 'Political Power Gain' },
      { id: 'stability_factor', name: 'Stability' }
    ],
    battalions: [
      { id: 'light_infantry', name: 'Light Infantry', type: 'infantry' },
      { id: 'mechanized_infantry', name: 'Mechanized Infantry', type: 'infantry' },
      { id: 'motorized_infantry', name: 'Motorized Infantry', type: 'infantry' },
      { id: 'marine_infantry', name: 'Marines', type: 'infantry' },
      { id: 'main_battle_tank', name: 'MBT (Main Battle Tank)', type: 'armor' },
      { id: 'light_tank', name: 'Light Tank', type: 'armor' },
      { id: 'ifv', name: 'IFV (Infantry Fighting Vehicle)', type: 'armor' },
      { id: 'apc', name: 'APC (Armored Personnel Carrier)', type: 'armor' },
      { id: 'sp_artillery', name: 'Self-Propelled Artillery', type: 'artillery' },
      { id: 'mlrs', name: 'MLRS', type: 'artillery' }
    ],
    supportUnits: [
      { id: 'combat_engineer', name: 'Combat Engineers', type: 'support' },
      { id: 'uav_recon', name: 'UAV Reconnaissance', type: 'support' },
      { id: 'electronic_warfare', name: 'Electronic Warfare', type: 'support' },
      { id: 'attack_helicopter', name: 'Attack Helicopters', type: 'support' },
      { id: 'transport_helicopter', name: 'Transport Helicopters', type: 'support' }
    ]
  },
  kaiserreich: {
    ideologies: [
      { id: 'totalist', name: 'Totalist' },
      { id: 'syndicalist', name: 'Syndicalist' },
      { id: 'radical_socialist', name: 'Radical Socialist' },
      { id: 'social_democrat', name: 'Social Democrat' },
      { id: 'social_liberal', name: 'Social Liberal' },
      { id: 'market_liberal', name: 'Market Liberal' },
      { id: 'social_conservative', name: 'Social Conservative' },
      { id: 'authoritarian_democrat', name: 'Authoritarian Democrat' },
      { id: 'paternal_autocrat', name: 'Paternal Autocrat' },
      { id: 'national_populist', name: 'National Populist' }
    ],
    leaderTraits: [
      { id: 'kr_syndicalist_sympathizer', name: 'Syndicalist Sympathizer' },
      { id: 'kr_reactionary', name: 'Reactionary' },
      { id: 'kr_pragmatist', name: 'Pragmatist' },
      { id: 'kr_military_junta_leader', name: 'Military Junta Leader' }
    ],
    modifiers: [
      { id: 'political_power_gain', name: 'Political Power Gain' },
      { id: 'stability_factor', name: 'Stability' },
      { id: 'war_support_factor', name: 'War Support' },
      { id: 'production_factory_max_efficiency_factor', name: 'Production Efficiency Cap' },
      { id: 'party_popularity_totalist', name: 'Totalist Popularity' },
      { id: 'party_popularity_syndicalist', name: 'Syndicalist Popularity' }
    ],
    battalions: [
      { id: 'infantry', name: 'Infantry', type: 'infantry' },
      { id: 'militia', name: 'Militia', type: 'infantry' },
      { id: 'artillery_brigade', name: 'Artillery', type: 'artillery' },
      { id: 'cavalry', name: 'Cavalry', type: 'mobile' },
      { id: 'light_armor', name: 'Light Tank', type: 'armor' },
      { id: 'medium_armor', name: 'Medium Tank', type: 'armor' }
    ],
    supportUnits: [
      { id: 'engineer', name: 'Engineers', type: 'support' },
      { id: 'recon', name: 'Reconnaissance', type: 'support' },
      { id: 'signal_company', name: 'Signal Company', type: 'support' }
    ]
  },
  tno: {
    ideologies: [
      { id: 'burgundian_system', name: 'Burgundian System' },
      { id: 'national_socialism', name: 'National Socialism' },
      { id: 'fascism', name: 'Fascism' },
      { id: 'despotism', name: 'Despotism' },
      { id: 'authoritarian_democrat', name: 'Authoritarian Democracy' },
      { id: 'conservative_democrat', name: 'Conservative Democracy' },
      { id: 'liberal_democrat', name: 'Liberal Democracy' },
      { id: 'social_democrat', name: 'Social Democracy' },
      { id: 'socialist', name: 'Socialism' },
      { id: 'communist', name: 'Communism' }
    ],
    leaderTraits: [
      { id: 'tno_reformer', name: 'Reformer' },
      { id: 'tno_hardliner', name: 'Hardliner' },
      { id: 'tno_megacorporation_ceo', name: 'Megacorporation CEO' },
      { id: 'tno_ss_officer', name: 'SS Officer' },
      { id: 'tno_liberator', name: 'Liberator' }
    ],
    modifiers: [
      { id: 'gdp_growth', name: 'GDP Growth' },
      { id: 'poverty_rate', name: 'Poverty Rate' },
      { id: 'inflation_rate', name: 'Inflation Rate' },
      { id: 'debt_to_gdp', name: 'Debt to GDP Ratio' },
      { id: 'political_power_gain', name: 'Political Power Gain' },
      { id: 'stability_factor', name: 'Stability' }
    ],
    battalions: [
      { id: 'elite_infantry', name: 'Elite Infantry', type: 'infantry' },
      { id: 'infantry', name: 'Infantry', type: 'infantry' },
      { id: 'motorized_infantry', name: 'Motorized Infantry', type: 'mobile' },
      { id: 'heliborne_infantry', name: 'Heliborne Infantry', type: 'mobile' },
      { id: 'mbt', name: 'MBT (Main Battle Tank)', type: 'armor' },
      { id: 'ifv', name: 'IFV', type: 'armor' }
    ],
    supportUnits: [
      { id: 'engineer', name: 'Engineers', type: 'support' },
      { id: 'recon', name: 'Reconnaissance', type: 'support' },
      { id: 'attack_helicopter_support', name: 'CAS Helicopters', type: 'support' }
    ]
  },
  road_to_56: {
    ideologies: [
      { id: 'democratic', name: 'Democratic' },
      { id: 'fascism', name: 'Fascism' },
      { id: 'communism', name: 'Communism' },
      { id: 'neutrality', name: 'Non-Aligned' },
      { id: 'monarchism', name: 'Monarchism' }
    ],
    leaderTraits: [
      { id: 'r56_monarchist_sympathizer', name: 'Monarchist Sympathizer' },
      { id: 'r56_veteran_commander', name: 'Veteran Commander' },
      { id: 'r56_innovator', name: 'Innovator' },
      { id: 'r56_dictator', name: 'Dictator' },
      { id: 'democratic_reformer', name: 'Democratic Reformer' }
    ],
    modifiers: [
      { id: 'political_power_gain', name: 'Political Power Gain' },
      { id: 'stability_factor', name: 'Stability' },
      { id: 'war_support_factor', name: 'War Support' },
      { id: 'consumer_goods_expected_multiplier', name: 'Consumer Goods Factories' },
      { id: 'industrial_capacity_factory', name: 'Factory Output' },
      { id: 'research_speed_factor', name: 'Research Speed' },
      { id: 'training_time_army_factor', name: 'Division Training Time' },
      { id: 'special_forces_cap', name: 'Special Forces Capacity' }
    ],
    battalions: [
      { id: 'infantry', name: 'Infantry', type: 'infantry' },
      { id: 'bicycle_infantry', name: 'Bicycle Infantry', type: 'infantry' },
      { id: 'shock_infantry', name: 'Shock Infantry', type: 'infantry' },
      { id: 'jungle_infantry', name: 'Jungle Infantry', type: 'infantry' },
      { id: 'motorized', name: 'Motorized', type: 'mobile' },
      { id: 'light_armor', name: 'Light Tank', type: 'armor' },
      { id: 'medium_armor', name: 'Medium Tank', type: 'armor' }
    ],
    supportUnits: [
      { id: 'engineer', name: 'Engineers', type: 'support' },
      { id: 'recon', name: 'Reconnaissance', type: 'support' },
      { id: 'maintenance_company', name: 'Maintenance', type: 'support' }
    ]
  }
};
