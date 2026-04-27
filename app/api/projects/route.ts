import { NextResponse } from 'next/server';
import { auth } from '../../auth/auth';
import { supabaseServer } from '../../lib/supabaseServer';

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const title = body.title || 'Untitled Project';
  const slug = body.slug || `/project-${Date.now()}`;
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

  const title = body.title || 'Untitled Project';
  const slug = body.slug || `/project-${Date.now()}`;
  const content = body.content || { pages: [], currentPageId: '' };

  const { data, error } = await supabaseServer
    .from('projects')
    .update({ title, slug, content, updated_at: new Date().toISOString() })
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
