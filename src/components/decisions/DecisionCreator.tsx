import { useModStore } from '../../store/useModStore';
import { Plus, Trash2, Folder, Crosshair, Gift } from 'lucide-react';

const availableTriggers = [
  { id: 'has_political_power', name: 'Has Political Power' },
  { id: 'has_war', name: 'Is at War' },
  { id: 'has_stability', name: 'Stability > %' },
];

export default function DecisionCreator() {
  const {
    decisionCategories,
    activeCategoryIndex,
    activeDecisionIndex,
    setActiveCategoryIndex,
    setActiveDecisionIndex,
    addDecisionCategory,
    deleteDecisionCategory,
    updateActiveCategory,
    addDecisionToActiveCategory,
    deleteDecisionFromActiveCategory,
    updateActiveDecision
  } = useModStore();

  const activeCategory = decisionCategories[activeCategoryIndex];
  const activeDecision = activeDecisionIndex !== null ? activeCategory?.decisions[activeDecisionIndex] : null;

  if (!activeCategory) return null;

  return (
    <div className="flex h-full bg-[#121212] text-gray-200">
      {/* Left Sidebar - Categories & Decisions Tree */}
      <div className="w-72 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#222]">
          <h2 className="font-bold text-sm tracking-wider uppercase text-gray-400">Decisions</h2>
          <button 
            onClick={addDecisionCategory}
            className="p-1 hover:bg-gray-700 rounded text-amber-500 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {decisionCategories.map((category, catIdx) => (
            <div key={category.id} className="space-y-1">
              <div 
                onClick={() => setActiveCategoryIndex(catIdx)}
                className={`p-2 rounded cursor-pointer flex justify-between items-center transition-all group ${
                  activeCategoryIndex === catIdx && activeDecisionIndex === null
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'hover:bg-[#2a2a2a] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Folder size={16} className={activeCategoryIndex === catIdx ? 'text-amber-500' : 'text-gray-500'} />
                  <span className="truncate text-sm font-bold uppercase tracking-wider">{category.name || 'Unnamed Category'}</span>
                </div>
                {decisionCategories.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDecisionCategory(catIdx);
                    }}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              {/* Decisions in Category */}
              <div className="pl-6 space-y-1 border-l-2 border-gray-800 ml-3">
                {category.decisions.map((decision, decIdx) => (
                  <div
                    key={decision.id}
                    onClick={() => {
                      setActiveCategoryIndex(catIdx);
                      setActiveDecisionIndex(decIdx);
                    }}
                    className={`p-1.5 rounded cursor-pointer flex justify-between items-center transition-all group text-sm ${
                      activeCategoryIndex === catIdx && activeDecisionIndex === decIdx
                        ? 'text-amber-400 font-medium' 
                        : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate">{decision.name || 'New Decision'}</span>
                  </div>
                ))}
                
                {/* Add Decision Button */}
                {activeCategoryIndex === catIdx && (
                  <button
                    onClick={addDecisionToActiveCategory}
                    className="w-full text-left text-xs text-amber-500/70 hover:text-amber-400 p-1.5 rounded hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Decision
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white">
              {activeDecisionIndex === null ? 'Category Editor' : 'Decision Editor'}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeDecisionIndex === null 
                ? 'Configure the category that groups your decisions.' 
                : 'Configure costs, conditions, and rewards for this decision.'}
            </p>
          </div>

          <div className="bg-[#1c1b1b] p-6 rounded-lg shadow-lg border border-gray-800/50 space-y-8">
            {activeDecisionIndex === null ? (
              /* CATEGORY EDITOR */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Category Name</label>
                  <input 
                    type="text" 
                    value={activeCategory.name}
                    onChange={(e) => updateActiveCategory({ name: e.target.value })}
                    className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors text-lg"
                    placeholder="e.g. Foreign Policy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Category Icon</label>
                  <input 
                    type="text" 
                    value={activeCategory.icon}
                    onChange={(e) => updateActiveCategory({ icon: e.target.value })}
                    className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors"
                    placeholder="e.g. generic_icon"
                  />
                </div>
              </div>
            ) : activeDecision ? (
              /* DECISION EDITOR */
              <div className="space-y-8">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4 pr-8">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Decision Name</label>
                      <input 
                        type="text" 
                        value={activeDecision.name}
                        onChange={(e) => updateActiveDecision({ name: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors text-lg"
                        placeholder="e.g. Expand the Industry"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Cost (Political Power)</label>
                      <input 
                        type="number" 
                        value={activeDecision.cost}
                        onChange={(e) => updateActiveDecision({ cost: Number(e.target.value) })}
                        className="w-32 bg-[#0a0a0a] text-amber-400 font-mono border-b-2 border-transparent focus:border-amber-500 outline-none px-3 py-2 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteDecisionFromActiveCategory(activeDecisionIndex)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded transition-colors border border-red-400/30"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Triggers & Effects */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Triggers */}
                  <div className="bg-[#0a0a0a] rounded border border-gray-800 p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
                      <Crosshair size={16} className="text-blue-400" /> Conditions (Triggers)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Simplified trigger editor. Select requirement type.</p>
                    <div className="space-y-2">
                      <select 
                        value={activeDecision.trigger}
                        onChange={(e) => updateActiveDecision({ trigger: e.target.value })}
                        className="w-full bg-[#1c1b1b] text-gray-300 border border-gray-700 outline-none px-3 py-2 rounded text-sm cursor-pointer focus:border-blue-400"
                      >
                        <option value="">No special conditions</option>
                        {availableTriggers.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="bg-[#0a0a0a] rounded border border-gray-800 p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
                      <Gift size={16} className="text-green-400" /> Rewards (Effects)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Effects are run when the decision is taken.</p>
                    <div className="space-y-2">
                       <button className="w-full bg-[#1c1b1b] text-gray-400 border border-gray-700 hover:border-green-400/50 hover:text-green-400 outline-none px-3 py-2 rounded text-sm transition-colors text-left flex items-center justify-between">
                         <span>Add Effect...</span>
                         <Plus size={14} />
                       </button>
                       {/* Simplified: Currently we don't handle a full effect list in UI to keep it simple, but we show the box */}
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
