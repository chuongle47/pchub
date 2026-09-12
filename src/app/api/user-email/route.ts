import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('email, remember_me')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json({ success: true, exists: false });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      exists: true,
      remember_me: data.remember_me 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}