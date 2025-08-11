import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero = ({ onShopNowClick, onBrowseCategoriesClick }) => {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 mb-12">
      <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">{t('hero.title2')}</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onShopNowClick}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
              >
                🛍️ {t('hero.shopNow')}
              </button>
              <button 
                onClick={onBrowseCategoriesClick}
                className="px-8 py-4 border-2 border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 font-semibold rounded-2xl hover:bg-emerald-50 transition-all duration-200"
              >
                📂 {t('hero.browseCategories')}
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">{t('hero.qualityAssured')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('hero.premiumProducts')}</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">{t('hero.fastDelivery')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('hero.twoDayShipping')}</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">{t('hero.securePayment')}</span>
                <span className="text-xs text-slate-500 mt-1">{t('hero.ssl')}</span>
              </div>
            </div>
          </div>
          
          {/* Hero Image/Visual */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform sm:left-1/2 sm:top-0 sm:translate-x-0 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
            <div className="mx-auto max-w-3xl">
              <div className="relative lg:max-w-lg">
                <div className="relative h-80 w-72 overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 sm:h-64 sm:w-96 lg:h-80 lg:w-80 shadow-2xl shadow-slate-200/50 border border-slate-200/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-cyan-50 opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{t('hero.premiumShopping')}</h3>
                      <p className="text-sm text-slate-600">{t('hero.curatedForYou')}</p>
                    </div>
                  </div>
                  
                  {/* Floating elements for visual appeal */}
                  <div className="absolute top-6 right-6 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute bottom-10 left-8 w-3 h-3 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full animate-bounce shadow-lg"></div>
                  <div className="absolute top-1/3 left-6 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-70 shadow-lg"></div>
                  
                  {/* Decorative circles */}
                  <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-cyan-200 to-cyan-300 rounded-full opacity-20"></div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 opacity-30">
        <svg width="404" height="384" fill="none" viewBox="0 0 404 384" className="text-emerald-100">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="384" fill="url(#hero-pattern)" />
        </svg>
      </div>
      
      {/* Additional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-50/20 -z-10"></div>
    </div>
  );
};

export default Hero;
