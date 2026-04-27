import { create } from 'zustand';
import { BuilderState, BuilderElement, Page, ElementType, StyleProperties, Breakpoint, ElementProps } from '../types/builder';
import { generateId, createDefaultElement, deepClone } from '../utils/builderUtils';
import { createStarterPage } from '../utils/starterTemplate';

interface BuilderStore extends BuilderState {
  // Auth/project tracking
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  loadProject: (projectId: string | null, pages: Page[], currentPageId: string) => void;

  // Element selection
  selectElement: (id: string | null) => void;
  hoverElement: (id: string | null) => void;

  // Drag and drop
  setDraggedElementType: (type: ElementType | null) => void;
  setDraggedElementId: (id: string | null) => void;
  setDropTarget: (id: string | null, position: 'before' | 'after' | 'inside' | null) => void;

  // Element manipulation
  addElement: (type: ElementType, parentId: string | null, index?: number) => string;
  addElementFromPalette: (type: ElementType, targetId: string, position: 'before' | 'after' | 'inside') => void;
  moveElement: (elementId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  updateElementProps: (id: string, props: Partial<ElementProps>) => void;
  updateElementStyles: (id: string, styles: Partial<StyleProperties>) => void;
  updateElementName: (id: string, name: string) => void;
  toggleElementLock: (id: string) => void;
  toggleElementVisibility: (id: string) => void;
  toggleElementComponent: (id: string) => void;

  // Page management
  addPage: () => void;
  deletePage: (id: string) => void;
  setCurrentPage: (id: string) => void;
  updatePageSeo: (id: string, seo: Partial<Page['seo']>) => void;
  updatePageName: (id: string, name: string) => void;

  // UI state
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setCanvasScale: (scale: number) => void;
  setLeftPanelTab: (tab: BuilderState['leftPanelTab']) => void;
  setRightPanelTab: (tab: BuilderState['rightPanelTab']) => void;
  setPreviewMode: (isPreview: boolean) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Helpers
  getCurrentPage: () => Page;
  getElementById: (id: string) => BuilderElement | null;
}

const defaultPage: Page = {
  id: 'page-1',
  name: 'Home',
  slug: '/',
  elements: [],
  seo: {
    title: 'My Website',
    description: '',
    keywords: '',
  },
};

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  pages: [defaultPage],
  projectId: null,
  currentPageId: 'page-1',
  selectedElementId: null,
  hoveredElementId: null,
  draggedElementType: null,
  draggedElementId: null,
  dropTargetId: null,
  dropPosition: null,
  breakpoint: 'desktop',
  canvasScale: 1,
  leftPanelTab: 'components',
  rightPanelTab: 'style',
  history: [[defaultPage]],
  historyIndex: 0,
  isPreviewMode: false,

  setProjectId: (id) => set({ projectId: id }),
  loadProject: (projectId, pages, currentPageId) => set({
    projectId,
    pages,
    currentPageId,
    selectedElementId: null,
    hoveredElementId: null,
    history: [deepClone(pages)],
    historyIndex: 0,
    isPreviewMode: false,
  }),

  selectElement: (id) => set({ selectedElementId: id }),
  hoverElement: (id) => set({ hoveredElementId: id }),

  setDraggedElementType: (type) => set({ draggedElementType: type, draggedElementId: null }),
  setDraggedElementId: (id) => set({ draggedElementId: id, draggedElementType: null }),
  setDropTarget: (id, position) => set({ dropTargetId: id, dropPosition: position }),

  getCurrentPage: () => {
    const { pages, currentPageId } = get();
    return pages.find(p => p.id === currentPageId) || pages[0];
  },

  getElementById: (id) => {
    const page = get().getCurrentPage();
    const findEl = (elements: BuilderElement[]): BuilderElement | null => {
      for (const el of elements) {
        if (el.id === id) return el;
        const found = findEl(el.children);
        if (found) return found;
      }
      return null;
    };
    return findEl(page.elements);
  },

  addElement: (type, parentId, index) => {
    const id = generateId();
    const newElement = createDefaultElement(type, id, parentId);

    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      if (parentId === null) {
        if (index !== undefined) {
          page.elements.splice(index, 0, newElement);
        } else {
          page.elements.push(newElement);
        }
      } else {
        const insertInto = (elements: BuilderElement[]): boolean => {
          for (const el of elements) {
            if (el.id === parentId) {
              if (index !== undefined) {
                el.children.splice(index, 0, newElement);
              } else {
                el.children.push(newElement);
              }
              return true;
            }
            if (insertInto(el.children)) return true;
          }
          return false;
        };
        insertInto(page.elements);
      }

      return { pages };
    });

    get().pushHistory();
    return id;
  },

  addElementFromPalette: (type, targetId, position) => {
    const id = generateId();
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      const findAndInsert = (elements: BuilderElement[], parentId: string | null): boolean => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id === targetId) {
            if (position === 'inside') {
              const newEl = createDefaultElement(type, id, targetId);
              elements[i].children.push(newEl);
            } else {
              const newEl = createDefaultElement(type, id, parentId);
              const insertIdx = position === 'after' ? i + 1 : i;
              elements.splice(insertIdx, 0, newEl);
            }
            return true;
          }
          if (findAndInsert(elements[i].children, elements[i].id)) return true;
        }
        return false;
      };

      if (targetId === 'canvas-root') {
        const newEl = createDefaultElement(type, id, null);
        page.elements.push(newEl);
      } else {
        findAndInsert(page.elements, null);
      }

      return { pages, selectedElementId: id };
    });

    get().pushHistory();
  },

  moveElement: (elementId, targetId, position) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      const removeElement = (elements: BuilderElement[]): BuilderElement | null => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id === elementId) {
            return elements.splice(i, 1)[0];
          }
          const removed = removeElement(elements[i].children);
          if (removed) return removed;
        }
        return null;
      };

      const movedElement = removeElement(page.elements);
      if (!movedElement) return state;

      const insertElement = (elements: BuilderElement[], parentId: string | null): boolean => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id === targetId) {
            if (position === 'inside') {
              movedElement.parentId = targetId;
              elements[i].children.push(movedElement);
            } else {
              movedElement.parentId = parentId;
              const insertIdx = position === 'after' ? i + 1 : i;
              elements.splice(insertIdx, 0, movedElement);
            }
            return true;
          }
          if (insertElement(elements[i].children, elements[i].id)) return true;
        }
        return false;
      };

      if (targetId === 'canvas-root') {
        movedElement.parentId = null;
        page.elements.push(movedElement);
      } else {
        insertElement(page.elements, null);
      }

      return { pages };
    });

    get().pushHistory();
  },

  deleteElement: (id) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      const removeEl = (elements: BuilderElement[]): boolean => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id === id) {
            elements.splice(i, 1);
            return true;
          }
          if (removeEl(elements[i].children)) return true;
        }
        return false;
      };

      removeEl(page.elements);
      return { pages, selectedElementId: state.selectedElementId === id ? null : state.selectedElementId };
    });

    get().pushHistory();
  },

  duplicateElement: (id) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      const duplicateEl = (elements: BuilderElement[]): boolean => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id === id) {
            const clone = deepClone(elements[i]);
            const reassignIds = (el: BuilderElement) => {
              el.id = generateId();
              el.children.forEach(reassignIds);
            };
            reassignIds(clone);
            elements.splice(i + 1, 0, clone);
            return true;
          }
          if (duplicateEl(elements[i].children)) return true;
        }
        return false;
      };

      duplicateEl(page.elements);
      return { pages };
    });

    get().pushHistory();
  },

  updateElementProps: (id, props) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;

      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) {
            el.props = { ...el.props, ...props };
            return true;
          }
          if (updateEl(el.children)) return true;
        }
        return false;
      };

      updateEl(page.elements);
      return { pages };
    });
  },

  updateElementStyles: (id, styles) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;
      const bp = state.breakpoint;

      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) {
            el.styles[bp] = { ...el.styles[bp], ...styles };
            return true;
          }
          if (updateEl(el.children)) return true;
        }
        return false;
      };

      updateEl(page.elements);
      return { pages };
    });
  },

  updateElementName: (id, name) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;
      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) { el.name = name; return true; }
          if (updateEl(el.children)) return true;
        }
        return false;
      };
      updateEl(page.elements);
      return { pages };
    });
  },

  toggleElementLock: (id) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;
      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) { el.locked = !el.locked; return true; }
          if (updateEl(el.children)) return true;
        }
        return false;
      };
      updateEl(page.elements);
      return { pages };
    });
  },

  toggleElementVisibility: (id) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;
      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) { el.hidden = !el.hidden; return true; }
          if (updateEl(el.children)) return true;
        }
        return false;
      };
      updateEl(page.elements);
      return { pages };
    });
  },

  toggleElementComponent: (id) => {
    const makeComponentName = (name: string) => {
      const words = String(name || 'Component')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const base = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).replace(/[^a-zA-Z0-9]/g, '')).join('') || 'Component';
      return base;
    };

    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === state.currentPageId)!;
      const updateEl = (elements: BuilderElement[]): boolean => {
        for (const el of elements) {
          if (el.id === id) {
            if (el.isComponent) {
              el.isComponent = false;
              el.componentName = undefined;
            } else {
              el.isComponent = true;
              el.componentName = el.componentName || makeComponentName(el.name || 'Component');
            }
            return true;
          }
          if (updateEl(el.children)) return true;
        }
        return false;
      };
      updateEl(page.elements);
      return { pages };
    });
  },

  addPage: () => {
    const id = generateId();
    const pageNum = get().pages.length + 1;
    const newPage: Page = {
      id,
      name: `Page ${pageNum}`,
      slug: `/page-${pageNum}`,
      elements: [],
      seo: { title: `Page ${pageNum}`, description: '', keywords: '' },
    };
    set(state => ({ pages: [...state.pages, newPage], currentPageId: id }));
    get().pushHistory();
  },

  deletePage: (id) => {
    set(state => {
      if (state.pages.length <= 1) return state;
      const pages = state.pages.filter(p => p.id !== id);
      const currentPageId = state.currentPageId === id ? pages[0].id : state.currentPageId;
      return { pages, currentPageId };
    });
    get().pushHistory();
  },

  setCurrentPage: (id) => set({ currentPageId: id, selectedElementId: null }),

  updatePageSeo: (id, seo) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === id)!;
      page.seo = { ...page.seo, ...seo };
      return { pages };
    });
  },

  updatePageName: (id, name) => {
    set(state => {
      const pages = deepClone(state.pages);
      const page = pages.find(p => p.id === id)!;
      page.name = name;
      return { pages };
    });
  },

  setBreakpoint: (breakpoint) => set({ breakpoint }),
  setCanvasScale: (canvasScale) => set({ canvasScale }),
  setLeftPanelTab: (leftPanelTab) => set({ leftPanelTab }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode, selectedElementId: null }),

  pushHistory: () => {
    set(state => {
      const currentPages = deepClone(state.pages);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(currentPages);
      return {
        history: newHistory.slice(-50),
        historyIndex: Math.min(newHistory.length - 1, 49),
      };
    });
  },

  undo: () => {
    set(state => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { pages: deepClone(state.history[newIndex]), historyIndex: newIndex };
    });
  },

  redo: () => {
    set(state => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { pages: deepClone(state.history[newIndex]), historyIndex: newIndex };
    });
  },
}));
