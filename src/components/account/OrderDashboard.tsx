'use client';

import { useState } from 'react';
import { useOrderStore } from '@/lib/store';
import OrderDetailModal from './OrderDetailModal';

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Hủy' },
] as const;

export default function OrderDashboard() {
  const storeOrders = useOrderStore(state => state.orders);
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]['key']>('shipping');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const visibleOrders = activeFilter === 'all' 
    ? storeOrders 
    : storeOrders.filter(order => order.status === activeFilter);
    
  const featured = storeOrders.find(order => order.status === 'shipping') || storeOrders[0];

  return <>
    <div className="account-tabs">
      {filters.map(filter => {
        const count = filter.key === 'all' ? storeOrders.length : storeOrders.filter(order => order.status === filter.key).length;
        return <button key={filter.key} type="button" className={activeFilter === filter.key ? 'active-blue' : ''} onClick={() => setActiveFilter(filter.key)}>{filter.label} ({count})</button>;
      })}
    </div>

    {featured && (activeFilter === 'all' || activeFilter === featured.status) && (
      <section className="order-featured">
        <div className="order-featured-head">
          <div><strong>{featured.id}</strong><span>{featured.date}</span></div>
          <span className="order-status">● {featured.status === 'pending' ? 'Chờ xác nhận' : featured.status === 'shipping' ? 'Đang giao' : featured.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}</span>
        </div>
        <div className="order-featured-body">
          <div className="order-products">
            <div className="order-thumb">
              <img src={featured.products?.[0]?.image || '/images/gpu-strix.jpg'} alt={featured.products?.[0]?.name || 'Linh kiện PC'} />
            </div>
            {featured.products?.length > 1 && <div className="order-more">+{featured.products.length - 1}</div>}
            <div className="order-total">
              <span>Tổng đơn</span>
              <strong>{(Number(featured.total) || 0).toLocaleString('vi-VN')} ₫</strong>
              <small>Thanh toán COD / Online ✓</small>
            </div>
          </div>
          <div className="order-timeline">
            <div className="done"><i>✓</i><span>Đã đặt</span></div>
            <div className="done"><i>✓</i><span>Đã xác nhận</span></div>
            <div className={featured.status === 'shipping' || featured.status === 'delivered' ? 'done' : ''}>
              <i>{featured.status === 'shipping' || featured.status === 'delivered' ? '✓' : '○'}</i>
              <span>Đang giao</span>
            </div>
            <div className={featured.status === 'delivered' ? 'done' : ''}>
              <i>{featured.status === 'delivered' ? '✓' : '○'}</i>
              <span>Giao hàng</span>
            </div>
          </div>
        </div>
        <div className="order-actions">
          <button type="button" onClick={() => setSelectedOrder(featured)}>Popup Xem nhanh</button>
          <button type="button" style={{ background: '#2563eb', color: '#fff' }} onClick={() => setSelectedOrder(featured)}>
            Xem chi tiết
          </button>
        </div>
      </section>
    )}

    <section className="recent-orders">
      <div className="recent-orders-heading">
        <h2>{activeFilter === 'all' ? 'Tất cả đơn hàng' : filters.find(filter => filter.key === activeFilter)?.label}</h2>
        <a href="/tai-khoan/don-hang">Xem tất cả →</a>
      </div>
      {visibleOrders.length ? visibleOrders.map(order => (
        <div className="recent-order-row cursor-pointer" key={order.id} onClick={() => setSelectedOrder(order)}>
          <div className="order-mini-thumb">
            <img src={order.products?.[0]?.image || '/images/gpu-strix.jpg'} alt={order.products?.[0]?.name || 'Sản phẩm'} />
          </div>
          <div>
            <strong>{order.id}</strong>
            <p className="line-clamp-1">{order.products?.[0]?.name || 'Sản phẩm linh kiện'}</p>
          </div>
          <span className={order.status === 'delivered' ? 'delivered' : order.status === 'cancelled' ? 'cancelled' : ''}>
            ● {order.status === 'pending' ? 'Chờ xác nhận' : order.status === 'shipping' ? 'Đang giao' : order.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
          </span>
          <strong>{(Number(order.total) || 0).toLocaleString('vi-VN')} ₫</strong>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
            }} 
            style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
          >
            Xem chi tiết
          </button>
        </div>
      )) : (
        <div className="orders-empty">Không có đơn hàng ở trạng thái này.</div>
      )}
    </section>

    {/* Order Detail Popup Modal */}
    {selectedOrder && (
      <OrderDetailModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    )}
  </>;
}
