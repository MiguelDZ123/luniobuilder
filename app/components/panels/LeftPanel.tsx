import React, { useState } from 'react';
import { LayoutGrid as Layout, Type, Image, MousePointer, Square, Columns2 as Columns, Grid2x2 as Grid, AlignLeft, Link, Star, Minus, Move, FileText, ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Trash2, Copy, Plus, Layers, Package, Globe } from 'lucide-react';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../../stores/builderStore';
import { ElementType, BuilderElement, Page } from '../../types/builder';
import { COMPONENT_CATEGORIES, COMPONENT_LABELS } from '../../utils/builderUtils';

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  section: <Layout size={25} />,
  div: <Square size={25} />,
  heading: <Type size={25} />,
  paragraph: <AlignLeft size={25} />,
  button: <MousePointer size={25} />,
  image: <Image size={25} />,
  link: <Link size={25} />,
  navbar: <Layout size={25} />,
  hero: <Layout size={25} />,
  card: <Square size={25} />,
  grid: <Grid size={25} />,
  columns: <Columns size={25} />,
  form: <FileText size={25} />,
  input: <FileText size={25} />,
  textarea: <AlignLeft size={25} />,
  video: <Image size={25} />,
  divider: <Minus size={25} />,
  spacer: <Move size={25} />,
  icon: <Star size={25} />,
  list: <AlignLeft size={25} />,
  listItem: <AlignLeft size={25} />,
};

export const LeftPanel: React.FC = () => {
  const { leftPanelTab, setLeftPanelTab } = useBuilderStore();

  return (
    <div className="w-64 bg-[#111114] overflow-auto flex flex-col border-r border-gray-800 h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'components' as const, label: 'Add', icon: <Package size={14} /> },
          { id: 'layers' as const, label: 'Layers', icon: <Layers size={14} /> },
          { id: 'pages' as const, label: 'Pages', icon: <Globe size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setLeftPanelTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              leftPanelTab === tab.id
                ? 'text-white border-b-2 border-blue-300 bg-blue-300/5'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {leftPanelTab === 'components' && <ComponentsTab />}
        {leftPanelTab === 'layers' && <LayersTab />}
        {leftPanelTab === 'pages' && <PagesTab />}
      </div>
    </div>
  );
};

const ComponentsTab: React.FC = () => {
  const { setDraggedElementType, addElementFromPalette } = useBuilderStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(COMPONENT_CATEGORIES))
  );
  const [search, setSearch] = useState('');

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData('elementType', type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedElementType(type);
  };

  const handleDragEnd = () => {
    setDraggedElementType(null);
  };

  const handleDoubleClick = (type: ElementType) => {
    addElementFromPalette(type, 'canvas-root', 'inside');
  };

  const filteredCategories = Object.entries(COMPONENT_CATEGORIES).map(([cat, types]) => ({
    cat,
    types: (types as readonly ElementType[]).filter(t =>
      !search || COMPONENT_LABELS[t].toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(({ types }) => types.length > 0);

  return (
    <div className="p-3">
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
        />
      </div>

      {filteredCategories.map(({ cat, types }) => (
        <div key={cat} className="mb-2">
          <button
            onClick={() => toggleCategory(cat)}
            className="w-full flex items-center justify-between px-1 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
          >
            {cat}
            {expandedCategories.has(cat) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {expandedCategories.has(cat) && (
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {(types as ElementType[]).map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={e => handleDragStart(e, type)}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={() => handleDoubleClick(type)}
                  className="flex flex-col items-center gap-2 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50 hover:border-gray-600 rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing transition-all group"
                  title={`Double-click to add, drag to place`}
                >
                  <span className="text-gray-400 group-hover:text-blue-300 transition-colors shrink-0">
                    {COMPONENT_ICONS[type] || <Square size={14} />}
                  </span>
                  <span className="text-[10px] text-gray-300 group-hover:text-white transition-colors truncate">
                    {COMPONENT_LABELS[type]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <p className="text-xs text-gray-600 text-center mt-4">Drag or double-click to add</p>
    </div>
  );
};

const getSiblingIds = (page: Page, parentId: string | null): string[] => {
  const find = (elements: BuilderElement[], currentParentId: string | null): string[] | null => {
    if (currentParentId === null) {
      return elements.map(el => el.id);
    }

    for (const el of elements) {
      if (el.id === currentParentId) {
        return el.children.map(child => child.id);
      }
      const nested = find(el.children, currentParentId);
      if (nested) return nested;
    }

    return null;
  };

  return find(page.elements, parentId) || [];
};

const isDescendant = (ancestorId: string, descendantId: string, page: Page): boolean => {
  const findElement = (elements: BuilderElement[]): BuilderElement | null => {
    for (const el of elements) {
      if (el.id === ancestorId) return el;
      const found = findElement(el.children);
      if (found) return found;
    }
    return null;
  };

  const ancestor = findElement(page.elements);
  if (!ancestor) return false;

  const search = (elements: BuilderElement[]): boolean => {
    for (const el of elements) {
      if (el.id === descendantId) return true;
      if (search(el.children)) return true;
    }
    return false;
  };

  return search(ancestor.children);
};

const LayerItem: React.FC<{ element: BuilderElement; depth: number }> = ({ element, depth }) => {
  const {
    selectedElementId,
    selectElement,
    deleteElement,
    duplicateElement,
    toggleElementLock,
    toggleElementVisibility,
  } = useBuilderStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = element.children.length > 0;
  const isSelected = selectedElementId === element.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-50' : ''}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded-md mx-1 group transition-colors ${
          isSelected ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-gray-800/80 text-gray-400 hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={() => selectElement(isSelected ? null : element.id)}
      >
        {hasChildren ? (
          <button
            onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="text-gray-500 hover:text-gray-300 shrink-0"
          >
            {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        <button
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          className="text-gray-500 hover:text-gray-300 shrink-0 p-0.5 rounded cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <Move size={10} />
        </button>

        <span className="text-gray-500 shrink-0">
          {COMPONENT_ICONS[element.type] || <Square size={12} />}
        </span>

        <span className="flex-1 text-xs truncate">{element.name}</span>

        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); toggleElementVisibility(element.id); }}
            className="p-0.5 text-gray-500 hover:text-gray-200 rounded"
            title={element.hidden ? 'Show' : 'Hide'}
          >
            {element.hidden ? <EyeOff size={10} /> : <Eye size={10} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); toggleElementLock(element.id); }}
            className="p-0.5 text-gray-500 hover:text-gray-200 rounded"
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            {element.locked ? <Lock size={10} /> : <Unlock size={10} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); duplicateElement(element.id); }}
            className="p-0.5 text-gray-500 hover:text-gray-200 rounded"
          >
            <Copy size={10} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); deleteElement(element.id); }}
            className="p-0.5 text-gray-500 hover:text-red-400 rounded"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <SortableContext items={element.children.map(child => child.id)} strategy={verticalListSortingStrategy}>
          {element.children.map(child => (
            <LayerItem key={child.id} element={child} depth={depth + 1} />
          ))}
        </SortableContext>
      )}
    </div>
  );
};

const LayersTab: React.FC = () => {
  const { getCurrentPage, getElementById, moveElement } = useBuilderStore();
  const page = getCurrentPage();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string;
    if (!overId || activeId === overId) return;

    const activeElement = getElementById(activeId);
    const overElement = getElementById(overId);
    if (!activeElement || !overElement) return;
    if (isDescendant(activeId, overId, page)) return;

    const siblingIds = getSiblingIds(page, overElement.parentId);
    const activeIndex = siblingIds.indexOf(activeId);
    const overIndex = siblingIds.indexOf(overId);
    const position: 'before' | 'after' = activeIndex !== -1 && activeIndex < overIndex ? 'after' : 'before';

    moveElement(activeId, overId, position);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="py-2">
        {page.elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <Layers size={24} className="mb-2" />
            <p className="text-xs">No elements yet</p>
          </div>
        ) : (
          <SortableContext items={page.elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
            {page.elements.map(el => (
              <LayerItem key={el.id} element={el} depth={0} />
            ))}
          </SortableContext>
        )}
      </div>
    </DndContext>
  );
};

const PagesTab: React.FC = () => {
  const { pages, currentPageId, setCurrentPage, addPage, deletePage, updatePageName } = useBuilderStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitEdit = () => {
    if (editingId && editName.trim()) {
      updatePageName(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
        <button
          onClick={addPage}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      <div className="space-y-1">
        {pages.map(page => (
          <div
            key={page.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              page.id === currentPageId
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'hover:bg-gray-800 text-gray-400 border border-transparent'
            }`}
            onClick={() => setCurrentPage(page.id)}
          >
            <Globe size={12} className="shrink-0" />

            {editingId === page.id ? (
              <input
                className="flex-1 bg-gray-800 text-white text-xs px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="flex-1 text-xs truncate"
                onDoubleClick={e => { e.stopPropagation(); startEdit(page.id, page.name); }}
              >
                {page.name}
              </span>
            )}

            <span className="text-xs text-gray-600">{page.slug}</span>

            {pages.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
