"use client";

import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { LeftPanel } from '../components/panels/LeftPanel';
import { RightPanel } from '../components/panels/RightPanel';
import { Canvas } from '../components/canvas/Canvas';
import { ContextMenu } from '../components/ContextMenu';
import { useBuilderStore } from '../stores/builderStore';
import { useSession } from "next-auth/react"

export default function App() {

  const {
    isPreviewMode,
    selectedElementId,
    getElementById,
    deleteElement,
    duplicateElement,
    toggleElementVisibility,
    toggleElementLock,
    undo,
    redo,
  } = useBuilderStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const { data: session } = useSession()
 
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElementId) duplicateElement(selectedElementId);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
      if (e.key === 'Escape') {
        useBuilderStore.getState().selectElement(null);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, undo, redo, duplicateElement, deleteElement]);

  // Context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementEl = target.closest('[data-element-id]') as HTMLElement | null;
      if (elementEl) {
        e.preventDefault();
        const id = elementEl.dataset.elementId!;
        setContextMenu({ x: e.clientX, y: e.clientY, id });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const contextElement = contextMenu ? getElementById(contextMenu.id) : null;

  if (!session) {
    return <p>Sorry! You must be signed in to view this content.</p>;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden font-sans">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {!isPreviewMode && <LeftPanel />}

        <Canvas />

        {!isPreviewMode && <RightPanel />}
      </div>

      {contextMenu && contextElement && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={contextMenu.id}
          onClose={() => setContextMenu(null)}
          onDelete={deleteElement}
          onDuplicate={duplicateElement}
          onToggleVisibility={toggleElementVisibility}
          onToggleLock={toggleElementLock}
          isHidden={contextElement.hidden}
          isLocked={contextElement.locked}
        />
      )}
    </div>
  );
}
