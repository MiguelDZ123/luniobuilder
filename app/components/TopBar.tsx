import React, { useState } from 'react';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff,
  ZoomIn, ZoomOut, Download, Upload, Share2, Settings,
  ChevronDown, Play
} from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import { renderElementToHtml, renderElementToReactString } from '../utils/builderUtils';
import Link from 'next/link';

export const TopBar: React.FC = () => {
  const {
    breakpoint,
    setBreakpoint,
    canvasScale,
    setCanvasScale,
    undo,
    redo,
    historyIndex,
    history,
    isPreviewMode,
    setPreviewMode,
    getCurrentPage,
    selectedElementId,
    deleteElement,
    duplicateElement,
  } = useBuilderStore();

  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [published, setPublished] = useState(false);
  const page = getCurrentPage();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handlePublish = () => {
    setPublished(true);
    setShowPublishMenu(false);
    setTimeout(() => setPublished(false), 3000);
  };

  const zoomIn = () => setCanvasScale(Math.min(canvasScale + 0.1, 2));
  const zoomOut = () => setCanvasScale(Math.max(canvasScale - 0.1, 0.25));

  const exportHTML = () => {
    const page = getCurrentPage();
    const bodyContent = page.elements.length
      ? page.elements.map(renderElementToHtml).join('')
      : '<div style="padding:32px;font-family:system-ui,sans-serif;color:#4b5563;">No content to export.</div>';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.seo.title}</title>
  <meta name="description" content="${page.seo.description}">
</head>
<body style="width:100%;margin:0;padding:0;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  ${bodyContent}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.slug.replace('/', '') || 'index'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReact = () => {
    const page = getCurrentPage();
    const bodyContent = page.elements.length
      ? page.elements.map(renderElementToReactString).join('\n')
      : "  <div style={{padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#4b5563'}}>No content to export.</div>";

    const component = `import React from 'react';

const App = () => (
  <>
${bodyContent}
  </>
);

export default App;
`;
    const blob = new Blob([component], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.slug.replace('/', '') || 'App'}.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-12 bg-[#0d1117] border-b border-gray-800 flex justify-between items-center px-4 gap-3 z-50 shrink-0">
      <div className='flex flex-row'>
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <Link href="/" className="text-white font-semibold text-sm tracking-tight">
            LUNIO Builder
          </Link>
        </div>

        {/* Page name */}
        <div className="text-gray-400 text-xs border-l border-gray-800 pl-3">
          <span className="text-gray-500">/</span> {page.name}
        </div>
      </div>
      <div className='flex flex-row'>
        {/* History */}
        <div className="flex items-center gap-1 border-r border-gray-800 pr-3">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Breakpoints */}
        <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/50">
          {[
            { id: 'desktop' as const, icon: <Monitor size={13} />, label: 'Desktop' },
            { id: 'tablet' as const, icon: <Tablet size={13} />, label: 'Tablet' },
            { id: 'mobile' as const, icon: <Smartphone size={13} />, label: 'Mobile' },
          ].map(bp => (
            <button
              key={bp.id}
              onClick={() => setBreakpoint(bp.id)}
              title={bp.label}
              className={`p-1.5 rounded-md transition-all ${breakpoint === bp.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {bp.icon}
            </button>
          ))}
        </div>
        {/* Zoom */}
        <div className="flex items-center gap-1 border-x border-gray-800 px-3">
          <button
            onClick={zoomOut}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => setCanvasScale(1)}
            className="text-xs text-gray-400 hover:text-white w-10 text-center transition-colors"
          >
            {Math.round(canvasScale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      <div className='flex flex-row gap-3'>
        {/* Element actions */}
        {selectedElementId && !isPreviewMode && (
          <div className="flex items-center gap-1 border-r border-gray-800 pr-3">
            <button
              onClick={() => duplicateElement(selectedElementId)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => deleteElement(selectedElementId)}
              className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Preview */}
        <button
          onClick={() => setPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isPreviewMode
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
        >
          {isPreviewMode ? <EyeOff size={13} /> : <Eye size={13} />}
          {isPreviewMode ? 'Edit' : 'Preview'}
        </button>

        {/* Publish */}
        <div className="relative">
          <div className="flex">
            <button
              onClick={handlePublish}
              className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-l-lg text-xs font-medium transition-all ${published
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
              {published ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Published!
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  Publish
                </>
              )}
            </button>
            <button
              onClick={() => setShowPublishMenu(!showPublishMenu)}
              className="px-1.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-r-lg text-xs border-l border-blue-500/50 transition-colors"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {showPublishMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
              <button
                onClick={handlePublish}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Share2 size={12} />
                Publish to web
              </button>
              <button
                onClick={exportHTML}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Download size={12} />
                Export HTML
              </button>
              <button
                onClick={exportReact}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Download size={12} />
                Export React
              </button>
              <button
                onClick={() => setShowPublishMenu(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Upload size={12} />
                Import project
              </button>
              <div className="border-t border-gray-800 mt-1 pt-1">
                <button
                  onClick={() => setShowPublishMenu(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Settings size={12} />
                  Site settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
