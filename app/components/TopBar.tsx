"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff,
  ZoomIn, ZoomOut, Download, Share2, Settings,
  Play,
  Check,
  Loader,
  MonitorCheck,
  Code,
  Folder,
  X,
} from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';
import {
  renderElementToHtml,
  generateReactProjectFiles,
} from '../utils/builderUtils';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

const textEncoder = new TextEncoder();
const crc32Table = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[n] = c;
}

const makeCrc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const makeDosDateTime = () => {
  const now = new Date();
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() / 2);
  return { date, time };
};

const concatUint8Arrays = (arrays: Uint8Array[]) => {
  const length = arrays.reduce((sum, current) => sum + current.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  arrays.forEach(chunk => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
};

const createZipBlob = (files: Array<{ path: string; content: string }>) => {
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  const dosDateTime = makeDosDateTime();

  files.forEach(file => {
    const fileNameBytes = textEncoder.encode(file.path);
    const fileData = textEncoder.encode(file.content);
    const crc = makeCrc32(fileData);

    const localHeader = new ArrayBuffer(30 + fileNameBytes.length);
    const localView = new DataView(localHeader);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosDateTime.time, true);
    localView.setUint16(12, dosDateTime.date, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, fileData.length, true);
    localView.setUint32(22, fileData.length, true);
    localView.setUint16(26, fileNameBytes.length, true);
    localView.setUint16(28, 0, true);
    new Uint8Array(localHeader, 30).set(fileNameBytes);

    chunks.push(new Uint8Array(localHeader));
    chunks.push(fileData);

    const centralHeader = new ArrayBuffer(46 + fileNameBytes.length);
    const centralView = new DataView(centralHeader);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosDateTime.time, true);
    centralView.setUint16(14, dosDateTime.date, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, fileData.length, true);
    centralView.setUint32(24, fileData.length, true);
    centralView.setUint16(28, fileNameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    new Uint8Array(centralHeader, 46).set(fileNameBytes);
    centralDirectory.push(new Uint8Array(centralHeader));

    offset += localHeader.byteLength + fileData.length;
  });

  const centralOffset = offset;
  const centralSize = centralDirectory.reduce((total, chunk) => total + chunk.length, 0);
  chunks.push(...centralDirectory);

  const endHeader = new ArrayBuffer(22);
  const endView = new DataView(endHeader);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, centralDirectory.length, true);
  endView.setUint16(10, centralDirectory.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  endView.setUint16(20, 0, true);
  chunks.push(new Uint8Array(endHeader));

  return new Blob(chunks as any, { type: 'application/zip' });
};

type FileTreeNode = {
  name: string;
  path?: string;
  isFile: boolean;
  children?: Record<string, FileTreeNode>;
};

const sortTreeNodes = (a: FileTreeNode, b: FileTreeNode) => {
  if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
  return a.isFile ? 1 : -1;
};

const buildFileTree = (files: Array<{ path: string; content: string }>): FileTreeNode[] => {
  const root: FileTreeNode = { name: '', isFile: false, children: {} };

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      if (!current.children) current.children = {};

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isFile,
          path: isFile ? file.path : undefined,
          children: isFile ? undefined : {},
        };
      }

      current = current.children[part];
    });
  });

  return root.children ? Object.values(root.children).sort(sortTreeNodes) : [];
};

export const TopBar: React.FC = () => {
  const {
    projectId,
    setProjectId,
    pages,
    currentPageId,
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

  const router = useRouter();
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [published, setPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeFiles, setCodeFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [selectedCodePath, setSelectedCodePath] = useState<string>('');
  const saveTimeoutRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);
  const isInitialRender = useRef(true);
  const page = getCurrentPage();
  const { status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const getVercelTokenKey = () => projectId ? `vercelToken_${projectId}` : 'vercelToken';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch(new URL('/api/users', window.location.origin));
    if (!response.ok) {
      setError('Unable to load user data.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    setUserData(data);
    setLoading(false);
  }

  const requestVercelToken = () => {
    if (typeof window === 'undefined') return null;
    const projectKey = getVercelTokenKey();
    const existingToken = window.localStorage.getItem(projectKey) || window.localStorage.getItem('vercelToken');
    if (existingToken) return existingToken;

    const token = window.prompt(
      'Enter your Vercel Personal Token (scopes: deployments.read, deployments.write, projects.read):'
    );
    if (!token) return null;
    const trimmed = token.trim();
    if (trimmed) {
      window.localStorage.setItem(projectKey, trimmed);
      return trimmed;
    }
    return null;
  };

  const publishToVercel = async () => {
    setPublishMessage('');
    setShowPublishMenu(false);

    const token = requestVercelToken();
    if (!token) {
      setPublishMessage('Vercel token required to publish.');
      return;
    }

    const defaultName = page.name || 'luniobuilder-project';
    const projectName = window.prompt('Vercel Project Name:', defaultName)?.trim() || defaultName;
    const teamId = window.prompt('Vercel Team ID (optional):', '')?.trim() || undefined;

    setIsPublishing(true);

    try {
      const response = await fetch('/api/vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          teamId,
          projectName,
          pages,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) {
        const errorMessage = typeof data?.error === 'string'
          ? data.error
          : data?.message || JSON.stringify(data) || 'Vercel deployment failed';
        throw new Error(errorMessage);
      }

      setPublished(true);
      setPublishMessage(data?.url ? `Published to ${data.url}` : 'Published successfully');
      setTimeout(() => setPublished(false), 5000);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      setPublishMessage(message || 'Publish failed. Check console for details.');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishMessage(''), 5000);
    }
  };

  const handlePublish = () => {
    publishToVercel();
  };

  const saveProject = useCallback(async (autoSave = false) => {
    if (isSavingRef.current) return;
    setSaveMessage('');
    setIsSaving(true);
    isSavingRef.current = true;

    const payload = {
      projectId,
      title: page.name,
      slug: page.slug || '/untitled',
      content: {
        pages,
        currentPageId,
      },
    };

    try {
      const response = await fetch('/api/projects', {
        method: projectId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save project');
      }

      if (data?.id) {
        setProjectId(data.id);
        if (!projectId) {
          router.replace(`/editor?projectId=${data.id}`);
        }
      }
      setSaveMessage(autoSave ? 'Auto-saved successfully' : 'Saved successfully');
    } catch (error) {
      console.error(error);
      setSaveMessage('Failed to save');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
      setTimeout(() => setSaveMessage(''), 2500);
    }
  }, [projectId, pages, currentPageId, page.name, page.slug, router, setProjectId]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    if (!projectId) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveProject(true);
      saveTimeoutRef.current = null;
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [pages, currentPageId, projectId, saveProject]);

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
<body style="width:100%;height:100%;margin:0;padding:0;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
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

  const exportReact = async () => {
    const projectName = page.name || 'LUNIOProject';
    const files = generateReactProjectFiles(pages, projectName);
    const content = createZipBlob(files);
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, '_') || 'lunio'}-react-export.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const codeTree = useMemo(() => buildFileTree(codeFiles), [codeFiles]);

  const openCodeModal = () => {
    const projectName = page.name || 'LUNIOProject';
    const files = generateReactProjectFiles(pages, projectName);
    setCodeFiles(files);
    setSelectedCodePath(files[0]?.path || '');
    setIsCodeModalOpen(true);
  };

  const selectedCodeFile = codeFiles.find(file => file.path === selectedCodePath) || codeFiles[0] || null;

  const renderTreeNodes = (nodes: FileTreeNode[], depth = 0): React.ReactNode => {
    return nodes.map(node => {
      if (node.isFile) {
        return (
          <button
            key={node.path}
            onClick={() => node.path && setSelectedCodePath(node.path)}
            className={`w-full text-left rounded-xl px-3 py-2 text-xs transition-all ${selectedCodePath === node.path ? 'bg-white/5 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            style={{ paddingLeft: `${depth * 1.1}rem` }}
          >
            {node.name}
          </button>
        );
      }

      const children = node.children ? Object.values(node.children).sort(sortTreeNodes) : [];

      return (
        <div key={node.name}>
          <div className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.25em] text-gray-500" style={{ paddingLeft: `${depth * 1.1}rem` }}>
            <span className="text-gray-300"><Folder width={'15px'} /></span>
            {node.name}
          </div>
          <div className="space-y-1">
            {renderTreeNodes(children, depth + 1)}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <header className="h-12 bg-[#0d1117] border-b border-gray-800 flex justify-between items-center px-4 gap-3 z-50 shrink-0">
        <div className='flex flex-row'>
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight">
              {userData ? `${userData.name || userData.email}!` : 'LUNIO Builder'}
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
              { id: 'widescreen' as const, icon: <Monitor size={13} />, label: 'Widescreen' },
              { id: 'desktop' as const, icon: <MonitorCheck size={13} />, label: 'Desktop (default)' },
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
          {/* Preview */}
          <button
            onClick={() => setPreviewMode(!isPreviewMode)}
            className={`flex items-center ml-2 gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isPreviewMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700'
              }`}
          >
            {isPreviewMode ? <EyeOff size={13} /> : <Eye size={13} />}
            {isPreviewMode ? 'Editor' : 'Preview'}
          </button>
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

          {publishMessage && (
            <div className="mt-1 text-xs text-gray-300 max-w-xs whitespace-normal">
              {publishMessage}
            </div>
          )}

          {/* Export*/}
          <button
            onClick={openCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700"
          >
            <Code size={13} />
            Code
          </button>

          {/* Save */}
          <button
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${projectId
              ? 'bg-green-600 text-white hover:bg-green-500'
              : 'bg-gray-700 text-gray-300 cursor-not-allowed'
              }`}
            title={projectId ? 'Save Project' : 'Create project from Dashboard first'}
          >
            {isSaving ? <Loader size={13} /> : <Check size={13} />}
            {isSaving ? 'Saving...' : 'Saved'}
          </button>

          {/* Publish */}
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={() => setShowPublishMenu(!showPublishMenu)}
                disabled={isPublishing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${published
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                  } ${isPublishing ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isPublishing ? (
                  <>
                    <Loader size={12} />
                    Publishing...
                  </>
                ) : published ? (
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
            </div>

            {showPublishMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                <button
                  onClick={handlePublish}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Share2 size={12} />
                  Publish to Vercel
                </button>
                <button
                  onClick={userData?.role !== 'pro' ? () => redirect('/pricing') : exportHTML}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Download size={12} />
                  Export HTML
                  {userData?.role !== 'pro' && (
                    <span className="ml-auto inline-flex align-center rounded-full bg-blue-500/20 text-blue-300 border border-blue-300 text-[10px] px-2 py-0.5">
                      Pro
                    </span>
                  )}
                </button>
                <button
                  onClick={userData?.role !== 'pro' ? () => redirect('/pricing') : exportReact}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Download size={12} />
                  Export React
                  {userData?.role !== 'pro' && (
                    <span className="ml-auto inline-flex align-center rounded-full bg-blue-500/20 text-blue-300 border border-blue-300 text-[10px] px-2 py-0.5">
                      Pro
                    </span>
                  )}
                </button>
                <div className="border-t border-gray-800 mt-1 pt-1">
                  <Link
                    href={`/dashboard/settings/${projectId}`}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Settings size={12} />
                    Site settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isCodeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsCodeModalOpen(false)}
        >
          <div
            className="flex h-[calc(100vh-4rem)] w-full max-w-6xl flex-col overflow-hidden border border-gray-800 bg-[#111114] shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Project Code</div>
                <div className="text-xs text-gray-400">{selectedCodeFile?.path || 'No files available'}</div>
              </div>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="rounded-md px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="hidden w-72 flex-col border-r border-gray-800 bg-[#111114] p-4 md:flex">
                <div className="text-[11px] uppercase tracking-[0.35em] text-gray-500">Files</div>
                <div className="mt-3 overflow-y-auto pr-1">
                  {renderTreeNodes(codeTree)}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
                {selectedCodeFile ? (
                  <Editor
                    height="100%"
                    language={selectedCodeFile.path.endsWith('.js') || selectedCodeFile.path.includes('jsx') ? 'javascript' :
                      selectedCodeFile.path.endsWith('.html') ? 'html' :
                        selectedCodeFile.path.endsWith('.css') ? 'css' :
                          selectedCodeFile.path.endsWith('.md') ? 'markdown' :
                            selectedCodeFile.path.endsWith('.json') ? 'json' :
                              selectedCodeFile.path.endsWith('.txt') ? 'text' :
                                selectedCodeFile.path.endsWith('.gitignore') ? 'gitignore' :
                                  'plaintext'}
                    value={selectedCodeFile.content}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineHeight: 20,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      readOnly: true,
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No generated code available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
