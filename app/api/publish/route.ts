import { NextResponse } from 'next/server';
import { auth } from '@/app/auth/auth';
import { supabaseServer } from '@/app/lib/supabaseServer';

export const runtime = 'nodejs';

const normalizeProjectSlug = (slug: string) => {
  return String(slug || '')
    .trim()
    .replace(/^\/+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const projectId = body?.projectId;
  const requestedSlug = body?.slug;
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const { data: project, error } = await supabaseServer
    .from('projects')
    .select('id, title, slug')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  const slugSource = requestedSlug || project.slug || project.title || `project-${Date.now()}`;
  const canonicalSlug = normalizeProjectSlug(slugSource);
  if (!canonicalSlug) {
    return NextResponse.json({ error: 'Unable to determine a publish slug' }, { status: 400 });
  }

  const { data: updatedProject, error: updateError } = await supabaseServer
    .from('projects')
    .update({ slug: canonicalSlug })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('slug')
    .single();

  if (updateError || !updatedProject) {
    return NextResponse.json({ error: 'Unable to save publish slug' }, { status: 500 });
  }

  const url = `https://${canonicalSlug}.luniobuilder.com`;
  return NextResponse.json({ url, slug: canonicalSlug });
}
