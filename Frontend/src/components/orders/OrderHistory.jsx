import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { fetchUserOrders } from '../../features/orders/ordersSlice';
import orderService from '../../services/orderService';

const OrderHistory = ({ orders, status, error }) => {
  const { t } = useTranslation();
  if (status === 'loading') {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/30 animate-pulse">
        <p className="text-slate-500 text-sm">{t('orders.loading', 'Loading your orders…')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-rose-200">
        <p className="text-rose-600 text-sm font-medium">{error}</p>
      </div>
    );
  }
  const [expanded, setExpanded] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const dispatch = useDispatch();

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const badge = (status) => ({
    delivered: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800'
  }[status] || 'bg-gray-100 text-gray-800');

  if (!orders || !orders.length) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/30">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('orders.noOrdersYet', 'No Orders Yet')}</h3>
        <p className="text-slate-500 mb-4">{t('orders.noOrdersMsg', "You haven't placed any orders.")}</p>
        <Link to="/" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700 transition">{t('orders.startShopping', 'Start Shopping')}</Link>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden">
      <ul className="divide-y divide-slate-200/60">
        {orders.map(o => {
          const createdAt = o.created_at || o.createdAt;
          const total = parseFloat(o.total_price || o.totalPrice || 0);
          const items = o.items || [];
          const history = o.status_history || o.statusHistory || [];
          const paymentMethod = o.payment_method || o.paymentMethod;
          const creditStatus = o.credit_status || o.creditStatus;
          return (
            <li key={o.id} className="">
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-emerald-700">{t('orders.orderNumber', {id: o.id, defaultValue: 'Order #{{id}}'})}</p>
                      {o.shop_name && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {o.shop_name}
                        </span>
                      )}
                    </div>
                    
                    {/* Section spéciale pour les demandes de crédit */}
                    {creditStatus && creditStatus !== 'none' && (
                      <div className={`mb-2 p-2 rounded-lg text-xs ${
                        creditStatus === 'requested' ? 'bg-indigo-50 border border-indigo-200' :
                        creditStatus === 'approved' ? 'bg-emerald-50 border border-emerald-200' :
                        'bg-rose-50 border border-rose-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-semibold">
                            {creditStatus === 'requested' && t('orders.creditRequested', 'Demande de crédit en attente')}
                            {creditStatus === 'approved' && t('orders.creditApproved', 'Crédit approuvé')}
                            {creditStatus === 'rejected' && t('orders.creditRejected', 'Demande de crédit rejetée')}
                          </span>
                        </div>
                        {creditStatus === 'requested' && (
                          <p className="text-indigo-700">{t('orders.creditRequestedMsg', 'Votre demande est en cours d\'examen par le shop owner.')}</p>
                        )}
                        {creditStatus === 'approved' && o.payment_due_date && (
                          <p className="text-emerald-700">
                            {t('orders.creditApprovedMsg', {date: new Date(o.payment_due_date).toLocaleDateString(), defaultValue: 'Crédit approuvé. Paiement dû le {{date}}.'})}
                          </p>
                        )}
                        {creditStatus === 'rejected' && (
                          <p className="text-rose-700">{t('orders.creditRejectedMsg', 'Votre demande de crédit a été refusée.')}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{createdAt ? new Date(createdAt).toLocaleString() : ''}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badge(o.status)}`}>{o.status}</span>
                      {paymentMethod && (
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-medium text-slate-600">{paymentMethod === 'cash_on_delivery' ? t('orders.cash', 'Cash') : paymentMethod}</span>
                      )}
                      {creditStatus && creditStatus !== 'none' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${creditStatus === 'requested' ? 'bg-indigo-100 text-indigo-700' : creditStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{t('orders.creditStatus', {status: creditStatus, defaultValue: 'Crédit: {{status}}'})}</span>
                      )}
                      {o.payment_due_date && creditStatus !== 'none' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                          {t('orders.due', {date: new Date(o.payment_due_date).toLocaleDateString(), defaultValue: 'Dû: {{date}}'})}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-slate-700">${total.toFixed(2)}</p>
                    <button onClick={() => toggle(o.id)} className="text-slate-400 hover:text-slate-600 transition" aria-label="Toggle details">
                      {expanded === o.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {expanded === o.id && (
                  <div className="mt-4 space-y-6 border-t border-slate-200 pt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">{t('orders.items', 'Items')}</h4>
                      <ul className="divide-y divide-slate-200/50 rounded-lg overflow-hidden border border-slate-200/60">
                        {items.map((it, idx) => (
                          <li key={idx} className="flex items-center justify-between px-3 py-2 bg-white/60">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                <img src={it.product?.image || '/placeholder.svg'} alt={it.product_name || it.product?.name || 'Item'} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{it.product_name || it.product?.name}</p>
                                <p className="text-xs text-slate-500">{it.quantity} x ${parseFloat(it.price || 0).toFixed(2)}</p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{(it.subtotal ? parseFloat(it.subtotal) : it.quantity * parseFloat(it.price || 0)).toFixed(2)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">{t('orders.statusTimeline', 'Status Timeline')}</h4>
                      <ol className="relative ml-2 border-l border-slate-200">
                        {history.map((h, i) => (
                          <li key={i} className="ml-4 mb-4">
                            <div className="absolute -left-1.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                            <time className="block text-[11px] text-slate-400 mb-0.5">{new Date(h.changed_at).toLocaleString()}</time>
                            <p className="text-xs font-medium text-slate-700">{t('orders.statusChange', {from: h.from || 'created', to: h.to, defaultValue: '{{from}} → {{to}}'})}</p>
                          </li>
                        ))}
                        {history.length === 0 && (
                          <li className="ml-4 mb-2 text-xs text-slate-400">{t('orders.noHistory', 'No history yet.')}</li>
                        )}
                      </ol>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">{t('orders.shippingAddress', 'Shipping Address')}</h4>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap">{o.shipping_address || o.address || t('orders.noAddress', '—')}</p>
                    </div>
                    {['pending','processing'].includes(o.status) && (
                      <div>
                        <button
                          disabled={cancellingId === o.id}
                          onClick={async () => {
                            try {
                              setCancellingId(o.id);
                              await orderService.cancelOrder(o.id);
                              await dispatch(fetchUserOrders());
                            } finally {
                              setCancellingId(null);
                            }
                          }}
                          className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {cancellingId === o.id ? t('orders.cancelling', 'Cancelling…') : t('orders.cancelOrder', 'Cancel Order')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderHistory;
