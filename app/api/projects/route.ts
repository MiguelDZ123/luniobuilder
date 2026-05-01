import { NextResponse } from 'next/server';
import { auth } from '../../auth/auth';
import { supabaseServer } from '../../lib/supabaseServer';

const normalizeProjectSlug = (slug?: string): string => {
  if (!slug) return '';
  let cleaned = String(slug).trim().toLowerCase();
  if (cleaned.startsWith('/')) {
    cleaned = cleaned.replace(/^\/+/, '');
  }
  cleaned = cleaned.replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
  return cleaned;
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (projectId) {
    const { data, error } = await supabaseServer
      .from('projects')
      .select('id, title, slug, content, created_at, updated_at')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabaseServer
    .from('projects')
    .select('id, title, slug, content, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

const getProjectLimitForRole = (role?: string) => {
  if (!role) return 3;

  switch (role.toLowerCase()) {
    case 'admin':
    case 'owner':
      return null;
    case 'pro':
    case 'premium':
    case 'team':
      return 20;
    case 'business':
      return 50;
    case 'free':
    case 'basic':
    default:
      return 3;
  }
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user, error: userError } = await supabaseServer
    .schema('next_auth')
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const projectLimit = getProjectLimitForRole(user?.role);
  if (projectLimit !== null) {
    const { count, error: countError } = await supabaseServer
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (typeof count === 'number' && count >= projectLimit) {
      return NextResponse.json(
        { error: `Project limit reached for ${user?.role || 'your'} role.`, limit: projectLimit },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const title = body.title || 'Untitled Project';
  const slug = normalizeProjectSlug(body.slug) || `project-${Date.now()}`;
  const content = body.content || { pages: [], currentPageId: '' };

  const { data, error } = await supabaseServer
    .from('projects')
    .insert({ user_id: userId, title, slug, content })
    .select('id, title, slug, content, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const projectId = body.projectId;
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    updates.title = body.title || 'Untitled Project';
  }

  if (body.slug !== undefined) {
    updates.slug = normalizeProjectSlug(body.slug) || `project-${Date.now()}`;
  }

  if (body.content !== undefined) {
    updates.content = body.content;
  }

  if (body.vercel_token !== undefined) {
    updates.vercel_token = body.vercel_token;
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: 'No project fields provided to update' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('id, title, slug, content, created_at, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const projectId = body.projectId;
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
