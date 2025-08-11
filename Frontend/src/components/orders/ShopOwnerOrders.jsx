import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShopOwnerOrders } from '../../features/orders/ordersSlice';
import shopService from '../../services/shopService';

const statusBadge = (s) => ({
  delivered: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800'
}[s] || 'bg-gray-100 text-gray-800');

const creditBadge = (s) => ({
  requested: 'bg-indigo-100 text-indigo-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700'
}[s] || 'bg-slate-100 text-slate-600');

export default function ShopOwnerOrders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { shopOwnerOrders, status, error } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    console.log('ShopOwnerOrders: user:', user);
    console.log('ShopOwnerOrders: shopOwnerOrders:', shopOwnerOrders);
    console.log('ShopOwnerOrders: status:', status);
    console.log('ShopOwnerOrders: error:', error);
    
    if (user && (user.is_staff || user.role === 'shop_owner')) {
      console.log('ShopOwnerOrders: Fetching orders for user with role:', user.role);
      
      // Debug: Check user's shops
      if (user.id) {
        shopService.getMyShops(user.id).then(shops => {
          console.log('ShopOwnerOrders: User shops:', shops);
        }).catch(err => {
          console.log('ShopOwnerOrders: Error fetching shops:', err);
        });
      }
      
      dispatch(fetchShopOwnerOrders());
    } else {
      console.log('ShopOwnerOrders: User does not have proper role');
    }
  }, [user, dispatch]);

  if (!user || !(user.is_staff || user.role === 'shop_owner')) {
    return null;
  }

  // Filtrer les commandes pour exclure les crédits (qui sont maintenant gérés dans une page séparée)
  const regularOrders = shopOwnerOrders.filter(o => 
    !o.credit_status || o.credit_status === 'none' || o.payment_method !== 'credit'
  );
  
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">{t('shopOwnerOrders.title', 'Commandes de mes shops')}</h3>
        <div className="text-xs text-slate-500">
          {t('shopOwnerOrders.found', {count: regularOrders.length, defaultValue: '{{count}} commande(s) trouvée(s)'})}
        </div>
      </div>
      {status === 'loading' && <p className="text-sm text-slate-500">{t('shopOwnerOrders.loading', 'Chargement…')}</p>}
      {!regularOrders.length && status !== 'loading' && (
        <p className="text-sm text-slate-500">{t('shopOwnerOrders.none', 'Aucune commande trouvée.')}</p>
      )}
      <ul className="divide-y divide-slate-200/60">
        {regularOrders.map(o => (
          <li key={o.id} className="py-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-800">{t('shopOwnerOrders.orderNumber', {id: o.id, defaultValue: 'Commande #{{id}}'})}</p>
                  {o.shop_name && <span className="text-slate-400 text-sm font-normal">/ {o.shop_name}</span>}
                </div>
                {/* Informations client */}
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-1">{t('shopOwnerOrders.customer', 'Client')}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium text-blue-800">
                        {o.customer?.full_name || o.customer_name || t('shopOwnerOrders.notAvailable', 'N/A')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-blue-700">{o.customer?.email || o.customer_email}</span>
                    </div>
                    {o.customer?.phone_number && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-blue-700">{o.customer.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Statuts et infos commande */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${statusBadge(o.status)}`}>{t(`orders.${o.status}`, o.status)}</span>
                  {o.payment_method && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                      {o.payment_method === 'cash_on_delivery' ? t('orders.cashOnDelivery', 'Cash') : o.payment_method}
                    </span>
                  )}
                  <span className="text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
                  <span className="text-slate-600 font-semibold">{t('shopOwnerOrders.total', 'Total')}: ${parseFloat(o.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* Items */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {o.items.slice(0,6).map((it,i)=>(
                <div key={i} className="bg-white/60 rounded-lg border border-slate-200 p-3 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">{it.product_name}</span>
                  <span className="text-slate-500">{t('orders.qty', 'Qté')}: {it.quantity} x {parseFloat(it.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
