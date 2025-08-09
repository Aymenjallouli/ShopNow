import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createShop, fetchShops, updateShop, deleteShop, resetShopsState } from '../features/shops/shopsSlice';
import ShopLocationPicker from '../components/ShopLocationPicker';
import MyProductsManager from '../components/MyProductsManager';

export default function MyShop(){
  const dispatch = useDispatch();
  const { user } = useSelector(s=>s.auth);
  const { list: shops, creating, updating, deleting, loading } = useSelector(s=>s.shops);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', address:'', city:'', latitude:'', longitude:'' });
  const [selectedLocation, setSelectedLocation] = useState(null); // {address, city, country, coordinates:{lat,lng}}
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('view'); // 'view' | 'create' | 'edit'

  useEffect(()=>{
    // reset when user changes
    dispatch(resetShopsState());
    if(user){
      dispatch(fetchShops({ owner: user.id })).then(res=>{
        if(res.payload && Array.isArray(res.payload) && res.payload.length){
          setSelectedShopId(res.payload[0].id);
        }
      }).catch(()=>setError('Erreur chargement shops'));
    }
  },[user, dispatch]);

  const selectedShop = shops.find(s=>s.id===selectedShopId) || null;

  if(!user) return <div className='p-6'>Veuillez vous connecter.</div>;
  if(user.role !== 'shop_owner') return <div className='p-6'>Accès réservé aux propriétaires de shop.</div>;

  const submit = (e)=>{
    e.preventDefault();
    const payload = { ...form };
    if(selectedLocation){
      payload.latitude = selectedLocation.coordinates.lat;
      payload.longitude = selectedLocation.coordinates.lng;
      payload.address = selectedLocation.address;
      payload.city = selectedLocation.city || payload.city;
    }
    dispatch(createShop(payload)).unwrap().then(newShop=>{
      // Select the newly created shop and return to view mode
      setSelectedShopId(newShop.id);
      setForm({ name:'', description:'', address:'', city:'', latitude:'', longitude:'' });
      setSelectedLocation(null);
      setMode('view');
    }).catch(()=>{});
  };

  const startEdit = (shop) => {
    if(!shop) return;
    setSelectedShopId(shop.id);
    setForm({
      name: shop.name || '',
      description: shop.description || '',
      address: shop.address || '',
      city: shop.city || '',
      latitude: shop.latitude || '',
      longitude: shop.longitude || ''
    });
    setMode('edit');
    setSelectedLocation(null);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if(!selectedShop) return;
    const payload = { ...form };
    if(selectedLocation){
      payload.latitude = selectedLocation.coordinates.lat;
      payload.longitude = selectedLocation.coordinates.lng;
      payload.address = selectedLocation.address;
      payload.city = selectedLocation.city || payload.city;
    }
    dispatch(updateShop({ id: selectedShop.id, data: payload })).then((res)=>{
      if(!res.error){ setMode('view'); }
    });
  };

  const handleDelete = (id) => {
    if(!id) return;
    if(window.confirm('Supprimer ce shop ? Cette action est définitive.')){
      dispatch(deleteShop(id));
      if(selectedShopId===id){
        setSelectedShopId(prev=>{
          const remaining = shops.filter(s=>s.id!==id);
            return remaining.length ? remaining[0].id : null;
        });
      }
    }
  };

  const openCreate = () => {
    setForm({ name:'', description:'', address:'', city:'', latitude:'', longitude:'' });
    setSelectedLocation(null);
    setMode('create');
  };

  const cancel = () => {
    setMode('view');
    setForm({ name:'', description:'', address:'', city:'', latitude:'', longitude:'' });
    setSelectedLocation(null);
  };

  return (
    <div className='w-full min-h-screen px-6 py-6 xl:px-10 bg-gradient-to-br from-slate-50 via-white to-slate-100'>
    <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
      <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent tracking-tight'>Gestion des Shops</h1>
      <div className='flex items-center gap-3 text-xs text-slate-500'>
        <span className='px-2 py-1 rounded-lg bg-white/70 border border-slate-200 backdrop-blur-sm'>Mode: <span className='font-semibold text-slate-700'>{mode}</span></span>
        {!!shops.length && mode==='view' && (
          <button onClick={openCreate} className='px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 transition'>+ Nouveau Shop</button>
        )}
        {mode!=='view' && (
          <button onClick={cancel} className='px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition'>Retour</button>
        )}
      </div>
    </div>
        {loading && <p className='text-sm text-slate-500 mb-4'>Chargement...</p>}
        {error && <p className='text-sm text-red-600 mb-4'>{error}</p>}
  {/* VIEW MODE (list + details) */}
  {!!shops.length && mode==='view' && (
    <div className='grid xl:grid-cols-[300px_1fr] gap-10 items-start'>
      {/* Sidebar */}
      <aside className='space-y-5 xl:sticky xl:top-6 self-start'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-slate-800'>Mes Shops</h2>
          <button onClick={openCreate} className='px-2.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700'>+ Nouveau</button>
        </div>
        <div className='space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar'>
          {shops.map(s=> {
            const active = selectedShopId===s.id;
            return (
              <div key={s.id} onClick={()=>setSelectedShopId(s.id)} className={`group relative p-4 rounded-xl border cursor-pointer transition shadow-sm ${active ? 'border-emerald-500 ring-2 ring-emerald-200 bg-white' : 'border-slate-200 bg-white/60 hover:bg-white hover:border-emerald-300'}`}> 
                <div className='flex justify-between items-start gap-2'>
                  <div className='min-w-0'>
                    <p className='font-medium text-slate-800 truncate'>{s.name}</p>
                    <p className='text-[11px] text-slate-500 truncate'>{s.city || '—'}</p>
                  </div>
                  <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition'>
                    <button onClick={(e)=>{e.stopPropagation(); startEdit(s);}} className='px-2 py-1 text-[10px] rounded bg-slate-100 hover:bg-slate-200 text-slate-600'>Edit</button>
                    <button onClick={(e)=>{e.stopPropagation(); handleDelete(s.id);}} className='px-2 py-1 text-[10px] rounded bg-red-100 hover:bg-red-200 text-red-600'>Del</button>
                  </div>
                </div>
              </div>
            );
          })}
          {!shops.length && <p className='text-xs text-slate-500'>Aucun shop.</p>}
        </div>
      </aside>

      {/* Main content */}
      <section className='space-y-8'>
        {selectedShop && (
          <div className='bg-white/80 backdrop-blur-sm p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group'>
            <div className='flex flex-wrap gap-4 justify-between items-start mb-4'>
              <div className='space-y-1 min-w-[220px]'>
                <h2 className='text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-2'><span className='text-xl'>🏬</span>{selectedShop.name}</h2>
                <p className='text-xs text-slate-500'>Dernière mise à jour: {selectedShop.updated_at ? new Date(selectedShop.updated_at).toLocaleDateString() : '—'}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <button onClick={()=>startEdit(selectedShop)} className='px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'>Modifier</button>
                <button onClick={()=>handleDelete(selectedShop.id)} disabled={deleting} className='px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 shadow-sm'>{deleting ? 'Suppression...' : 'Supprimer'}</button>
              </div>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 space-y-4'>
                <p className='text-slate-600 text-sm leading-relaxed'>{selectedShop.description || <span className='italic text-slate-400'>Pas de description.</span>}</p>
                <div className='grid sm:grid-cols-2 gap-4 text-sm'>
                  <div className='p-3 rounded-xl bg-slate-50 border border-slate-100'>
                    <p className='text-[11px] uppercase tracking-wide text-slate-500 font-medium'>Adresse</p>
                    <p className='text-slate-700 font-medium'>{selectedShop.address || '—'}</p>
                  </div>
                  <div className='p-3 rounded-xl bg-slate-50 border border-slate-100'>
                    <p className='text-[11px] uppercase tracking-wide text-slate-500 font-medium'>Ville</p>
                    <p className='text-slate-700 font-medium'>{selectedShop.city || '—'}</p>
                  </div>
                  {(selectedShop.latitude && selectedShop.longitude) && (
                    <div className='p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2'>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500 font-medium'>Coordonnées</p>
                      <p className='text-slate-700 font-mono text-xs'>{selectedShop.latitude}, {selectedShop.longitude}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className='space-y-3'>
                <div className='p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100'>
                  <p className='text-[11px] uppercase tracking-wide text-emerald-600 font-semibold'>Statistiques</p>
                  <div className='mt-2 flex flex-col gap-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-600'>Produits</span>
                      <span className='font-semibold text-slate-800'>—</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-600'>Créé le</span>
                      <span className='font-semibold text-slate-800'>{selectedShop.created_at ? new Date(selectedShop.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className='bg-white/80 backdrop-blur-sm p-7 rounded-2xl border border-slate-200 shadow-sm'>
          <div className='flex items-center justify-between mb-5'>
            <h3 className='text-xl font-semibold text-slate-800 tracking-tight'>Gestion des Produits</h3>
            {!selectedShop && <span className='text-xs text-slate-400'>Sélectionnez un shop pour gérer ses produits</span>}
          </div>
          <MyProductsManager shopId={selectedShopId} />
        </div>
      </section>
    </div>
  )}
  {/* EDIT MODE */}
  {!!shops.length && mode==='edit' && (
        <div className='grid md:grid-cols-2 gap-8 items-start'>
          <form onSubmit={submitEdit} className='space-y-5 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/30 order-1'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-slate-800'>Modifier mon shop</h2>
      <button type='button' onClick={cancel} className='text-sm text-slate-500 hover:text-slate-700'>Annuler</button>
            </div>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Nom</label>
              <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
            </div>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Description</label>
              <textarea className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Adresse</label>
              <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold mb-1 text-slate-700'>Ville</label>
                <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
              </div>
              <div className='flex items-end'>
                <div className='text-xs text-slate-500'>Mettre à jour via la carte si nécessaire.</div>
              </div>
            </div>
            <div className='flex gap-3'>
              <button disabled={updating} className='bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-300/40 disabled:opacity-50'>
                {updating ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
              <button type='button' onClick={cancel} className='px-6 py-3 rounded-xl font-semibold border border-slate-300 text-slate-600 hover:bg-slate-100'>Annuler</button>
            </div>
          </form>
          <div className='space-y-4 order-2'>
            <div className='bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow border border-white/30'>
              <label className='block text-sm font-semibold mb-2 text-slate-700'>Localisation</label>
              <ShopLocationPicker value={selectedLocation} onChange={loc=> setSelectedLocation(loc)} />
              <p className='mt-3 text-xs text-slate-500'>Conseil: recherchez une adresse puis ajustez en cliquant sur la carte.</p>
            </div>
          </div>
        </div>
      )}
  {/* CREATE MODE (first or additional) */}
  { (mode==='create' || !shops.length) && (
        <div className='grid xl:grid-cols-[1fr_420px] gap-10 items-start'>
          <form onSubmit={submit} className='space-y-5 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200 order-1'>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Nom</label>
              <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
            </div>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Description</label>
              <textarea className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div>
              <label className='block text-sm font-semibold mb-1 text-slate-700'>Adresse (optionnel si carte)</label>
              <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold mb-1 text-slate-700'>Ville</label>
                <input className='border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl w-full p-3 bg-white text-slate-800 placeholder-slate-400' value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
              </div>
              <div className='flex items-end'>
                <div className='text-xs text-slate-500'>Choisissez l’emplacement exact sur la carte.</div>
              </div>
            </div>
            <div className='flex justify-start items-center gap-3'>
              <button disabled={creating} className='bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-300/40 disabled:opacity-50'>
                {creating ? 'Création...' : 'Créer le shop'}
              </button>
              {shops.length > 0 && (
                <button type='button' onClick={cancel} className='px-6 py-3 rounded-xl font-semibold border border-slate-300 text-slate-600 hover:bg-slate-100'>Annuler</button>
              )}
            </div>
          </form>
          <div className='space-y-4 order-2'>
            <div className='bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200'>
              <label className='block text-sm font-semibold mb-2 text-slate-700'>Localisation</label>
              <ShopLocationPicker value={selectedLocation} onChange={loc=> setSelectedLocation(loc)} />
              <p className='mt-3 text-xs text-slate-500'>Sélectionnez l'emplacement exact de votre shop pour faciliter les livraisons.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
