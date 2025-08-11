import { Link } from 'react-router-dom';
import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoreShops } from '../../features/shops/shopsSlice';
import { useTranslation } from 'react-i18next';

const StoreCard = memo(function StoreCard({ shop }) {
  const initials = (shop.name || '?').slice(0, 2).toUpperCase();
  const inactive = shop.is_active === false;
  return (
    <Link
      to={`/shops/${shop.id}`}
      className={`group rounded-2xl overflow-hidden border transition-all duration-300 relative flex flex-col ${inactive ? 'bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 border-rose-300 text-white hover:shadow-rose-300/40' : 'bg-white border-slate-100 hover:shadow-lg hover:-translate-y-1'}`}
    >
      <div className={`relative aspect-[17/8] w-full flex items-center justify-center ${inactive ? 'text-white' : 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 text-white'}`}>
        <div className="text-3xl font-extrabold tracking-tight drop-shadow-sm select-none">
          {initials}
        </div>
        <div className={`absolute inset-0 transition-colors ${inactive ? 'bg-rose-900/20 group-hover:bg-rose-900/30' : 'bg-emerald-900/0 group-hover:bg-emerald-900/10'}`} />
        {shop.city && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-medium shadow-sm flex items-center gap-1 ${inactive ? 'bg-white/90 text-rose-700' : 'bg-white/90 text-emerald-700'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${inactive ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>{shop.city}
            </div>
        )}
        {inactive && (
          <div className='absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-300 shadow-sm'>Inactif</div>
        )}
        {typeof shop.available_products === 'number' && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <span className={`px-2 py-0.5 rounded-full backdrop-blur text-[10px] font-medium border ${inactive ? 'bg-rose-50/90 text-rose-700 border-rose-200' : 'bg-emerald-50/90 text-emerald-600 border-emerald-100'}`}>
              {shop.available_products} dispo
            </span>
            {typeof shop.total_products === 'number' && shop.total_products !== shop.available_products && (
              <span className={`px-2 py-0.5 rounded-full backdrop-blur text-[10px] font-medium border ${inactive ? 'bg-rose-50/90 text-rose-600 border-rose-200' : 'bg-slate-50/90 text-slate-600 border-slate-200'}`}>
                {shop.total_products} tot
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`p-4 flex flex-col flex-1 ${inactive ? 'bg-white/10 backdrop-blur-sm' : ''}`}>
        <h3 className={`font-semibold leading-snug line-clamp-1" title={shop.name} ${inactive ? 'text-white/90 group-hover:text-white' : 'text-slate-800 group-hover:text-emerald-700'} `}>
          {shop.name}
        </h3>
        <p className={`mt-1 text-[11px] line-clamp-3 flex-1 ${inactive ? 'text-white/70' : 'text-slate-500'}`} title={shop.description}>
          {shop.description || 'Aucune description.'}
        </p>
        <div className={`mt-3 pt-2 border-t flex flex-wrap gap-1 text-[10px] ${inactive ? 'border-white/20 text-white/70' : 'border-slate-100 text-slate-600'}`}>
          {shop.address && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full max-w-full truncate border ${inactive ? 'bg-rose-50/20 border-rose-200/40 text-rose-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`} title={shop.address}>
              <svg className={`w-3 h-3 ${inactive ? 'text-rose-200' : 'text-emerald-500'}`} fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 11a3 3 0 100-6 3 3 0 000 6zm0 0v8'/></svg>
              {shop.address.length > 26 ? shop.address.slice(0,26)+'…' : shop.address}
            </span>
          )}
          {shop.country && !inactive && (
            <span className='px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200'>{shop.country}</span>
          )}
        </div>
      </div>
      <div className={`absolute inset-0 ring-0 ${inactive ? 'ring-rose-400/0 group-hover:ring-rose-300/60' : 'ring-emerald-500/0 group-hover:ring-emerald-400/60'} group-hover:ring-2 transition-all rounded-2xl pointer-events-none`} />
    </Link>
  );
});

function BrowseStores({ shops = [], loading, error, limit=6, showAll=false }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { next } = useSelector(s=>s.shops);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [autoLoading, setAutoLoading] = useState(false);
  const autoRef = useRef(false);

  const uniqueCities = useMemo(()=>{
    const set = new Set();
    shops.forEach(s=>{ if(s.city) set.add(s.city); });
    return Array.from(set).sort();
  },[shops]);

  const filtered = useMemo(()=>{
    return shops.filter(s=>{
      const matchSearch = !search || (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
      const matchCity = cityFilter==='all' || (s.city && s.city.toLowerCase() === cityFilter.toLowerCase());
      return matchSearch && matchCity;
    });
  },[shops, search, cityFilter]);

  const visible = showAll ? filtered : filtered.slice(0, limit);

  const handleLoadMore = useCallback(()=>{
    if(next){ dispatch(fetchMoreShops(next)); }
  },[next, dispatch]);

  // Auto-load all pages when showAll enabled
  useEffect(()=>{
    if(showAll && next && !autoRef.current){
      autoRef.current = true; // lock to avoid rapid loops
      setAutoLoading(true);
      dispatch(fetchMoreShops(next)).finally(()=>{ autoRef.current = false; setAutoLoading(false); });
    }
  },[showAll, next, dispatch]);

  return (
    <section className='mt-20'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight'>{t('browse_stores.title')}</h2>
          <p className='text-sm text-slate-500'>{t('browse_stores.subtitle')}</p>
        </div>
      </div>
      {/* Filters */}
      <div className='mb-5 flex flex-col md:flex-row gap-4 md:items-center'>
        <div className='flex-1 relative'>
          <input 
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder={t('browse_stores.search_placeholder')}
            className='w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 placeholder-slate-400'
          />
          {search && (
            <button type='button' onClick={()=>setSearch('')} className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500'>✕</button>
          )}
        </div>
        <div className='flex flex-col gap-2 md:items-end'>
          <div className='flex flex-wrap gap-2 max-w-[560px]'>
            {[
              {label: t('browse_stores.all_cities'), value: 'all'},
              ...uniqueCities.map(c => ({ label: c, value: c }))
            ].map(item => {
              const active = cityFilter === item.value;
              return (
                <button
                  key={item.value}
                  type='button'
                  onClick={() => setCityFilter(item.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 ${active ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-500 shadow shadow-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className='flex items-center gap-3'>
            {cityFilter !== 'all' && (
              <span className='text-[11px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200'>{t('browse_stores.filter')}: {cityFilter}</span>
            )}
            <button
              onClick={()=>{ setSearch(''); setCityFilter('all'); }}
              className='text-xs font-medium text-slate-500 hover:text-emerald-600'
            >{t('browse_stores.reset')}</button>
          </div>
        </div>
      </div>
      {loading && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {Array.from({length:limit}).map((_,i)=>(
            <div key={i} className='rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 animate-pulse'>
              <div className='aspect-[16/9] w-full bg-slate-200' />
              <div className='p-4 space-y-2'>
                <div className='h-4 w-3/4 bg-slate-200 rounded' />
                <div className='h-3 w-full bg-slate-200 rounded' />
                <div className='h-3 w-1/2 bg-slate-200 rounded' />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && !loading && <div className='text-sm text-red-600'>{String(error)}</div>}
      {!loading && !error && (
        <>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {visible.map(s => <StoreCard key={s.id} shop={s} />)}
            {visible.length === 0 && <div className='col-span-full text-sm text-slate-500'>{t('browse_stores.no_shops')}</div>}
          </div>
          {!showAll && filtered.length > limit && (
            <div className='mt-6 flex justify-center'>
              <button onClick={handleLoadMore} disabled={!next} className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${next ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}> {next ? t('browse_stores.load_more') : t('browse_stores.end_of_list')} </button>
            </div>
          )}
          {showAll && autoLoading && (
            <div className='mt-6 flex justify-center text-xs text-slate-500'>{t('browse_stores.loading_shops')}</div>
          )}
        </>
      )}
    </section>
  );
}

export default memo(BrowseStores);
