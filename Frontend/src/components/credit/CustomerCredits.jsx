import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import creditService from '../../services/creditService';

const CreditStatus = ({ status, dueDate }) => {
  const { t } = useTranslation();
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'paid';
  const daysUntilDue = dueDate ? Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  
  if (status === 'paid') {
    return (
      <div className="flex items-center gap-2 text-emerald-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium">{t('credit.status.paid')}</span>
      </div>
    );
  }
  if (isOverdue) {
    return (
      <div className="flex items-center gap-2 text-red-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{t('credit.status.overdue')}</span>
        <span className="text-xs">({Math.abs(daysUntilDue)} {t('credit.days')})</span>
      </div>
    );
  }
  if (daysUntilDue <= 7 && daysUntilDue > 0) {
    return (
      <div className="flex items-center gap-2 text-amber-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">{t('credit.status.soon')}</span>
        <span className="text-xs">({daysUntilDue} {t('credit.days')})</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-blue-700">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
      <span className="font-medium">{t('credit.status.unpaid')}</span>
      {daysUntilDue && <span className="text-xs">({daysUntilDue} {t('credit.daysLeft')})</span>}
    </div>
  );
};

const CreditCard = ({ credit }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header avec shop info */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('credit.order')} #{credit.id}</h3>
              <p className="text-sm text-slate-600">
                {credit.shop ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {credit.shop.name} - {credit.shop.city}
                  </span>
                ) : t('credit.noShop')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">${parseFloat(credit.total_price).toFixed(2)}</p>
            <CreditStatus status={credit.credit_status} dueDate={credit.payment_due_date} />
          </div>
        </div>
      </div>

      {/* Body avec détails */}
      <div className="p-6 space-y-4">
        {/* Date et échéance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('credit.orderDate')}</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(credit.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {credit.payment_due_date && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">{t('credit.dueDate')}</p>
                <p className="text-sm font-semibold text-amber-800">
                  {new Date(credit.payment_due_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Shop owner info */}
        {credit.shop && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-emerald-800">{credit.shop.owner_name}</p>
                <p className="text-sm text-emerald-600">{t('credit.shopOwner')}</p>
                <p className="text-xs text-emerald-500">{credit.shop.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Articles */}
        {credit.items && credit.items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t('credit.articles')} ({credit.items.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {credit.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.product_name}</p>
                    <p className="text-xs text-slate-500">{t('credit.quantity')}: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerCredits = () => {
  const { t } = useTranslation();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      setLoading(true);
      const response = await creditService.getMyCredits();
      setCredits(response.credits || []);
    } catch (err) {
      setError(t('credit.loadError'));
      console.error('Erreur crédits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const stats = creditService.calculateCustomerStats(credits);

  // Filtrer selon l'onglet actif
  const filteredCredits = creditService.filterCredits(credits, activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">{t('credit.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('credit.title')}</h1>
          <p className="text-slate-600">{t('credit.subtitle')}</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t('credit.stats.total')}</p>
                <p className="text-3xl font-bold text-slate-800">${stats.total.toFixed(2)}</p>
                <p className="text-xs text-slate-500">{stats.totalCount} {t('credit.stats.orders')}</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">{t('credit.stats.paid')}</p>
                <p className="text-3xl font-bold text-emerald-800">${stats.paid.toFixed(2)}</p>
                <p className="text-xs text-emerald-600">{stats.paidCount} {t('credit.stats.orders')}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">{t('credit.stats.unpaid')}</p>
                <p className="text-3xl font-bold text-amber-800">${stats.unpaid.toFixed(2)}</p>
                <p className="text-xs text-amber-600">{stats.unpaidCount} {t('credit.stats.orders')}</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t('credit.stats.overdue')}</p>
                <p className="text-3xl font-bold text-red-800">${stats.overdue.toFixed(2)}</p>
                <p className="text-xs text-red-600">{stats.overdueCount} {t('credit.stats.orders')}</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex overflow-x-auto">
              {[
                { key: 'all', label: t('credit.tabs.all'), count: stats.totalCount },
                { key: 'paid', label: t('credit.tabs.paid'), count: stats.paidCount },
                { key: 'unpaid', label: t('credit.tabs.unpaid'), count: stats.unpaidCount },
                { key: 'soon', label: t('credit.tabs.soon'), count: stats.dueSoonCount },
                { key: 'overdue', label: t('credit.tabs.overdue'), count: stats.overdueCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.key
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Liste des crédits */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredCredits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-slate-200">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('credit.noCredits')}</h3>
            <p className="text-slate-500">{t('credit.noCreditsCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCredits.map(credit => (
              <CreditCard key={credit.id} credit={credit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCredits;
