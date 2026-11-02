import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AuditLogTable, AuditLogItem } from '@/components/admin/audit-logs/AuditLogTable';

export const revalidate = 0;

export const metadata = {
  title: 'Nhật ký kiểm toán | PCHub Admin',
};

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, actor_id, action, entity, entity_id, diff, ip_address, created_at, actor:profiles!actor_id(full_name, email, role, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching audit logs:', error);
  }

  const formattedLogs: AuditLogItem[] = (logs || []).map((l: any) => ({
    ...l,
    actor: Array.isArray(l.actor) ? l.actor[0] : l.actor,
  }));

  return <AuditLogTable initialLogs={formattedLogs} />;
}