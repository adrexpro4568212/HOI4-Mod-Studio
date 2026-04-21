import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { useModStore } from '../../store/useModStore';
import { DollarSign, TrendingUp, Sliders, Code2, Copy, Check, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EconomyPreset {
  id: string;
  label: string;
  desc: string;
  color: string;
  values: Partial<EconomyConfig>;
}

export interface EconomyConfig {
  countryTag: string;
  economyType: string;
  gdp: number;
  gdpPerCapita: number;
  corporateTax: number;
  populationTax: number;
  debt: number;
  debtInterest: number;
  corruptionLevel: number;
  foreignInvestmentFactor: number;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const ECONOMY_PRESETS: EconomyPreset[] = [
  {
    id: 'nordic',
    label: 'Nordic Model',
    desc: 'High taxes, high welfare, low corruption.',
    color: 'border-blue-500/50 bg-blue-500/5',
    values: { economyType: 'state_economy', corporateTax: 0.45, populationTax: 0.35, corruptionLevel: 0.05, foreignInvestmentFactor: 0.4 }
  },
  {
    id: 'liberal',
    label: 'Liberal Market',
    desc: 'Low taxes, open markets, high FDI attraction.',
    color: 'border-green-500/50 bg-green-500/5',
    values: { economyType: 'market_economy', corporateTax: 0.2, populationTax: 0.18, corruptionLevel: 0.1, foreignInvestmentFactor: 0.8 }
  },
  {
    id: 'mercantile',
    label: 'Mercantilist',
    desc: 'Mixed economy, protectionist, moderate taxes.',
    color: 'border-amber-500/50 bg-amber-500/5',
    values: { economyType: 'mixed_economy', corporateTax: 0.3, populationTax: 0.25, corruptionLevel: 0.15, foreignInvestmentFactor: 0.3 }
  },
  {
    id: 'developing',
    label: 'Developing Nation',
    desc: 'Low GDP/c, high growth potential, high corruption.',
    color: 'border-orange-500/50 bg-orange-500/5',
    values: { economyType: 'mixed_economy', corporateTax: 0.22, populationTax: 0.12, corruptionLevel: 0.4, foreignInvestmentFactor: 0.5 }
  },
  {
    id: 'oligarchic',
    label: 'Oligarchic State',
    desc: 'Low taxes for elites, very high corruption.',
    color: 'border-red-500/50 bg-red-500/5',
    values: { economyType: 'mixed_economy', corporateTax: 0.12, populationTax: 0.1, corruptionLevel: 0.7, foreignInvestmentFactor: 0.15 }
  },
];

const ECONOMY_TYPES = [
  { id: 'state_economy', label: 'State Economy' },
  { id: 'mixed_economy', label: 'Mixed Economy' },
  { id: 'market_economy', label: 'Market Economy' },
  { id: 'planned_economy', label: 'Planned Economy' },
  { id: 'semi_planned_economy', label: 'Semi-Planned Economy' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function pct(v: number) { return `${Math.round(v * 100)}%`; }
function fmt(v: number) { return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v); }

interface SectionPanelProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}

function SectionPanel({ id, title, isOpen, onToggle, children }: SectionPanelProps) {
  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-semibold text-amber-500 uppercase tracking-wider">{title}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 grid grid-cols-2 gap-4">{children}</div>}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

function FieldRow({ label, hint, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {hint && <p className="text-[10px] text-gray-600 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EconomyEditor() {
  const { economyConfig, setEconomyConfig } = useModStore();
  const config = economyConfig;
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>('basic');

  useEffect(() => {
    if (!economyConfig.countryTag) {
      setEconomyConfig({ countryTag: 'GER' });
    }
  }, [economyConfig.countryTag, setEconomyConfig]);

  const update = (partial: Partial<EconomyConfig>) => setEconomyConfig(partial);

  const applyPreset = (preset: EconomyPreset) => {
    setEconomyConfig(preset.values);
    setActivePreset(preset.id);
  };

  const generatedCode = useMemo(() => {
    const tag = economyConfig.countryTag.toUpperCase();
    const config = economyConfig;
    const lines: string[] = [
      `### ${tag} Economy Initialization — Generated by HOI4 Mod Studio`,
      `### Paste this in your country's on_startup scripted_effect or history file`,
      ``,
      `${tag}_initialize_economy = {`,
      `\tset_variable = { md_${tag.toLowerCase()}_economy_type = ${config.economyType} }`,
      `\tset_variable = { md_gdp = ${config.gdp} }`,
      `\tset_variable = { md_gdppc = ${config.gdpPerCapita} }`,
      `\tset_variable = { md_corporate_tax = ${config.corporateTax.toFixed(2)} }`,
      `\tset_variable = { md_population_tax = ${config.populationTax.toFixed(2)} }`,
      `\tset_variable = { md_debt = ${config.debt} }`,
      `\tset_variable = { md_debt_interest = ${config.debtInterest.toFixed(3)} }`,
      `\tset_variable = { md_corruption = ${config.corruptionLevel.toFixed(2)} }`,
      `\tset_variable = { md_foreign_investment_factor = ${config.foreignInvestmentFactor.toFixed(2)} }`,
      `}`,
    ];
    return lines.join('\n');
  }, [economyConfig]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const inputCls = "bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none w-full";
  const sliderCls = "w-full accent-amber-500 cursor-pointer";

  return (
    <div className="w-full h-full flex bg-[#121212] overflow-hidden">
      {/* ── Left Column: Form ── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <DollarSign size={20} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Economy Editor</h2>
            <p className="text-xs text-gray-500">Millennium Dawn — Country Economic Setup</p>
          </div>
        </div>

        {/* Presets */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">Quick Presets</h3>
          <div className="grid grid-cols-5 gap-2">
            {ECONOMY_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                title={p.desc}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all hover:scale-105 ${
                  activePreset === p.id ? p.color + ' border-opacity-100' : 'border-gray-700 bg-[#111] hover:border-gray-500'
                }`}
              >
                <span className="text-gray-200 text-[11px] leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Country Tag */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-gray-400">Country TAG</label>
            <input
              type="text"
              value={config.countryTag}
              onChange={e => update({ countryTag: e.target.value.toUpperCase().slice(0, 3) })}
              maxLength={3}
              className={`${inputCls} w-20 font-mono text-center text-lg font-bold uppercase`}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-gray-400">Economy System</label>
            <select value={config.economyType} onChange={e => update({ economyType: e.target.value })} className={inputCls}>
              {ECONOMY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* GDP */}
        <SectionPanel id="basic" title="📊 GDP & Output" isOpen={openSection === 'basic'} onToggle={toggleSection}>
          <FieldRow label="Initial GDP (MD Units)" hint="Total economic output value">
            <input type="number" value={config.gdp} onChange={e => update({ gdp: Number(e.target.value) })} className={inputCls} step={1000} />
          </FieldRow>
          <FieldRow label="GDP per Capita" hint="Wealth per person — affects research & stability">
            <input type="number" value={config.gdpPerCapita} onChange={e => update({ gdpPerCapita: Number(e.target.value) })} className={inputCls} step={500} />
          </FieldRow>
        </SectionPanel>

        {/* Taxes */}
        <SectionPanel id="taxes" title="💰 Taxation" isOpen={openSection === 'taxes'} onToggle={toggleSection}>
          <FieldRow label={`Corporate Tax Rate: ${pct(config.corporateTax)}`} hint="Tax on businesses. Too high = instability.">
            <input type="range" min={0} max={1} step={0.01} value={config.corporateTax}
              onChange={e => update({ corporateTax: Number(e.target.value) })} className={sliderCls} />
          </FieldRow>
          <FieldRow label={`Population Tax Rate: ${pct(config.populationTax)}`} hint="Tax on citizens. Too high = unrest.">
            <input type="range" min={0} max={1} step={0.01} value={config.populationTax}
              onChange={e => update({ populationTax: Number(e.target.value) })} className={sliderCls} />
          </FieldRow>
        </SectionPanel>

        {/* Debt */}
        <SectionPanel id="debt" title="🏦 Debt & Interest" isOpen={openSection === 'debt'} onToggle={toggleSection}>
          <FieldRow label="Starting Debt (MD Units)" hint="National debt carried into the game.">
            <input type="number" value={config.debt} onChange={e => update({ debt: Number(e.target.value) })} className={inputCls} step={1000} />
          </FieldRow>
          <FieldRow label={`Debt Interest Rate: ${pct(config.debtInterest)}`} hint="Annual interest on outstanding debt.">
            <input type="range" min={0} max={0.3} step={0.005} value={config.debtInterest}
              onChange={e => update({ debtInterest: Number(e.target.value) })} className={sliderCls} />
          </FieldRow>
        </SectionPanel>

        {/* Governance */}
        <SectionPanel id="gov" title="🏛 Governance" isOpen={openSection === 'gov'} onToggle={toggleSection}>
          <FieldRow label={`Corruption Level: ${pct(config.corruptionLevel)}`} hint="Higher = less efficient economy.">
            <input type="range" min={0} max={1} step={0.01} value={config.corruptionLevel}
              onChange={e => update({ corruptionLevel: Number(e.target.value) })} className={sliderCls} />
          </FieldRow>
          <FieldRow label={`Foreign Investment Factor: ${pct(config.foreignInvestmentFactor)}`} hint="Attractiveness to foreign capital.">
            <input type="range" min={0} max={1} step={0.01} value={config.foreignInvestmentFactor}
              onChange={e => update({ foreignInvestmentFactor: Number(e.target.value) })} className={sliderCls} />
          </FieldRow>
        </SectionPanel>
      </div>

      {/* ── Right Column: Dashboard + Code ── */}
      <div className="w-[400px] bg-[#161616] border-l border-gray-800 flex flex-col">
        {/* Dashboard KPIs */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={13} className="text-amber-500" /> Economy Dashboard
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'GDP', value: fmt(config.gdp), color: 'text-green-400' },
              { label: 'GDP/capita', value: fmt(config.gdpPerCapita), color: 'text-blue-400' },
              { label: 'Corp. Tax', value: pct(config.corporateTax), color: config.corporateTax > 0.5 ? 'text-red-400' : 'text-amber-400' },
              { label: 'Pop. Tax', value: pct(config.populationTax), color: config.populationTax > 0.4 ? 'text-red-400' : 'text-amber-400' },
              { label: 'Debt', value: fmt(config.debt), color: config.debt > 100_000 ? 'text-red-400' : 'text-gray-300' },
              { label: 'Interest', value: pct(config.debtInterest), color: config.debtInterest > 0.15 ? 'text-red-400' : 'text-gray-300' },
              { label: 'Corruption', value: pct(config.corruptionLevel), color: config.corruptionLevel > 0.5 ? 'text-red-400' : 'text-yellow-400' },
              { label: 'FDI Factor', value: pct(config.foreignInvestmentFactor), color: 'text-cyan-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Health indicator */}
          <div className="mt-3 p-3 bg-[#1a1a1a] border border-gray-800 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sliders size={10} /> Economy Health
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Tax Burden', val: (config.corporateTax + config.populationTax) / 2, warn: 0.4 },
                { label: 'Debt Risk', val: Math.min(config.debt / 200000, 1), warn: 0.5 },
                { label: 'Corruption', val: config.corruptionLevel, warn: 0.5 },
              ].map(bar => {
                const pctVal = Math.round(bar.val * 100);
                const isWarn = bar.val > bar.warn;
                return (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                      <span>{bar.label}</span><span>{pctVal}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isWarn ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${pctVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={13} className="text-amber-500" /> Generated Script
            </h3>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-500 transition-colors"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 overflow-auto">
            <pre className="text-xs font-mono text-gray-400 whitespace-pre leading-relaxed">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
