import React, { useRef } from 'react';
import { useBuilderStore } from '../../stores/builderStore';
import { ElementRenderer } from './ElementRenderer';
import { ElementType } from '../../types/builder';

export const Canvas: React.FC = () => {
  const {
    getCurrentPage,
    breakpoint,
    canvasScale,
    isPreviewMode,
    selectElement,
    addElementFromPalette,
    setDropTarget,
    setDraggedElementId,
    setDraggedElementType,
    dropTargetId,
    moveElement,
  } = useBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const page = getCurrentPage();

  const breakpointWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  }[breakpoint];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasRoot) {
      selectElement(null);
    }
  };

  const handleCanvasDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const types = Array.from(e.dataTransfer.types || []);
    if (types.includes('elementType') || types.includes('elementId')) {
      setDropTarget('canvas-root', 'inside');
      e.dataTransfer.dropEffect = types.includes('elementType') ? 'copy' : 'move';
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const types = Array.from(e.dataTransfer.types || []);
    if (types.includes('elementType') || types.includes('elementId')) {
      setDropTarget('canvas-root', 'inside');
      e.dataTransfer.dropEffect = types.includes('elementType') ? 'copy' : 'move';
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const elementId = e.dataTransfer.getData('elementId');
    const elementType = e.dataTransfer.getData('elementType') as ElementType;

    if (elementId) {
      moveElement(elementId, 'canvas-root', 'inside');
    } else if (elementType) {
      addElementFromPalette(elementType, 'canvas-root', 'inside');
    }

    setDropTarget(null, null);
    setDraggedElementId(null);
    setDraggedElementType(null);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setDropTarget(null, null);
    }
  };

  const isCanvasDropTarget = dropTargetId === 'canvas-root';

  if (isPreviewMode) {
    return (
      <div className="flex-1 overflow-auto bg-gray-100 flex justify-center">
        <div style={{ width: breakpointWidth }} className="bg-white relative">
          {page.elements.map(el => (
            <ElementRenderer key={el.id} element={el} isPreview />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#111114] flex flex-col items-center py-8">
      {/* Canvas wrapper with scale */}
      <div
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: 'top center',
          width: breakpointWidth,
          transition: 'width 0.3s ease',
          minHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* Actual canvas */}
        <div
          ref={canvasRef}
          data-canvas-root="true"
          className={`bg-white min-h-screen pb-10 relative ${isCanvasDropTarget ? 'ring-2 ring-blue-400' : ''}`}
          onClick={handleCanvasClick}
          onDragEnter={handleCanvasDragEnter}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onDragLeave={handleCanvasDragLeave}
        >
          {page.elements.map(el => (
            <ElementRenderer key={el.id} element={el} />
          ))}

          {page.elements.length === 0 && (
            <div
              data-canvas-root="true"
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
            >
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500">Start building</p>
              <p className="text-sm text-gray-400 mt-1">Double click components from the left panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Canvas info bar */}
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-4">
        <span className="text-gray-400">{breakpointWidth === '100%' ? 'Full width' : breakpointWidth}</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{Math.round(canvasScale * 100)}% zoom</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{page.elements.length} elements</span>
      </div>
    </div>
  );
};
