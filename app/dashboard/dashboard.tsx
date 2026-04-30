'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/home/Header';

interface ProjectRecord {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null }>({ isOpen: false, projectId: null });
  const [roleUpdated, setRoleUpdated] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated' || roleUpdated) {
      return;
    }

    if (searchParams.get('checkout_success') !== 'true') {
      return;
    }

    const patchRole = async () => {
      setRoleUpdated(true);

      const response = await fetch(new URL('/api/users', window.location.origin), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'pro' }),
      });

      if (response.ok) {
        await fetchUserData();
      } else {
        const responseData = await response.json().catch(() => null);
        setError(responseData?.error || 'Unable to update subscription role.');
      }

      router.replace('/dashboard');
    };

    patchRole();
  }, [status, searchParams, roleUpdated, router]);

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

  const getProjectLimitForRole = (role?: string) => {
    if (!role) return 3;

    switch (role.toLowerCase()) {
      case 'admin':
      case 'owner':
        return null;
      case 'pro':
        return 20;
      case 'business':
        return 50;
      case 'free':
      default:
        return 1;
    }
  };

  const projectLimit = getProjectLimitForRole(userData?.role);
  const projectCount = projects.length;
  const reachedProjectLimit = projectLimit !== null && projectCount >= projectLimit;

  const createProject = async () => {
    if (reachedProjectLimit) {
      setError(`Your ${userData?.role || 'current'} plan allows up to ${projectLimit} projects.`);
      return;
    }

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

  const deleteProject = async (projectId: string) => {

    setDeletingProjectId(projectId);
    setError(null);

    const response = await fetch('/api/projects', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data?.error || 'Unable to delete project');
      setDeletingProjectId(null);
      return;
    }

    setProjects(prev => prev.filter(project => project.id !== projectId));
    setDeletingProjectId(null);
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
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 mb-8'>
          <div>
            <Link href='/' className='mb-40'>← Back to Home</Link>
            <div className='flex flex-row items-center mt-10 gap-5'>
              <h1 className='flex text-3xl font-bold'>{userData ? `👋🏼 Hi, ${userData.name || userData.email}!` : 'LUNIO Builder'}</h1>
              {userData?.role && (
                <span className={`flex px-3 py-1 text-xs font-semibold rounded-full 
              ${userData.role.toLowerCase() === 'free' ? 'bg-gray-500/20 text-gray-300 border border-gray-500' :
                    userData.role.toLowerCase() === 'pro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500' :
                      userData.role.toLowerCase() === 'business' ? 'bg-green-500/20 text-green-300 border border-green-500' :
                        'bg-red-500/20 text-red-300 border border-red-500'}`}>
                  {userData.role}
                </span>
              )}
            </div>
            <p className='text-gray-400 mt-2'>Create new projects, open saved work, and go directly to the editor.</p>
          </div>
          <button
            onClick={createProject}
            disabled={saving || reachedProjectLimit || !userData}
            className='rounded-full px-5 py-3 text-sm font-semibold text-white border-2 border-white/20 transition hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent'
          >
            {reachedProjectLimit
              ? `Limit reached (${projectCount}/${projectLimit})`
              : saving
                ? 'Creating…'
                : 'Create New Project'}
          </button>
        </div>

        {error && <div className='mb-4 rounded-xl border border-red-700 bg-red-950/20 p-4 text-sm text-red-200'>{error}</div>}
        {reachedProjectLimit && projectLimit !== null && (
          <div className='mb-4 rounded-xl border border-yellow-700 bg-yellow-950/20 p-4 text-sm text-yellow-200'>
            Your {userData?.role || 'current'} plan allows up to {projectLimit} projects. Delete an existing project to create more.
          </div>
        )}

        <div className='grid gap-4'>
          {loading && <div className='rounded-xl border border-gray-800 bg-[#111214] p-6 text-gray-300'>Loading your projects...</div>}
          {!loading && projects.length === 0 && (
            <div className='rounded-3xl border border-gray-800 bg-[#111214] p-8 text-gray-300'>
              <h2 className='text-xl font-semibold text-white'>No projects yet</h2>
              <p className='mt-2 text-sm text-gray-400'>Click the button above to create your first project and start designing in the editor.</p>
            </div>
          )}
          {projects.map(project => (
            <div key={project.id} className='rounded-3xl border border-gray-800 bg-[#111214] p-6 transition hover:border-[#1D976C] hover:bg-[#14161c]'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h3 className='text-2xl font-semibold'>{project.title}</h3>
                  <p className='mt-2 text-sm text-gray-400'>Last updated {new Date(project.updated_at).toLocaleString()}</p>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  <Link href={`/editor?projectId=${project.id}`} className='rounded-full bg-[#1D976C] px-3 py-2 text-xs font-semibold text-black transition hover:opacity-90'>
                    Open
                  </Link>
                  <Link href={`/dashboard/settings/${project.id}`} className='rounded-full bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90'>
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteModal({ isOpen: true, projectId: project.id });
                    }}
                    disabled={deletingProjectId === project.id}
                    className='rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60'
                  >
                    {deletingProjectId === project.id ? 'Deleting…' : 'Delete'}
                  </button>
                  {deleteModal.isOpen && deleteModal.projectId === project.id && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                      <div className='bg-[#111214] rounded-xl p-6 w-full max-w-sm'>
                        <h2 className='text-xl font-semibold text-white'>Confirm Deletion</h2>
                        <p className='mt-2 text-sm text-gray-400'>Are you sure you want to delete this project? This action cannot be undone.</p>
                        <div className='mt-6 flex justify-end gap-4'>
                          <button
                            onClick={() => {
                              deleteProject(project.id);
                              setDeleteModal({ isOpen: false, projectId: null });
                            }}
                            disabled={deletingProjectId === project.id}
                            className='px-4 py-2 rounded-lg bg-red-600 text-sm text-white transition hover:bg-red-500 disabled:bg-red-500 disabled:opacity-80'
                          >
                            {deletingProjectId === project.id ? 'Deleting…' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: false, projectId: null })}
                            className='px-4 py-2 rounded-lg bg-gray-700 text-sm text-gray-300 transition hover:bg-gray-600'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
