"use client";

import { use, useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { LeftPanel } from '../components/panels/LeftPanel';
import { RightPanel } from '../components/panels/RightPanel';
import { Canvas } from '../components/canvas/Canvas';
import { ContextMenu } from '../components/ContextMenu';
import { useBuilderStore } from '../stores/builderStore';
import { useSession } from "next-auth/react"
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function App() {

  const {
    loadProject,
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
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectLoadedId, setProjectLoadedId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const projectQueryId = searchParams.get('projectId');
  const { data: session } = useSession();

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

  useEffect(() => {
    const loadProjectFromServer = async () => {
      if (!projectQueryId || !session || projectLoadedId === projectQueryId) {
        return;
      }

      setProjectLoading(true);
      setProjectError(null);

      const response = await fetch(`/api/projects?projectId=${projectQueryId}`);
      const data = await response.json();

      if (!response.ok) {
        setProjectError(data?.error || 'Unable to load project');
        setProjectLoading(false);
        return;
      }

      if (data?.content?.pages && data?.content?.currentPageId) {
        loadProject(data.id, data.content.pages, data.content.currentPageId);
        setProjectLoadedId(projectQueryId);
      } else {
        setProjectError('Project content is malformed');
      }

      setProjectLoading(false);
    };

    loadProjectFromServer();
  }, [projectQueryId, session, projectLoadedId, loadProject]);

  const contextElement = contextMenu ? getElementById(contextMenu.id) : null;

  if (!session) {
    return <div className='bg-black w-full min-h-screen flex flex-col gap-2 items-center justify-center'>
      <h1 className='text-3xl text-white'>Please sign in to access the editor</h1>
      <Link href={"/"} className='ml-4 bg-linear-to-r from-[#1D976C] to-[#93F9B9] text-gray-800 font-bold py-2 px-4 rounded-lg'>
        Back
      </Link>
    </div>;
  }

  if (!projectQueryId) {
    return (
      <div className='bg-[#0d1117] min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-white'>
        <h1 className='text-3xl font-semibold'>Select a project from your dashboard</h1>
        <p className='text-gray-400 max-w-lg text-center'>Your editor is ready, but to save and load projects you need to open a project through the dashboard.</p>
        <Link href='/dashboard' className='rounded-full bg-linear-to-r from-[#1D976C] to-[#93F9B9] px-6 py-3 text-sm font-semibold text-black'>Go to Dashboard</Link>
      </div>
    );
  }

  if (projectLoading) {
    return <div className='bg-[#0d1117] w-full min-h-screen flex items-center justify-center text-white'>Loading project...</div>;
  }

  if (projectError) {
    return (
      <div className='bg-[#0d1117] w-full min-h-screen flex flex-col items-center justify-center gap-4 text-white p-6'>
        <p className='text-red-300'>{projectError}</p>
        <Link href='/dashboard' className='rounded-full bg-linear-to-r from-[#1D976C] to-[#93F9B9] px-6 py-3 text-sm font-semibold text-black'>Back to Dashboard</Link>
      </div>
    );
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
