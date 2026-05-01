'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ProjectRecord {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [vercel_token, setVercelKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects?projectId=${encodeURIComponent(projectId)}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to load project settings.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProject(data);
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setLoading(false);
    };

    const projectKey = `vercelToken_${projectId}`;
    const storedToken = typeof window !== 'undefined'
      ? window.localStorage.getItem(projectKey) || window.localStorage.getItem('vercelToken') || ''
      : '';
    setVercelKey(storedToken);

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) {
      setError('Project ID is missing.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const response = await fetch('/api/projects', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        title,
        slug,
        vercel_token,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || 'Unable to save project settings.');
      setSaving(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const projectKey = `vercelToken_${projectId}`;
      if (vercel_token.trim()) {
        window.localStorage.setItem(projectKey, vercel_token.trim());
      } else {
        window.localStorage.removeItem(projectKey);
      }
    }

    setSuccessMessage('Project settings saved successfully.');
    setSaving(false);
    setProject(data);
    router.refresh();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0d1117] text-white flex items-center justify-center'>
        Loading project settings...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#0d1117] text-white px-6 py-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div>
            <Link href='/dashboard' className='mb-3 inline-block text-sm text-gray-400 hover:text-white'>
              ← Back to Dashboard
            </Link>
            <h1 className='text-4xl font-bold'>Project Settings</h1>
            <p className='text-gray-400 mt-2'>Update your project title, slug, and other basic settings.</p>
          </div>
          <div className='rounded-full bg-[#1D976C] px-4 py-2 text-sm font-semibold text-black'>
            {project?.id}
          </div>
        </div>

        {error && <div className='mb-4 rounded-xl border border-red-700 bg-red-950/20 p-4 text-sm text-red-200'>{error}</div>}
        {successMessage && <div className='mb-4 rounded-xl border border-green-700 bg-emerald-950/20 p-4 text-sm text-emerald-200'>{successMessage}</div>}

        <div className='rounded-3xl border border-gray-800 bg-[#111214] p-6 space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-300'>Project title</label>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder='Project title'
              className='w-full rounded-2xl border border-gray-700 bg-[#0f1218] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-300'>Site subdomain</label>
            <input
              value={slug}
              onChange={event => setSlug(event.target.value)}
              placeholder='my-project'
              className='w-full rounded-2xl border border-gray-700 bg-[#0f1218] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500'
            />
            <p className='mt-2 text-sm text-gray-500'>This value becomes your site address on LUNIO Builder: https://{slug.replace(/^\/+/, '') || 'your-site'}.luniobuilder.com</p>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-300'>Vercel API Key</label>
            <input
              type='password'
              value={vercel_token}
              onChange={event => setVercelKey(event.target.value)}
              placeholder='Enter Vercel Personal Token'
              className='w-full rounded-2xl border border-gray-700 bg-[#0f1218] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500'
            />
            <p className='mt-2 text-sm text-gray-500'>This value is stored locally in your browser and used for Vercel publishing.</p>
          </div>

          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
            <button
              onClick={handleSave}
              disabled={saving}
              className='rounded-full bg-[#1D976C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60'
            >
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <Link
              href={`/editor?projectId=${projectId}`}
              className='rounded-full border border-gray-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800'
            >
              Open project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
