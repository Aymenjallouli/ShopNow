import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchShopOwnerOrders } from '../../features/orders/ordersSlice';
import orderService from '../../services/orderService';

const CreditCard = ({ order, onAction, decidingId }) => {
  const { t } = useTranslation();
  const getCreditBadge = (status) => {
    const badges = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  const getStatusLabel = (status) => {
    const labels = {
      requested: t('credit.status.requested'),
      approved: t('credit.status.approved'),
      paid: t('credit.status.paid'),
      rejected: t('credit.status.rejected')
    };
    return labels[status] || status;
  };

  const isOverdue = order.payment_due_date && 
                   order.credit_status === 'approved' && 
                   new Date(order.payment_due_date) < new Date();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header avec statut */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('credit.order')} #{order.id}</h3>
              <p className="text-sm text-slate-600">
                {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold text-slate-800">${parseFloat(order.total_price).toFixed(2)}</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCreditBadge(order.credit_status)}`}>
                {getStatusLabel(order.credit_status)}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200">
                  {t('credit.status.overdue')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations du client */}
      <div className="p-6 space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t('credit.customerInfo')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">{t('credit.fullName')}</p>
              <p className="font-semibold text-blue-900">
                {order.customer?.full_name || 
                 `${order.customer?.first_name} ${order.customer?.last_name}`.trim() || 
                 order.customer?.username || t('credit.notSpecified')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">Email</p>
              <p className="text-sm text-blue-800">{order.customer?.email || t('credit.notSpecified')}</p>
            </div>
            {order.customer?.phone_number && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">{t('credit.phone')}</p>
                <p className="text-sm text-blue-800">{order.customer.phone_number}</p>
              </div>
            )}
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">{t('credit.customerId')}</p>
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
            {t('credit.shop')}
          </h4>
          <div className="bg-white rounded-lg p-3 border border-emerald-100">
            <p className="font-semibold text-emerald-900">{order.shop_name || t('credit.noShop')}</p>
            <p className="text-xs text-emerald-600">ID: #{order.shop_id}</p>
          </div>
        </div>

        {/* Échéance */}
        {order.payment_due_date && (
          <div className={`rounded-xl p-4 border ${
            isOverdue 
              ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
              : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isOverdue ? 'bg-red-200' : 'bg-amber-200'
              }`}>
                <svg className={`w-5 h-5 ${isOverdue ? 'text-red-700' : 'text-amber-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`font-semibold ${isOverdue ? 'text-red-800' : 'text-amber-800'}`}>
                  {t('credit.dueDate')}: {new Date(order.payment_due_date).toLocaleDateString('fr-FR')}
                </p>
                <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                  {isOverdue ? t('credit.status.overdue') : t('credit.status.soon')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Articles */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t('credit.articles')} ({order.items.length})
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {order.items.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-slate-800 text-sm leading-tight">{item.product_name}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('credit.quantity')}: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex gap-3 justify-end">
            {order.credit_status === 'requested' && (
              <>
                <button
                  onClick={() => onAction(order.id, 'reject')}
                  disabled={decidingId === order.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {decidingId === order.id ? t('credit.processing') : t('credit.reject')}
                </button>
                <button
                  onClick={() => onAction(order.id, 'approve')}
                  disabled={decidingId === order.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {decidingId === order.id ? t('credit.processing') : t('credit.approve')}
                </button>
              </>
            )}
            {order.credit_status === 'approved' && (
              <button
                onClick={() => onAction(order.id, 'mark_paid')}
                disabled={decidingId === order.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {decidingId === order.id ? t('credit.processing') : t('credit.markPaid')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreditManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { shopOwnerOrders, status } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);
  const [selectedTab, setSelectedTab] = useState('all');
  const [stats, setStats] = useState({
    totalCredits: 0,
    pendingCredits: 0,
    approvedCredits: 0,
    paidCredits: 0,
    totalAmountApproved: 0,
    totalAmountPaid: 0,
    totalAmountPending: 0
  });
  const [decidingId, setDecidingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'shop_owner') {
      dispatch(fetchShopOwnerOrders());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Calculer les statistiques
    const creditOrders = shopOwnerOrders.filter(o => o.credit_status && o.credit_status !== 'none');
    const pending = creditOrders.filter(o => o.credit_status === 'requested');
    const approved = creditOrders.filter(o => o.credit_status === 'approved');
    const paid = creditOrders.filter(o => o.credit_status === 'paid');
    
    setStats({
      totalCredits: creditOrders.length,
      pendingCredits: pending.length,
      approvedCredits: approved.length,
      paidCredits: paid.length,
      totalAmountApproved: approved.reduce((sum, o) => sum + parseFloat(o.total_price), 0),
      totalAmountPaid: paid.reduce((sum, o) => sum + parseFloat(o.total_price), 0),
      totalAmountPending: pending.reduce((sum, o) => sum + parseFloat(o.total_price), 0)
    });
  }, [shopOwnerOrders]);

  const handleCreditAction = async (orderId, action) => {
    setDecidingId(orderId);
    setError(null);
    try {
      console.log('Calling decideCredit with:', { orderId, action, note: '' });
      await orderService.decideCredit({ orderId, action, note: '' });
      dispatch(fetchShopOwnerOrders()); // Refresh data
    } catch (err) {
      console.error('Credit action error:', err);
      setError(err?.response?.data?.error || 'Erreur lors de l\'action');
    } finally {
      setDecidingId(null);
    }
  };

  const filteredOrders = shopOwnerOrders.filter(o => {
    if (!o.credit_status || o.credit_status === 'none') return false;
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return o.credit_status === 'requested';
    if (selectedTab === 'approved') return o.credit_status === 'approved';
    if (selectedTab === 'paid') return o.credit_status === 'paid';
    if (selectedTab === 'overdue') {
      return o.credit_status === 'approved' && o.payment_due_date && 
             new Date(o.payment_due_date) < new Date();
    }
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
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t('credit.accessDenied')}</h1>
            <p className="text-slate-600">{t('credit.onlyShopOwner')}</p>
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
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('credit.managementTitle')}</h1>
          <p className="text-slate-600">{t('credit.managementSubtitle')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('credit.stats.total')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalCredits}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('credit.stats.pending')}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCredits}</p>
                <p className="text-xs text-slate-500">${stats.totalAmountPending.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('credit.stats.approved')}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.approvedCredits}</p>
                <p className="text-xs text-slate-500">${stats.totalAmountApproved.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('credit.stats.paid')}</p>
                <p className="text-3xl font-bold text-green-600">{stats.paidCredits}</p>
                <p className="text-xs text-slate-500">${stats.totalAmountPaid.toFixed(2)}</p>
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
              { key: 'all', label: t('credit.tabs.all'), count: stats.totalCredits },
              { key: 'pending', label: t('credit.tabs.pending'), count: stats.pendingCredits },
              { key: 'approved', label: t('credit.tabs.approved'), count: stats.approvedCredits },
              { key: 'paid', label: t('credit.tabs.paid'), count: stats.paidCredits },
              { 
                key: 'overdue', 
                label: t('credit.tabs.overdue'), 
                count: filteredOrders.filter(o => 
                  o.credit_status === 'approved' && 
                  o.payment_due_date && 
                  new Date(o.payment_due_date) < new Date()
                ).length 
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Credit List */}
        {status === 'loading' ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">{t('credit.loading')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('credit.noCredits')}</h3>
            <p className="text-slate-500">{t('credit.noCreditsCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredOrders.map(order => (
              <CreditCard 
                key={order.id} 
                order={order} 
                onAction={handleCreditAction}
                decidingId={decidingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditManagement;
