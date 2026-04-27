'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProjectRecord {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/projects');
    if (!response.ok) {
      setError('Unable to load projects.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    setProjects(data || []);
    setLoading(false);
  };

  const createProject = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      title: 'New Project',
      slug: `/project-${Date.now()}`,
      content: {
        pages: [
          {
            id: 'page-1',
            name: 'Home',
            slug: '/',
            elements: [],
            seo: {
              title: 'My Website',
              description: '',
              keywords: '',
            },
          },
        ],
        currentPageId: 'page-1',
      },
    };

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data?.error || 'Unable to create project');
      setSaving(false);
      return;
    }

    router.push(`/editor?projectId=${data.id}`);
  };

  if (status === 'loading') {
    return <div className='min-h-screen bg-[#0d1117] text-white flex items-center justify-center'>Loading projects...</div>;
  }

  if (!session) {
    return (
      <div className='min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center gap-6 p-6'>
        <h1 className='text-3xl font-semibold'>Sign in to access your dashboard</h1>
        <Link href='/' className='px-5 py-3 rounded-lg bg-[#1D976C] text-black font-semibold'>Return to home</Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#0d1117] text-white px-6 py-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div>
            <Link href='/' className='mb-5'>← Back to Home</Link>
            <h1 className='text-4xl font-bold'>Your Projects</h1>
            <p className='text-gray-400 mt-2'>Create new projects, open saved work, and go directly to the editor.</p>
          </div>
          <button
            onClick={createProject}
            disabled={saving}
            className='rounded-full px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60'
            style={{ backgroundImage: 'linear-gradient(90deg, #1D976C, #93F9B9)' }}
          >
            {saving ? 'Creating…' : 'Create New Project'}
          </button>
        </div>

        {error && <div className='mb-4 rounded-xl border border-red-700 bg-red-950/20 p-4 text-sm text-red-200'>{error}</div>}

        <div className='grid gap-4'>
          {loading && <div className='rounded-xl border border-gray-800 bg-[#111214] p-6 text-gray-300'>Loading your projects...</div>}
          {!loading && projects.length === 0 && (
            <div className='rounded-3xl border border-gray-800 bg-[#111214] p-8 text-gray-300'>
              <h2 className='text-xl font-semibold text-white'>No projects yet</h2>
              <p className='mt-2 text-sm text-gray-400'>Click the button above to create your first project and start designing in the editor.</p>
            </div>
          )}
          {projects.map(project => (
            <Link key={project.id} href={`/editor?projectId=${project.id}`} className='group rounded-3xl border border-gray-800 bg-[#111214] p-6 transition hover:border-[#1D976C] hover:bg-[#14161c]'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <h3 className='text-2xl font-semibold'>{project.title}</h3>
                  <p className='mt-2 text-sm text-gray-400'>Last updated {new Date(project.updated_at).toLocaleString()}</p>
                </div>
                <span className='rounded-full bg-[#1D976C] px-3 py-1 text-xs font-semibold text-black'>Open</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
