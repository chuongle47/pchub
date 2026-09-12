'use client';

import { useState } from 'react';
import { useOrderStore } from '@/lib/store';

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Hủy' },
] as const;

export default function OrderDashboard() {
  const storeOrders = useOrderStore(state => state.orders);
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]['key']>('all');

  const orders = storeOrders.map(o => ({
    id: o.id,
    date: o.date,
    status: o.status,
    statusLabel: o.status === 'pending' ? 'Chờ xác nhận' :
                 o.status === 'shipping' ? 'Đang giao' :
                 o.status === 'delivered' ? 'Đã giao' : 'Đã hủy',
    total: o.total.toLocaleString('vi-VN') + ' ₫',
    product: o.products[0]?.name || 'Linh kiện PC',
    image: o.products[0]?.image || '/images/gpu-strix.jpg',
    moreCount: o.products.length > 1 ? o.products.length - 1 : 0
  }));

  const visibleOrders = activeFilter === 'all' ? orders : orders.filter(order => order.status === activeFilter);
  const featured = orders.find(order => order.status === 'shipping') || orders[0];

  return <>
    <div className="account-tabs">
      {filters.map(filter => {
        const count = filter.key === 'all' ? orders.length : orders.filter(order => order.status === filter.key).length;
        return <button key={filter.key} type="button" className={activeFilter === filter.key ? 'active-blue' : ''} onClick={() => setActiveFilter(filter.key)}>{filter.label} ({count})</button>;
      })}
    </div>
    {featured && (activeFilter === 'all' || activeFilter === featured.status) && <section className="order-featured"><div className="order-featured-head"><div><strong>{featured.id}</strong><span>{featured.date}</span></div><span className="order-status">● {featured.statusLabel}</span></div><div className="order-featured-body"><div className="order-products"><div className="order-thumb"><img src={featured.image} alt={featured.product} /></div>{featured.moreCount > 0 && <div className="order-more">+{featured.moreCount}</div>}<div className="order-total"><span>Tổng đơn</span><strong>{featured.total}</strong><small>VNPay ✓</small></div></div><div className="order-timeline"><div className="done"><i>✓</i><span>Đã đặt</span></div><div className="done"><i>✓</i><span>Đã xác nhận</span></div><div className={featured.status === 'shipping' || featured.status === 'delivered' ? 'done' : ''}><i>{featured.status === 'shipping' || featured.status === 'delivered' ? '✓' : '○'}</i><span>Đang giao</span></div><div className={featured.status === 'delivered' ? 'done' : ''}><i>{featured.status === 'delivered' ? '✓' : '○'}</i><span>Giao hàng</span></div></div></div><div className="order-actions"><button type="button">Liên hệ hỗ trợ</button><a href={`/tai-khoan/don-hang/${featured.id}`}>Xem chi tiết</a></div></section>}
    <section className="recent-orders"><div className="recent-orders-heading"><h2>{activeFilter === 'all' ? 'Tất cả đơn hàng' : filters.find(filter => filter.key === activeFilter)?.label}</h2><a href="/tai-khoan/don-hang">Xem tất cả →</a></div>{visibleOrders.length ? visibleOrders.map(order => <div className="recent-order-row" key={order.id}><div className="order-mini-thumb"><img src={order.image} alt={order.product} /></div><div><strong>{order.id}</strong><p className="line-clamp-1">{order.product}</p></div><span className={order.status === 'delivered' ? 'delivered' : order.status === 'cancelled' ? 'cancelled' : ''}>● {order.statusLabel}</span><strong>{order.total}</strong><a href={`/tai-khoan/don-hang/${order.id}`}>Xem chi tiết</a></div>) : <div className="orders-empty">Không có đơn hàng ở trạng thái này.</div>}</section>
  </>;
}

