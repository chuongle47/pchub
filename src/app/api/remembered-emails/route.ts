import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, name, avatar_url, last_login_at')
      .eq('remember_me', true)
      .order('last_login_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      accounts: data || [] 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}