import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShopOwnerRegularOrders } from '../../features/orders/ordersSlice';

const OrderCard = ({ order }) => {
  const { t } = useTranslation();
  const getStatusBadge = (status) => {
    const badges = {
      delivered: 'bg-green-100 text-green-800 border-green-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
      paid: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: t('orders.delivered', 'Livré'),
      shipped: t('orders.shipped', 'Expédié'),
      processing: t('orders.processing', 'En traitement'),
      cancelled: t('orders.cancelled', 'Annulé'),
      pending: t('orders.pending', 'En attente'),
      paid: t('orders.paid', 'Payé')
    };
    return labels[status] || status;
  };

  const getPaymentLabel = (method) => {
    const labels = {
      cash_on_delivery: t('orders.cashOnDelivery', 'Paiement à la livraison'),
      credit: t('orders.creditPayment', 'Paiement à crédit'),
      paypal: 'PayPal',
      stripe: 'Stripe'
    };
    return labels[method] || method;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('orders.orderNumber', {id: order.id, defaultValue: 'Commande #{{id}}'})}</h3>
              <p className="text-sm text-slate-600">
                {new Date(order.created_at).toLocaleDateString('fr-FR')} - {new Date(order.created_at).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold text-slate-800">${parseFloat(order.total_price).toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Client Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('orders.customerInfo', 'Informations Client')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">{t('orders.fullName', 'Nom complet')}</p>
              <p className="font-semibold text-blue-900">
                {order.customer?.full_name || 
                 `${order.customer?.first_name} ${order.customer?.last_name}`.trim() || 
                 order.customer?.username || t('orders.notSpecified', 'Non spécifié')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">{t('orders.email', 'Email')}</p>
              <p className="text-sm text-blue-800">{order.customer?.email || t('orders.notSpecified', 'Non spécifié')}</p>
            </div>
            {order.customer?.phone_number && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">{t('orders.phone', 'Téléphone')}</p>
                <p className="text-sm text-blue-800">{order.customer.phone_number}</p>
              </div>
            )}
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">{t('orders.customerId', 'ID Client')}</p>
              <p className="text-sm font-mono text-blue-800">#{order.customer?.id}</p>
            </div>
          </div>
        </div>

        {/* Shop Information */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
          <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {t('orders.shop', 'Shop')}
          </h4>
          <div className="bg-white rounded-lg p-3 border border-emerald-100">
            <p className="font-semibold text-emerald-900">{order.shop_name || t('orders.shopNotSpecified', 'Shop non spécifié')}</p>
            <p className="text-xs text-emerald-600">ID: #{order.shop_id}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t('orders.payment', 'Paiement')}
          </h4>
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <p className="font-semibold text-purple-900">{getPaymentLabel(order.payment_method)}</p>
            {order.payment_intent_id && (
              <p className="text-xs text-purple-600 font-mono">ID: {order.payment_intent_id}</p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('orders.shippingAddress', 'Adresse de livraison')}
            </h4>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <p className="text-amber-900">{order.shipping_address}</p>
              {order.phone_number && (
                <p className="text-xs text-amber-600 mt-1">{t('orders.phoneShort', 'Tél')}: {order.phone_number}</p>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t('orders.itemsCount', {count: order.items.length, defaultValue: 'Articles ({{count}})'})}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {order.items.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-slate-800 text-sm leading-tight">{item.product_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('orders.qty', 'Qté')}: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status History */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('orders.statusTimeline', 'Historique des statuts')}
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {order.status_history.map((history, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">
                      {t('orders.statusChange', {from: history.from || 'Initial', to: getStatusLabel(history.to), defaultValue: '{{from}} → {{to}}'})}
                    </span>
                    <span className="text-slate-500">
                      {new Date(history.changed_at).toLocaleDateString('fr-FR')} {new Date(history.changed_at).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersManagement = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { shopOwnerRegularOrders, status } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);
  const [selectedTab, setSelectedTab] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalAmount: 0
  });

  useEffect(() => {
    if (user?.role === 'shop_owner') {
      dispatch(fetchShopOwnerRegularOrders());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Les commandes normales sont déjà filtrées par le backend
    const normalOrders = shopOwnerRegularOrders || [];
    
    const pending = normalOrders.filter(o => o.status === 'pending');
    const processing = normalOrders.filter(o => o.status === 'processing');
    const shipped = normalOrders.filter(o => o.status === 'shipped');
    const delivered = normalOrders.filter(o => o.status === 'delivered');
    
    setStats({
      totalOrders: normalOrders.length,
      pendingOrders: pending.length,
      processingOrders: processing.length,
      shippedOrders: shipped.length,
      deliveredOrders: delivered.length,
      totalAmount: normalOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
    });
  }, [shopOwnerRegularOrders]);

  const filteredOrders = shopOwnerRegularOrders.filter(o => {
    // Les commandes de crédit sont déjà exclues par le backend
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return o.status === 'pending';
    if (selectedTab === 'processing') return o.status === 'processing';
    if (selectedTab === 'shipped') return o.status === 'shipped';
    if (selectedTab === 'delivered') return o.status === 'delivered';
    if (selectedTab === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  if (user?.role !== 'shop_owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t('orders.accessDenied', 'Accès refusé')}</h1>
            <p className="text-slate-600">{t('orders.shopOwnerOnly', 'Cette page est réservée aux propriétaires de shops.')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('orders.managementTitle', 'Gestion des Commandes')}</h1>
          <p className="text-slate-600">{t('orders.managementDesc', 'Gérez toutes les commandes de vos shops (hors crédits)')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('orders.totalOrders', 'Total Commandes')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalOrders}</p>
                <p className="text-xs text-slate-500">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('orders.pending', 'En attente')}</p>
                <p className="text-3xl font-bold text-gray-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('orders.processing', 'En traitement')}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.processingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('orders.delivered', 'Livrées')}</p>
                <p className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: t('orders.all', 'Toutes'), count: stats.totalOrders },
              { key: 'pending', label: t('orders.pending', 'En attente'), count: stats.pendingOrders },
              { key: 'processing', label: t('orders.processing', 'En traitement'), count: stats.processingOrders },
              { key: 'shipped', label: t('orders.shipped', 'Expédiées'), count: stats.shippedOrders },
              { key: 'delivered', label: t('orders.delivered', 'Livrées'), count: stats.deliveredOrders },
              { 
                key: 'cancelled', 
                label: t('orders.cancelled', 'Annulées'), 
                count: filteredOrders.filter(o => o.status === 'cancelled').length 
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  selectedTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {status === 'loading' ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">{t('orders.loadingOrders', 'Chargement des commandes...')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('orders.noOrdersFound', 'Aucune commande trouvée')}</h3>
            <p className="text-slate-500">{t('orders.noOrdersFilter', 'Aucune commande ne correspond à ce filtre.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
