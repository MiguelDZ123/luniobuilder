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
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Unable to fetch user data' }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(request: Request) { 
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;

    try {
        const body = await request.json();
        const { name, email, role } = body;
        const updates: { name?: string; email?: string; role?: string } = {};

        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) updates.role = role;
        const { data, error } = await supabaseServer
            .schema('next_auth')
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select('*')
            .single();
        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Unable to update user data' }, { status: 500 });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}