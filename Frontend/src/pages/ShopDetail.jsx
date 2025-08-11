import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import shopService from '../services/shopService';
// Use the unified advanced ProductCard (same as Home page) for consistency
import ProductCard from '../components/ProductCard/ProductCard';
import MiniShopMap from '../components/delivery/MiniShopMap';

// Intersection observer for infinite scroll
function useInfiniteScroll(callback, enabled = true) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) callback(); });
    }, { rootMargin: '300px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [callback, enabled]);
  return ref;
}

export default function ShopDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const PAGE_SIZE = 12;

  // SEO meta update
  useEffect(() => {
    if (shop) {
      document.title = `${shop.name} | ShopNow`;
      const desc = document.querySelector('meta[name="description"]');
      const content = shop.description ? `${shop.name} - ${shop.description.substring(0, 155)}` : `${shop.name} sur ShopNow`;
      if (desc) {
        desc.setAttribute('content', content);
      } else {
        const m = document.createElement('meta');
        m.name = 'description';
        m.content = content;
        document.head.appendChild(m);
      }
    }
  }, [shop]);

  const loadInitial = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const [shopData, statsData, firstPage] = await Promise.all([
        shopService.getShop(id),
        shopService.getShopStats(id),
        shopService.getShopProductsPaginated(id, 1, PAGE_SIZE)
      ]);
      setShop(shopData);
      setStats(statsData);
      setProducts(firstPage.results || []);
      setHasMore(!!firstPage.next);
      setPage(1);
      if (statsData?.categories?.length) {
        setCategories(statsData.categories.map(c => ({ name: c.name, count: c.count })));
      } else {
        const cats = []; const seen = new Set();
        (firstPage.results || []).forEach(p => { if (p.category_name && !seen.has(p.category_name)) { seen.add(p.category_name); cats.push({ name: p.category_name }); } });
        setCategories(cats);
      }
    } catch (e) {
      setError(t('shop.not_found'));
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await shopService.getShopProductsPaginated(id, nextPage, PAGE_SIZE);
      setProducts(prev => [...prev, ...(data.results || [])]);
      setHasMore(!!data.next);
      setPage(nextPage);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  }, [id, page, hasMore, loadingMore]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading && categoryFilter === 'all');

  const displayed = useMemo(() => (
    products.filter(p => categoryFilter === 'all' || p.category_name === categoryFilter)
  ), [products, categoryFilter]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const skeletonArray = Array.from({ length: 8 });

  // Professional skeleton loading state
  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-10 animate-pulse'>
        <div className='h-10 w-60 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg mb-6' />
        <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {skeletonArray.map((_, i) => (
            <div key={i} className='rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-sm'>
              <div className='w-full aspect-[4/3] rounded-xl bg-slate-200/70' />
              <div className='h-4 w-3/4 bg-slate-200 rounded' />
              <div className='h-3 w-1/2 bg-slate-200 rounded' />
              <div className='mt-auto flex justify-between items-center'>
                <div className='h-6 w-16 bg-slate-200 rounded-full' />
                <div className='h-8 w-20 bg-slate-300 rounded-lg' />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className='py-24 text-center text-sm text-red-600'>{error}</div>;
  if (!shop) return null;

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      {/* HERO / HEADER */}
      <div className='relative mb-12'>
        <div className='absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-slate-200/60 shadow-sm' />
        <div className='grid lg:grid-cols-3 gap-10 p-8 rounded-3xl'>
          <div className='lg:col-span-2 space-y-5'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shadow ring-2 ring-white'>
                <span className='text-xl font-bold text-white'>🏬</span>
              </div>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent'>{shop.name}</h1>
            </div>
            <p className='text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-2xl'>{shop.description || t('shop.no_description')}</p>
            <div className='flex flex-wrap gap-3 text-xs'>
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm'>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' /> {t('shop.city')}: <span className='font-medium text-slate-800'>{shop.city || '—'}</span>
              </span>
              {shop.address && (
                <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm'>
                  <span className='h-2 w-2 rounded-full bg-slate-400' /> {t('shop.address')}: <span className='font-medium text-slate-800'>{shop.address}</span>
                </span>
              )}
            </div>
            {stats && (
              <div className='grid grid-cols-3 gap-4 pt-4'>
                <div className='group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition'>
                  <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/70 to-emerald-300/70 opacity-0 group-hover:opacity-100 transition' />
                  <p className='text-[10px] uppercase tracking-wide text-slate-500 font-semibold'>{t('shop.products')}</p>
                  <p className='text-2xl font-bold text-slate-800'>{stats.total_products}</p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition'>
                  <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition' />
                  <p className='text-[10px] uppercase tracking-wide text-slate-500 font-semibold'>{t('shop.available')}</p>
                  <p className='text-2xl font-bold text-emerald-600'>{stats.available_products}</p>
                </div>
                <div className='group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition'>
                  <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition' />
                  <p className='text-[10px] uppercase tracking-wide text-slate-500 font-semibold'>{t('shop.categories')}</p>
                  <p className='text-2xl font-bold text-indigo-600'>{stats.categories?.length || 0}</p>
                </div>
              </div>
            )}
            <div>
              <Link to='/' className='inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-4'>← {t('shop.back_home')}</Link>
            </div>
          </div>
          <div className='space-y-6'>
            {/* CATEGORY FILTER PANEL */}
            <div className='rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-5 flex flex-col h-full'>
              <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-2'>
                  <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
                  {t('shop.categories')}
                </p>
                {categoryFilter !== 'all' && (
                  <button onClick={() => setCategoryFilter('all')} className='text-[11px] font-medium text-emerald-600 hover:text-emerald-700'>{t('shop.reset')}</button>
                )}
              </div>
              <div className='mb-3'>
                <input
                  type='text'
                  placeholder={t('shop.search_category')}
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  className='w-full text-[12px] px-3 py-2 rounded-lg border border-slate-300 bg-white/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none placeholder-slate-400 text-slate-800 caret-emerald-600'
                />
              </div>
              <div className='flex flex-wrap gap-2 max-h-52 overflow-auto pr-1 custom-scrollbar'>
                <button
                  type='button'
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition shadow-sm ${categoryFilter === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  {t('shop.all')} {stats?.total_products ? `(${stats.total_products})` : ''}
                </button>
                {filteredCategories.map(c => {
                  const active = categoryFilter === c.name;
                  return (
                    <button
                      key={c.name}
                      type='button'
                      onClick={() => setCategoryFilter(c.name)}
                      className={`group px-3 py-1.5 rounded-full text-[11px] font-semibold border transition shadow-sm relative ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {c.name}
                      {c.count && <span className='ml-1 text-[10px] font-medium text-slate-500'>({c.count})</span>}
                      {active && <span className='absolute inset-0 rounded-full ring-2 ring-emerald-400/40 animate-pulse pointer-events-none' />}
                    </button>
                  );
                })}
                {!filteredCategories.length && (
                  <span className='text-[11px] text-slate-400 italic px-2 py-1'>{t('shop.no_result')}</span>
                )}
              </div>
              <div className='mt-6'>
                <MiniShopMap latitude={shop.latitude} longitude={shop.longitude} name={shop.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className='mb-6 flex items-center justify-between'>
  <h2 className='text-lg font-semibold text-slate-800'>{t('shop.products')} {categoryFilter !== 'all' && <span className='text-slate-400 font-normal'>/ {categoryFilter}</span>}</h2>
  <p className='text-xs text-slate-500'>{t('shop.displayed_count', { count: displayed.length })} • {t('shop.total_count', { count: stats?.total_products })}</p>
      </div>
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {displayed.map(p => (
          <div key={p.id} className='animate-fade-in'>
            <ProductCard product={{ ...p, category: { name: p.category_name } }} />
          </div>
        ))}
        {!displayed.length && (
          <div className='col-span-full'>
            <div className='rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white/70'>
              <p className='text-sm font-medium text-slate-600 mb-1'>{t('shop.no_product_found')}</p>
              <p className='text-xs text-slate-400'>{t('shop.try_another_category')}</p>
              {categoryFilter !== 'all' && (
                <button onClick={() => setCategoryFilter('all')} className='mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700'>{t('shop.reset')}</button>
              )}
            </div>
          </div>
        )}
      </div>
      {categoryFilter === 'all' && (
        <div className='mt-12 flex justify-center'>
          {hasMore ? (
            <>
              <button
                disabled={loadingMore}
                onClick={loadMore}
                className='group relative inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-200 hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition'
              >
                {loadingMore && (
                  <span className='inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                )}
                {loadingMore ? t('shop.loading') : t('shop.load_more')}
              </button>
              <div ref={sentinelRef} className='w-px h-px' />
            </>
          ) : (
            <p className='text-xs text-slate-400'>{t('shop.end_of_list')}</p>
          )}
        </div>
      )}
    </div>
  );
}
