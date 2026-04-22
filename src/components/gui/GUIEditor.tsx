import { useState, useCallback, useRef } from 'react';
import { 
  Square, Type, Image, BarChart3, PanelLeft, 
  Layers, Grid3X3, Move, MousePointer2,
  Download, ZoomIn, ZoomOut,
  Trash2, Copy, ChevronDown, Search,
  Monitor, Smartphone, Tablet
} from 'lucide-react';
import { useModStore } from '../../store/useModStore';
import { translations } from '../../data/translations';

export interface GUIElement {
  id: string;
  type: GUIElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: GUIElementProperties;
  children?: GUIElement[];
}

export type GUIElementType = 
  | 'container'
  | 'button'
  | 'text'
  | 'image'
  | 'progressbar'
  | 'icon'
  | 'input'
  | 'checkbox'
  | 'dropdown'
  | 'list'
  | 'scrollbar'
  | 'tooltip'
  | 'window'
  | 'frame';

export interface GUIElementProperties {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  opacity?: number;
  visible?: boolean;
  enabled?: boolean;
  sprite?: string;
  frameWidth?: number;
  frameHeight?: number;
  datatrack?: string;
  format?: string;
  minValue?: number;
  maxValue?: number;
  value?: number;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'horizontal' | 'vertical';
  size?: number;
  count?: number;
  position?: number;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'center' | 'bottom';
  name?: string;
  class?: string;
  tooltip?: string;
  effectastext?: string;
  upSprite?: string;
  downSprite?: string;
  hoverSprite?: string;
  highlightSprite?: string;
  oversound?: string;
  clicksound?: string;
  shader?: string;
}

export const defaultElementProperties: Record<GUIElementType, Partial<GUIElementProperties>> = {
  container: {
    backgroundColor: '#1c1b1b',
    borderRadius: 4,
    padding: 8,
  },
  window: {
    backgroundColor: '#131313',
    borderColor: '#504532',
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
  },
  frame: {
    backgroundColor: '#2a2a2a',
    borderColor: '#504532',
    borderWidth: 1,
  },
  button: {
    text: 'Button',
    backgroundColor: '#5d4509',
    textColor: '#ffe2ab',
    fontSize: 14,
    borderRadius: 4,
    padding: 8,
  },
  text: {
    text: 'Text',
    textColor: '#e5e2e1',
    fontSize: 14,
  },
  image: {
    backgroundColor: '#353534',
    borderRadius: 4,
  },
  progressbar: {
    backgroundColor: '#353534',
    borderColor: '#504532',
    borderWidth: 1,
    minValue: 0,
    maxValue: 100,
    value: 50,
    orientation: 'horizontal',
  },
  icon: {
    backgroundColor: '#353534',
    size: 24,
  },
  input: {
    text: '',
    backgroundColor: '#2a2a2a',
    textColor: '#e5e2e1',
    borderColor: '#504532',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  checkbox: {
    text: 'Checkbox',
    textColor: '#e5e2e1',
  },
  dropdown: {
    text: 'Select...',
    backgroundColor: '#2a2a2a',
    textColor: '#e5e2e1',
    borderColor: '#504532',
  },
  list: {
    backgroundColor: '#1c1b1b',
    borderColor: '#504532',
    count: 5,
    position: 0,
  },
  scrollbar: {
    backgroundColor: '#353534',
    size: 16,
    orientation: 'vertical',
  },
  tooltip: {
    text: 'Tooltip',
    backgroundColor: '#353534',
    textColor: '#e5e2e1',
  },
};

const componentLibrary = [
  { type: 'window' as const, label: 'Window', icon: Square, category: 'containers' },
  { type: 'frame' as const, label: 'Frame', icon: PanelLeft, category: 'containers' },
  { type: 'container' as const, label: 'Container', icon: Layers, category: 'containers' },
  { type: 'button' as const, label: 'Button', icon: Square, category: 'controls' },
  { type: 'text' as const, label: 'Text', icon: Type, category: 'controls' },
  { type: 'input' as const, label: 'Input', icon: Square, category: 'controls' },
  { type: 'checkbox' as const, label: 'Checkbox', icon: Square, category: 'controls' },
  { type: 'dropdown' as const, label: 'Dropdown', icon: ChevronDown, category: 'controls' },
  { type: 'progressbar' as const, label: 'Progress Bar', icon: BarChart3, category: 'controls' },
  { type: 'image' as const, label: 'Image', icon: Image, category: 'media' },
  { type: 'icon' as const, label: 'Icon', icon: Image, category: 'media' },
  { type: 'list' as const, label: 'List', icon: Layers, category: 'containers' },
  { type: 'scrollbar' as const, label: 'Scrollbar', icon: BarChart3, category: 'controls' },
  { type: 'tooltip' as const, label: 'Tooltip', icon: Square, category: 'controls' },
];

export default function GUIEditor() {
  const { language, baseMod } = useModStore();
  const t = (key: string) => {
    const lang = language as keyof typeof translations;
    return (translations[lang] || translations['en'])[key as keyof typeof translations['en']] || key;
  };

  const [elements, setElements] = useState<GUIElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'move'>('select');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'hierarchy'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [canvasSize, setCanvasSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  const generateId = () => `gui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const getModPrefix = useCallback(() => {
    switch (baseMod) {
      case 'tno': return 'TNO_';
      case 'kaiserreich': return 'KR_';
      case 'millennium_dawn': return 'MD_';
      case 'road_to_56': return 'RT56_';
      default: return '';
    }
  }, [baseMod]);

  const addElement = useCallback((type: GUIElementType, x: number = 50, y: number = 50) => {
    const prefix = getModPrefix();
    const newElement: GUIElement = {
      id: generateId(),
      type,
      name: `${prefix}${type}_${elements.length + 1}`,
      x,
      y,
      width: type === 'window' ? 400 : type === 'button' ? 120 : type === 'progressbar' ? 200 : 100,
      height: type === 'window' ? 300 : type === 'button' ? 32 : type === 'progressbar' ? 20 : 24,
      properties: {
        ...defaultElementProperties[type],
      },
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [elements.length, getModPrefix]);

  const updateElement = useCallback((id: string, updates: Partial<GUIElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const updateElementProperties = useCallback((id: string, properties: Partial<GUIElementProperties>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, properties: { ...el.properties, ...properties } } : el
    ));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement: GUIElement = {
        ...element,
        id: generateId(),
        name: `${element.name}_copy`,
        x: element.x + 20,
        y: element.y + 20,
      };
      setElements(prev => [...prev, newElement]);
      setSelectedId(newElement.id);
    }
  }, [elements]);

  const exportToGUI = useCallback(() => {
    const exportContent = generateGUICode(elements, baseMod);
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseMod || 'custom'}_gui.gui`;
    a.click();
    URL.revokeObjectURL(url);
  }, [elements, baseMod]);

  const filteredComponents = componentLibrary.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['containers', 'controls', 'media'];

  return (
    <div className="flex flex-col h-full bg-[#0e0e0e]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1c1b1b] border-b border-[#504532]/20">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#e5e2e1] font-['Space_Grotesk']">
            {t('guiEditor') || 'GUI Editor'}
          </h2>
          <span className="text-xs text-[#9c8f78]">
            {baseMod?.toUpperCase() || 'VANILLA'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-2 rounded ${activeTool === 'select' ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
            title="Select"
          >
            <MousePointer2 size={16} />
          </button>
          <button
            onClick={() => setActiveTool('move')}
            className={`p-2 rounded ${activeTool === 'move' ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
            title="Move"
          >
            <Move size={16} />
          </button>
          
          <div className="w-px h-6 bg-[#504532]/30 mx-2" />
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
            title="Toggle Grid"
          >
            <Grid3X3 size={16} />
          </button>

          <div className="flex items-center gap-1 ml-2 border-l border-[#504532]/30 pl-2">
            <button
              onClick={() => setZoom(z => Math.max(25, z - 25))}
              className="p-2 rounded text-[#9c8f78] hover:text-[#e5e2e1]"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-[#d4c5ab] w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="p-2 rounded text-[#9c8f78] hover:text-[#e5e2e1]"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-2 border-l border-[#504532]/30 pl-2">
            <button
              onClick={() => setCanvasSize('desktop')}
              className={`p-2 rounded ${canvasSize === 'desktop' ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
              title="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setCanvasSize('tablet')}
              className={`p-2 rounded ${canvasSize === 'tablet' ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setCanvasSize('mobile')}
              className={`p-2 rounded ${canvasSize === 'mobile' ? 'bg-[#ffbf00]/20 text-[#ffbf00]' : 'text-[#9c8f78] hover:text-[#e5e2e1]'}`}
              title="Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-[#504532]/30 mx-2" />

          <button
            onClick={exportToGUI}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#ffe2ab] to-[#ffbf00] text-[#261a00] rounded text-xs font-bold"
          >
            <Download size={14} />
            Export .gui
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Library / Hierarchy */}
        <div className="w-64 bg-[#1c1b1b] border-r border-[#504532]/20 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-[#504532]/20">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 px-4 py-2 text-xs font-bold ${activeTab === 'library' ? 'text-[#ffbf00] border-b-2 border-[#ffbf00]' : 'text-[#9c8f78]'}`}
            >
              {t('library') || 'Library'}
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`flex-1 px-4 py-2 text-xs font-bold ${activeTab === 'hierarchy' ? 'text-[#ffbf00] border-b-2 border-[#ffbf00]' : 'text-[#9c8f78]'}`}
            >
              {t('hierarchy') || 'Hierarchy'}
            </button>
          </div>

          {/* Search */}
          {activeTab === 'library' && (
            <div className="p-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9c8f78]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="w-full pl-9 pr-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] placeholder-[#9c8f78] focus:border-[#ffbf00]/50 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Component List / Hierarchy */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'library' ? (
              categories.map(category => {
                const categoryComponents = filteredComponents.filter(c => c.category === category);
                if (categoryComponents.length === 0) return null;
                
                return (
                  <div key={category} className="mb-4">
                    <div className="px-4 py-2 text-xs font-bold text-[#9c8f78] uppercase tracking-wider">
                      {category}
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-2">
                      {categoryComponents.map(comp => (
                        <button
                          key={comp.type}
                          onClick={() => addElement(comp.type)}
                          className="flex flex-col items-center gap-1 p-3 rounded bg-[#2a2a2a] hover:bg-[#353534] text-[#d4c5ab] hover:text-[#e5e2e1] transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('gui-type', comp.type);
                          }}
                        >
                          <comp.icon size={18} className="text-[#ffbf00]" />
                          <span className="text-[10px]">{comp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-2">
                {elements.length === 0 ? (
                  <div className="text-center py-8 text-[#9c8f78] text-xs">
                    No elements yet.<br />Drag components from the library.
                  </div>
                ) : (
                  elements.map(el => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedId(el.id)}
                      className={`w-full text-left px-3 py-2 rounded text-xs mb-1 flex items-center gap-2 ${
                        selectedId === el.id 
                          ? 'bg-[#ffbf00]/20 text-[#ffbf00] border-l-2 border-[#ffbf00]' 
                          : 'text-[#d4c5ab] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <span className="opacity-60">{getElementIcon(el.type)}</span>
                      {el.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-[#0e0e0e] overflow-auto flex items-center justify-center p-8">
          <div
            ref={canvasRef}
            className="relative bg-[#131313] border border-[#504532]/30 overflow-hidden"
            style={{
              width: canvasSize === 'desktop' ? 800 : canvasSize === 'tablet' ? 600 : 375,
              height: canvasSize === 'desktop' ? 600 : canvasSize === 'tablet' ? 450 : 812,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const type = e.dataTransfer.getData('gui-type') as GUIElementType;
              if (type) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  addElement(type, e.clientX - rect.left, e.clientY - rect.top);
                }
              }
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #504532 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}

            {/* Canvas Elements */}
            {elements.map(el => (
              <div
                key={el.id}
                className={`absolute cursor-pointer transition-all ${
                  selectedId === el.id ? 'ring-2 ring-[#ffbf00] ring-offset-2 ring-offset-[#131313]' : ''
                }`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
              >
                <RenderElement element={el} />
              </div>
            ))}

            {/* Empty State */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[#9c8f78] text-sm">
                <div className="text-center">
                  <Grid3X3 size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Drag components from the library</p>
                  <p className="text-xs mt-2 opacity-60">or click to add</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-72 bg-[#1c1b1b] border-l border-[#504532]/20 flex flex-col">
          <div className="px-4 py-3 border-b border-[#504532]/20">
            <h3 className="text-xs font-bold text-[#e5e2e1]">{t('inspector') || 'Inspector'}</h3>
          </div>

          {selectedElement ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Element Name */}
              <div>
                <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">X</label>
                  <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Width</label>
                  <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Height</label>
                  <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Type-specific Properties */}
              {(selectedElement.type === 'button' || selectedElement.type === 'text' || selectedElement.type === 'tooltip') && (
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Text</label>
                  <input
                    type="text"
                    value={selectedElement.properties.text || ''}
                    onChange={(e) => updateElementProperties(selectedElement.id, { text: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Background Color */}
              <div>
                <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.properties.backgroundColor || '#000000'}
                    onChange={(e) => updateElementProperties(selectedElement.id, { backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.properties.backgroundColor || ''}
                    onChange={(e) => updateElementProperties(selectedElement.id, { backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Text Color */}
              {(selectedElement.type === 'button' || selectedElement.type === 'text' || selectedElement.type === 'tooltip') && (
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedElement.properties.textColor || '#ffffff'}
                      onChange={(e) => updateElementProperties(selectedElement.id, { textColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedElement.properties.textColor || ''}
                      onChange={(e) => updateElementProperties(selectedElement.id, { textColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Border */}
              <div>
                <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Border</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] text-[#9c8f78]">Color</label>
                    <input
                      type="color"
                      value={selectedElement.properties.borderColor || '#504532'}
                      onChange={(e) => updateElementProperties(selectedElement.id, { borderColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-[#9c8f78]">Width</label>
                    <input
                      type="number"
                      value={selectedElement.properties.borderWidth || 0}
                      onChange={(e) => updateElementProperties(selectedElement.id, { borderWidth: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1]"
                    />
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={selectedElement.properties.borderRadius || 0}
                  onChange={(e) => updateElementProperties(selectedElement.id, { borderRadius: Number(e.target.value) })}
                  className="w-full accent-[#ffbf00]"
                />
              </div>

              {/* Padding */}
              <div>
                <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Padding</label>
                <input
                  type="number"
                  value={selectedElement.properties.padding || 0}
                  onChange={(e) => updateElementProperties(selectedElement.id, { padding: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                />
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedElement.properties.visible !== false}
                  onChange={(e) => updateElementProperties(selectedElement.id, { visible: e.target.checked })}
                  className="accent-[#ffbf00]"
                />
                <label className="text-xs text-[#d4c5ab]">Visible</label>
              </div>

              {/* Sprite (for images) */}
              {selectedElement.type === 'image' && (
                <div>
                  <label className="block text-[10px] text-[#9c8f78] uppercase mb-1">Sprite</label>
                  <input
                    type="text"
                    value={selectedElement.properties.sprite || ''}
                    onChange={(e) => updateElementProperties(selectedElement.id, { sprite: e.target.value })}
                    placeholder="gfx/interface/..."
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#504532]/30 rounded text-xs text-[#e5e2e1] focus:border-[#ffbf00]/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#504532]/20">
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#353534] rounded text-xs text-[#d4c5ab]"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#93000a]/20 hover:bg-[#93000a]/40 rounded text-xs text-[#ffb4ab]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#9c8f78] text-xs p-4 text-center">
              Select an element to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1c1b1a] border-t border-[#504532]/20 text-[10px] text-[#9c8f78]">
        <div className="flex items-center gap-4">
          <span>{elements.length} elements</span>
          <span>Canvas: {canvasSize === 'desktop' ? '800x600' : canvasSize === 'tablet' ? '600x450' : '375x812'}</span>
        </div>
        <div>
          {selectedElement && (
            <span>{selectedElement.type} • {selectedElement.width}x{selectedElement.height}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getElementIcon(type: GUIElementType): string {
  const icons: Record<GUIElementType, string> = {
    window: '□',
    frame: '▢',
    container: '▭',
    button: '▢',
    text: 'T',
    image: '▣',
    progressbar: '▰',
    icon: '★',
    input: '▯',
    checkbox: '☑',
    dropdown: '▼',
    list: '☰',
    scrollbar: '▕',
    tooltip: '💬',
  };
  return icons[type] || '○';
}

function RenderElement({ element }: { element: GUIElement }) {
  const { properties, type, width, height } = element;

  const baseStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    backgroundColor: properties.backgroundColor || 'transparent',
    borderColor: properties.borderColor,
    borderWidth: properties.borderWidth,
    borderStyle: properties.borderWidth ? 'solid' : 'none',
    borderRadius: properties.borderRadius,
    padding: properties.padding,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  switch (type) {
    case 'window':
      return (
        <div style={baseStyle}>
          <div className="text-[10px] text-[#9c8f78]">Window: {element.name}</div>
        </div>
      );
    
    case 'button':
      return (
        <button style={{
          ...baseStyle,
          backgroundColor: properties.backgroundColor || '#5d4509',
          color: properties.textColor || '#ffe2ab',
          fontSize: properties.fontSize || 14,
          fontWeight: 'bold',
        }}>
          {properties.text || 'Button'}
        </button>
      );

    case 'text':
      return (
        <span style={{
          color: properties.textColor || '#e5e2e1',
          fontSize: properties.fontSize || 14,
          fontWeight: properties.fontWeight,
        }}>
          {properties.text || 'Text'}
        </span>
      );

    case 'progressbar':
      return (
        <div style={baseStyle}>
          <div style={{
            width: `${((properties.value || 50) / (properties.maxValue || 100)) * 100}%`,
            height: '100%',
            backgroundColor: '#ffbf00',
            transition: 'width 0.3s',
          }} />
        </div>
      );

    case 'input':
      return (
        <input
          type="text"
          placeholder={properties.text || ''}
          style={{
            ...baseStyle,
            color: properties.textColor || '#e5e2e1',
            fontSize: properties.fontSize || 14,
          }}
          className="outline-none"
          readOnly
        />
      );

    case 'image':
      return (
        <div style={baseStyle}>
          {properties.sprite ? (
            <img src={properties.sprite} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="text-[10px] text-[#9c8f78]">Image</div>
          )}
        </div>
      );

    default:
      return <div style={baseStyle} />;
  }
}

function generateGUICode(elements: GUIElement[], modType: string): string {
  const prefix = modType === 'tno' ? 'TNO_' : modType === 'kr' ? 'KR_' : '';
  
  let code = `# Generated by HOI4 Mod Studio GUI Editor\n`;
  code += `# Mod Type: ${modType || 'Vanilla'}\n`;
  code += `# Date: ${new Date().toISOString()}\n\n`;
  code += `guiTypes = {\n`;
  code += `\twindowType = {\n`;
  code += `\t\tname = "${prefix}custom_gui"\n`;
  code += `\t\tposition = { x = 0 y = 0 }\n`;
  code += `\t\tsize = { width = 800 height = 600 }\n`;
  code += `\t\thorizontalBorder = "0"\n`;
  code += `\t\tverticalBorder = "0"\n`;
  code += `\t\tmargin = { left = 0 right = 0 top = 0 bottom = 0 }\n\n`;

  elements.forEach((el) => {
    code += `\t# ${el.type}: ${el.name}\n`;
    code += `\t\t${getGUIControlType(el.type)} = {\n`;
    code += `\t\t\tname = "${el.name}"\n`;
    code += `\t\t\tposition = { x = ${el.x} y = ${el.y} }\n`;
    code += `\t\t\tsize = { width = ${el.width} height = ${el.height} }\n`;
    
    if (el.properties.text) {
      code += `\t\t\ttext = "${el.properties.text}"\n`;
    }
    if (el.properties.fontSize) {
      code += `\t\t\tfont = "malgun_goth_${el.properties.fontSize}"\n`;
    }
    if (el.properties.backgroundColor && el.properties.backgroundColor !== 'transparent') {
      code += `\t\t\tbackground = "${el.name}_bg"\n`;
    }
    if (el.properties.sprite) {
      code += `\t\t\tspriteType = "${el.properties.sprite}"\n`;
    }
    
    code += `\t\t}\n\n`;
  });

  code += `\t}\n`;

  if (elements.some(el => el.type === 'window')) {
    code += `\n\tcontainerWindowType = {\n`;
    code += `\t\tname = "${prefix}custom_container"\n`;
    code += `\t\tposition = { x = 0 y = 0 }\n`;
    code += `\t\tsize = { width = 100%% height = 100%% }\n`;
    code += `\t}\n`;
  }

  code += `}`;

  return code;
}

function getGUIControlType(type: GUIElementType): string {
  const types: Record<GUIElementType, string> = {
    window: 'containerWindowType',
    frame: 'instantTextBoxType',
    container: 'containerWindowType',
    button: 'buttonType',
    text: 'instantTextBoxType',
    image: 'iconType',
    progressbar: 'progressBarType',
    icon: 'iconType',
    input: 'editBoxType',
    checkbox: 'checkboxType',
    dropdown: 'dropDownType',
    list: 'listBoxType',
    scrollbar: 'scrollBarType',
    tooltip: 'toolTipType',
  };
  return types[type] || 'iconType';
}
