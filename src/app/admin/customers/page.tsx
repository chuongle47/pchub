import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CustomerDataTable, CustomerWithStats } from '@/components/admin/customers/CustomerDataTable';

export const revalidate = 0;

export const metadata = {
  title: 'Quản lý khách hàng | PCHub Admin',
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, phone, address, role, created_at')
    .order('created_at', { ascending: false });

  if (pError) {
    console.error('Error fetching profiles:', pError);
  }

  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select('id, order_number, user_id, customer_email, total_amount, status, created_at')
    .order('created_at', { ascending: false });

  if (oError) {
    console.error('Error fetching orders for customers stats:', oError);
  }

  const userOrdersMap = new Map<string, any[]>();
  const emailOrdersMap = new Map<string, any[]>();

  (orders || []).forEach((o) => {
    if (o.user_id) {
      const arr = userOrdersMap.get(o.user_id) || [];
      arr.push(o);
      userOrdersMap.set(o.user_id, arr);
    }
    if (o.customer_email) {
      const arr = emailOrdersMap.get(o.customer_email.toLowerCase()) || [];
      arr.push(o);
      emailOrdersMap.set(o.customer_email.toLowerCase(), arr);
    }
  });

  const customersWithStats: CustomerWithStats[] = (profiles || []).map((p) => {
    const userOrders = userOrdersMap.get(p.id) || (p.email ? emailOrdersMap.get(p.email.toLowerCase()) : []) || [];
    
    const total_spent = userOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      phone: p.phone,
      address: p.address,
      role: p.role,
      created_at: p.created_at,
      order_count: userOrders.length,
      total_spent,
      recent_orders: userOrders.slice(0, 5),
    };
  });

  return <CustomerDataTable initialCustomers={customersWithStats} />;
}