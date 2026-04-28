import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Redo2 } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';
import { useBuilderStore } from '../../stores/builderStore';
import { StyleProperties } from '../../types/builder';
import { getEffectiveStyles } from '../../utils/builderUtils';

type BuilderElement = any;

export const RightPanel: React.FC = () => {
  const { selectedElementId, rightPanelTab, setRightPanelTab, getElementById, breakpoint, getCurrentPage } = useBuilderStore() as any;
  const element = selectedElementId ? getElementById(selectedElementId) : null;
  const page = getCurrentPage();

  return (
    <div className="w-64 bg-[#111114] max-md:hidden border-l border-gray-800 flex flex-col h-full">
      {element ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['style', 'content'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightPanelTab(tab)}
                className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${rightPanelTab === tab
                    ? 'text-white border-b-2 border-blue-300 bg-blue-300/5'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {rightPanelTab === 'style' && <StyleEditor element={element} breakpoint={breakpoint} />}
            {rightPanelTab === 'content' && <ContentEditor element={element} />}
          </div>
        </>
      ) : (
        <>
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setRightPanelTab('seo')}
              className="flex-1 py-3 text-xs font-medium text-white border-b-2 border-blue-300 bg-blue-300/5"
            >
              Page Settings
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <SeoEditor pageId={page.id} />
          </div>
        </>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-800/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
      >
        {title}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

interface InputRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  unit?: string;
  options?: string[];
}

const InputRow: React.FC<InputRowProps> = ({ label, value, onChange, type = 'text', placeholder, unit, options }) => {
  return (
    <div className="flex w-full items-center gap-2 mb-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-gray-800 text-gray-200 text-xs rounded-md px-2 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">—</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '—'}
            className="flex-1 bg-gray-800 text-gray-200 text-xs rounded-md px-2 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
          />
          {unit && <span className="text-xs text-gray-600">{unit}</span>}
        </>
      )}
    </div>
  );
};

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 w-10 flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className="flex-1 bg-transparent text-gray-200 text-xs focus:outline-none min-w-0"
        />
      </div>
    </div>
  );
};

interface GradientInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  defaultValue: string;
}

const GradientInput: React.FC<GradientInputProps> = ({ label, value, onChange, placeholder, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const safeValue = value || defaultValue;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs text-gray-500">{label}</span>
        <Redo2 size={14} className="text-gray-600 hover:text-gray-400 cursor-pointer" onClick={() => onChange('')} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-800 text-gray-200 text-xs rounded-md px-2 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
        />
        <div
          className="h-9 min-w-18 rounded-md border border-gray-700"
          style={{
            backgroundImage: safeValue,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onClick={() => setOpen(prev => !prev)}
        />
      </div>
      {open && (
        <div className="absolute z-10 bottom-2 right-65 mt-3 rounded-xl border border-gray-700 overflow-hidden">
          <ColorPicker
            value={safeValue}
            onChange={onChange}
            hideColorTypeBtns={true}
            hidePresets={true}
          />
        </div>
      )}
    </div>
  );
};

interface SpacingInputProps {
  label: string;
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', val: string) => void;
}

const SpacingInput: React.FC<SpacingInputProps> = ({ label, values, onChange }) => {
  const [linked, setLinked] = useState(false);

  const handleChange = (side: 'top' | 'right' | 'bottom' | 'left', val: string) => {
    if (linked) {
      onChange('top', val);
      onChange('right', val);
      onChange('bottom', val);
      onChange('left', val);
    } else {
      onChange(side, val);
    }
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <button
          onClick={() => setLinked(!linked)}
          className={`text-xs px-1.5 py-0.5 rounded ${linked ? 'bg-blue-600/30 text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
        >
          {linked ? '⛓️' : '⛓️'}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(['top', 'right', 'bottom', 'left'] as const).map(side => (
          <div key={side} className="flex flex-col items-center gap-0.5">
            <input
              type="text"
              value={values[side]}
              onChange={e => handleChange(side, e.target.value)}
              placeholder="0"
              className="w-full bg-gray-800 text-gray-200 text-xs text-center rounded px-1 py-1 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">{side[0].toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StyleEditorProps {
  element: BuilderElement;
  breakpoint: string;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ element, breakpoint }) => {
  const { updateElementStyles } = useBuilderStore();
  const styles = getEffectiveStyles(element, breakpoint as 'desktop' | 'tablet' | 'mobile');
  const isTextElement = ['heading', 'paragraph', 'button', 'link', 'listItem'].includes(element.type);

  const update = (key: keyof StyleProperties, value: string) => {
    updateElementStyles(element.id, { [key]: value });
  };

  const parsePx = (val: string | undefined) => {
    if (!val) return '';
    return val.replace('px', '').replace('rem', '').trim();
  };

  const getSpacing = (prefix: 'margin' | 'padding') => ({
    top: parsePx((styles as unknown as Record<string, string>)[`${prefix}Top`] || (styles as unknown as Record<string, string>)[prefix]),
    right: parsePx((styles as unknown as Record<string, string>)[`${prefix}Right`] || (styles as unknown as Record<string, string>)[prefix]),
    bottom: parsePx((styles as unknown as Record<string, string>)[`${prefix}Bottom`] || (styles as unknown as Record<string, string>)[prefix]),
    left: parsePx((styles as unknown as Record<string, string>)[`${prefix}Left`] || (styles as unknown as Record<string, string>)[prefix]),
  });

  const handleSpacing = (prefix: 'margin' | 'padding', side: string, val: string) => {
    const formatted = val && !isNaN(Number(val)) ? `${val}px` : val;
    update(`${prefix}${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof StyleProperties, formatted);
  };

  return (
    <div className='flex flex-col'>
      {/* Layout */}
      <Section title="Layout">
        <InputRow
          label="Display"
          value={styles.display || ''}
          onChange={v => update('display', v)}
          options={['block', 'flex', 'grid', 'inline', 'inline-flex', 'none']}
        />
        {styles.display === 'flex' && (
          <>
            <InputRow
              label="Direction"
              value={styles.flexDirection || ''}
              onChange={v => update('flexDirection', v)}
              options={['row', 'column', 'row-reverse', 'column-reverse']}
            />
            <InputRow
              label="Justify"
              value={styles.justifyContent || ''}
              onChange={v => update('justifyContent', v)}
              options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']}
            />
            <InputRow
              label="Align"
              value={styles.alignItems || ''}
              onChange={v => update('alignItems', v)}
              options={['flex-start', 'center', 'flex-end', 'stretch', 'baseline']}
            />
            <InputRow
              label="Wrap"
              value={styles.flexWrap || ''}
              onChange={v => update('flexWrap', v)}
              options={['nowrap', 'wrap', 'wrap-reverse']}
            />
            <InputRow label="Gap"
              value={styles.gap || ''}
              onChange={v => update('gap', v)}
              placeholder="16px" />
          </>
        )}
        {styles.display === 'grid' && (
          <>
            <InputRow
              label="Columns"
              value={styles.gridTemplateColumns || ''}
              onChange={v => update('gridTemplateColumns', v)}
              placeholder="repeat(3, 1fr)"
            />
            <InputRow
              label="Rows"
              value={styles.gridTemplateRows || ''}
              onChange={v => update('gridTemplateRows', v)}
              placeholder="auto"
            />
            <InputRow label="Gap" value={styles.gap || ''} onChange={v => update('gap', v)} placeholder="16px" />
          </>
        )}
        <InputRow
          label="Position"
          value={styles.position || ''}
          onChange={v => update('position', v)}
          options={['static', 'relative', 'absolute', 'fixed', 'sticky']}
        />
        {(styles.position === 'absolute' || styles.position === 'fixed') && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(['top', 'right', 'bottom', 'left'] as const).map(side => (
              <div key={side} className="flex items-center">
                <span className="text-xs text-gray-600 w-3">{side[0].toUpperCase()}</span>
                <input
                  type="text"
                  value={(styles as unknown as Record<string, string>)[side] || ''}
                  onChange={e => update(side as keyof StyleProperties, e.target.value)}
                  placeholder="auto"
                  className="flex-1 w-full bg-gray-800 text-gray-200 text-xs rounded px-1.5 py-1 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Size */}
      <Section title="Size">
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[
            { label: 'W', key: 'width' as const },
            { label: 'H', key: 'height' as const },
            { label: 'Min W', key: 'minWidth' as const },
            { label: 'Max W', key: 'maxWidth' as const },
            { label: 'Min H', key: 'minHeight' as const },
            { label: 'Max H', key: 'maxHeight' as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs text-gray-600 w-8 shrink-0">{label}</span>
              <input
                type="text"
                value={(styles as unknown as Record<string, string>)[key] || ''}
                onChange={e => update(key, e.target.value)}
                placeholder="auto"
                className="flex-1 min-w-0 bg-gray-800 text-gray-200 text-xs rounded px-1.5 py-1 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <InputRow
          label="Overflow"
          value={styles.overflow || ''}
          onChange={v => update('overflow', v)}
          options={['visible', 'hidden', 'scroll', 'auto']}
        />
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <SpacingInput
          label="Padding"
          values={getSpacing('padding')}
          onChange={(side, val) => handleSpacing('padding', side, val)}
        />
        <SpacingInput
          label="Margin"
          values={getSpacing('margin')}
          onChange={(side, val) => handleSpacing('margin', side, val)}
        />
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <InputRow
          label="Font"
          value={styles.fontFamily || ''}
          onChange={v => update('fontFamily', v)}
          options={['inherit', 'Inter, sans-serif', 'Georgia, serif', 'monospace', 'cursive', 'Roboto, sans-serif']}
        />
        <InputRow label="Size" value={styles.fontSize || ''} onChange={v => update('fontSize', v)} placeholder="16px" />
        <InputRow
          label="Weight"
          value={styles.fontWeight || ''}
          onChange={v => update('fontWeight', v)}
          options={['300', '400', '500', '600', '700', '800', '900']}
        />
        <InputRow label="Line H" value={styles.lineHeight || ''} onChange={v => update('lineHeight', v)} placeholder="1.5" />
        <InputRow label="Spacing" value={styles.letterSpacing || ''} onChange={v => update('letterSpacing', v)} placeholder="0em" />
        <InputRow
          label="Align"
          value={styles.textAlign || ''}
          onChange={v => update('textAlign', v)}
          options={['left', 'center', 'right', 'justify']}
        />
        {isTextElement && (
          <GradientInput
            label="Text gradient"
            value={styles.textGradient || ''}
            onChange={v => update('textGradient', v)}
            placeholder="linear-gradient(90deg, #ff0080, #7928ca)"
            defaultValue="linear-gradient(90deg, rgba(255,56,129,1) 0%, rgba(125,59,230,1) 100%)"
          />
        )}
        <InputRow
          label="Transform"
          value={styles.textTransform || ''}
          onChange={v => update('textTransform', v)}
          options={['none', 'uppercase', 'lowercase', 'capitalize']}
        />
        <InputRow
          label="Decoration"
          value={styles.textDecoration || ''}
          onChange={v => update('textDecoration', v)}
          options={['none', 'underline', 'line-through', 'overline']}
        />
        <ColorInput label="Color" value={styles.color || ''} onChange={v => update('color', v)} />
      </Section>

      {/* Background */}
      <Section title="Background">
        <GradientInput
          label="Gradient"
          value={styles.backgroundGradient || ''}
          onChange={v => update('backgroundGradient', v)}
          placeholder="linear-gradient(135deg, #f97316, #ec4899)"
          defaultValue="linear-gradient(135deg, rgba(249,115,22,1) 0%, rgba(236,72,153,1) 100%)"
        />
        <ColorInput label="Color" value={styles.backgroundColor || ''} onChange={v => update('backgroundColor', v)} />
        <InputRow label="Image" value={styles.backgroundImage || ''} onChange={v => update('backgroundImage', v)} placeholder="url(...)" />
        <InputRow
          label="Size"
          value={styles.backgroundSize || ''}
          onChange={v => update('backgroundSize', v)}
          options={['auto', 'cover', 'contain', '100%', '100% 100%']}
        />
        <InputRow
          label="Position"
          value={styles.backgroundPosition || ''}
          onChange={v => update('backgroundPosition', v)}
          options={['top', 'center', 'bottom', 'left', 'right', 'top center', 'center center']}
        />
      </Section>

      {/* Border */}
      <Section title="Border">
        <InputRow label="Width" value={styles.borderWidth || ''} onChange={v => update('borderWidth', v)} placeholder="1px" />
        <InputRow
          label="Style"
          value={styles.borderStyle || ''}
          onChange={v => update('borderStyle', v)}
          options={['none', 'solid', 'dashed', 'dotted', 'double']}
        />
        <ColorInput label="Color" value={styles.borderColor || ''} onChange={v => update('borderColor', v)} />
        <InputRow label="Radius" value={styles.borderRadius || ''} onChange={v => update('borderRadius', v)} placeholder="8px" />
      </Section>

      {/* Effects */}
      <Section title="Effects" defaultOpen={false}>
        <InputRow label="Shadow" value={styles.boxShadow || ''} onChange={v => update('boxShadow', v)} placeholder="0 4px 6px ..." />
        <InputRow label="Opacity" value={styles.opacity || ''} onChange={v => update('opacity', v)} placeholder="1" />
        <InputRow label="z-index" value={styles.zIndex || ''} onChange={v => update('zIndex', v)} placeholder="auto" />
        <InputRow label="Transition" value={styles.transition || ''} onChange={v => update('transition', v)} placeholder="all 0.2s ease" />
      </Section>
    </div>
  );
};

interface ContentEditorProps {
  element: BuilderElement;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ element }) => {
  const { updateElementProps, updateElementName } = useBuilderStore();

  const update = (key: string, value: unknown) => {
    updateElementProps(element.id, { [key]: value });
  };

  return (
    <div className="p-4 space-y-3">
      {/* Name */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Element Name</label>
        <input
          type="text"
          value={element.name}
          onChange={e => updateElementName(element.id, e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Text content */}
      {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button' || element.type === 'link' || element.type === 'listItem') && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Text</label>
          <textarea
            value={element.props.text || ''}
            onChange={e => update('text', e.target.value)}
            rows={3}
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      {element.type === 'heading' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Heading Level</label>
          <select
            value={element.props.level || 1}
            onChange={e => update('level', parseInt(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>H{n}</option>)}
          </select>
        </div>
      )}

      {(element.type === 'button' || element.type === 'link') && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Link URL</label>
          <input
            type="text"
            value={element.props.href || ''}
            onChange={e => update('href', e.target.value)}
            placeholder="https://..."
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {element.type === 'image' && (
        <>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Image URL</label>
            <input
              type="text"
              value={element.props.src || ''}
              onChange={e => update('src', e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Alt Text</label>
            <input
              type="text"
              value={element.props.alt || ''}
              onChange={e => update('alt', e.target.value)}
              placeholder="Describe the image..."
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      {element.type === 'video' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Video URL</label>
          <input
            type="text"
            value={element.props.src || ''}
            onChange={e => update('src', e.target.value)}
            placeholder="https://..."
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <label className="text-xs text-gray-500 block mt-1">Show Controls</label>
          <input
            type="checkbox"
            checked={element.props.controls || false}
            onChange={e => update('controls', e.target.checked)}
            className="mt-2"
          />
          <label className="text-xs text-gray-500 block mb-1">Autoplay</label>
          <input
            type="checkbox"
            checked={element.props.autoplay || false}
            onChange={e => update('autoplay', e.target.checked)}
            className="mt-2"
          />
          <label className="text-xs text-gray-500 block mb-1">Muted</label>
          <input
            type="checkbox"
            checked={element.props.muted || false}
            onChange={e => update('muted', e.target.checked)}
            className="mt-2"
          />
          <label className="text-xs text-gray-500 block mb-1">Loop</label>
          <input
            type="checkbox"
            checked={element.props.loop || false}
            onChange={e => update('loop', e.target.checked)}
            className="mt-2"
          />
        </div>
      )}

      {(element.type === 'input' || element.type === 'textarea') && (
        <>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Label</label>
            <input
              type="text"
              value={element.props.label || ''}
              onChange={e => update('label', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Placeholder</label>
            <input
              type="text"
              value={element.props.placeholder || ''}
              onChange={e => update('placeholder', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {element.type === 'input' && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Input Type</label>
              <select
                value={element.props.type || 'text'}
                onChange={e => update('type', e.target.value)}
                className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'search'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {element.type === 'iframe' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Iframe URL</label>
          <input
            type="text"
            value={element.props.src || ''}
            onChange={e => update('src', e.target.value)}
            placeholder="https://..."
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {element.type === 'icon' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Icon Name (Lucide)</label>
          <input
            type="text"
            value={element.props.iconName || ''}
            onChange={e => update('iconName', e.target.value)}
            placeholder="Star, Heart, ArrowRight..."
            className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-600">Type: <span className="text-gray-400">{element.type}</span></p>
        <p className="text-xs text-gray-600 mt-0.5">ID: <span className="text-gray-500 font-mono">{element.id}</span></p>
      </div>
    </div>
  );
};

interface SeoEditorProps {
  pageId: string;
}

const SeoEditor: React.FC<SeoEditorProps> = ({ pageId }) => {
  const { pages, updatePageSeo, updatePageName } = useBuilderStore();
  const page = pages.find(p => p.id === pageId)!;
  if (!page) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 block mb-1.5 font-medium">Page Name</label>
        <input
          type="text"
          value={page.name}
          onChange={e => updatePageName(page.id, e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1.5 font-medium">Page URL Slug</label>
        <input
          type="text"
          value={page.slug}
          className="w-full bg-gray-800 text-gray-500 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none cursor-not-allowed"
          readOnly
        />
      </div>

      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SEO</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Title</label>
            <input
              type="text"
              value={page.seo.title}
              onChange={e => updatePageSeo(page.id, { title: e.target.value })}
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Description</label>
            <textarea
              value={page.seo.description}
              onChange={e => updatePageSeo(page.id, { description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Keywords</label>
            <input
              type="text"
              value={page.seo.keywords}
              onChange={e => updatePageSeo(page.id, { keywords: e.target.value })}
              placeholder="keyword1, keyword2..."
              className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
