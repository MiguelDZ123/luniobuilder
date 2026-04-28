import { NextResponse } from 'next/server';
import { auth } from '../../auth/auth';
import { supabaseServer } from '../../lib/supabaseServer';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;


    const { data, error } = await supabaseServer
        .schema('next_auth')
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching users:', error)
        return null
    }
    return NextResponse.json(data);
}