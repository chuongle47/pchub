import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ContactManagement, ContactMessage, NewsletterSubscriber } from '@/components/admin/contacts/ContactManagement';

export const revalidate = 0;

export const metadata = {
  title: 'Liên hệ & Khách hàng | PCHub Admin',
};

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const [{ data: contacts }, { data: subscribers }] = await Promise.all([
    supabase.from('contacts').select('*').order('created_at', { ascending: false }),
    supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <ContactManagement
      initialContacts={(contacts as ContactMessage[]) || []}
      initialSubscribers={(subscribers as NewsletterSubscriber[]) || []}
    />
  );
}