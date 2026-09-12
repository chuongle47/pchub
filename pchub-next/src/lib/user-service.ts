import { supabase } from './supabase';

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  avatar_url?: string;
  nks_user_id?: string;
  nks_token?: string;
  remember_me?: boolean;
}

export async function saveUserToDatabase(profile: UserProfile) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: profile.email,
        name: profile.name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender,
        avatar_url: profile.avatar_url,
        nks_user_id: profile.nks_user_id,
        nks_token: profile.nks_token,
        remember_me: profile.remember_me,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user to database:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Database save error:', error);
    return { success: false, error: 'Database save failed' };
  }
}

export async function getUserFromDatabase(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return { success: true, data: null };
      }
      console.error('Error fetching user from database:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Database fetch error:', error);
    return { success: false, error: 'Database fetch failed' };
  }
}

export async function updateLastLogin(email: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error updating last login:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Database update error:', error);
    return { success: false, error: 'Database update failed' };
  }
}