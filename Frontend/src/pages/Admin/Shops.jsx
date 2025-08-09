import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import shopService from '../../services/shopService';
import api from '../../services/api';
import ShopLocationPicker from '../../components/ShopLocationPicker';

export default function AdminShops(){
  const { user, isAuthenticated } = useSelector(s=>s.auth);
  const [shops,setShops]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [creating,setCreating]=useState(false);
  const [users,setUsers]=useState([]);
  const [selectedLocation,setSelectedLocation]=useState(null); // {address, city, country, coordinates}
  const [form,setForm]=useState({ owner:'', name:'', description:'', city:'', address:'', latitude:'', longitude:''});

  useEffect(()=>{ (async()=>{ try{ setLoading(true); const [shopsRes, usersRes] = await Promise.all([
      shopService.getShops(), api.get('/users/')
    ]);
    const list= Array.isArray(shopsRes.results)? shopsRes.results : (Array.isArray(shopsRes)? shopsRes: []);
    const usersData = usersRes.data;
    const userList = Array.isArray(usersData)? usersData : (Array.isArray(usersData?.results)? usersData.results: []);
    setShops(list);
    setUsers(userList.filter(u=>u.role==='shop_owner' || u.is_staff));
  } catch(e){ setError('Failed to load shops / users'); } finally { setLoading(false);} })(); },[]);

  if(!isAuthenticated || !user?.is_staff) return <Navigate to='/' replace />;

  const handleInputChange = e => { const {name,value}=e.target; setForm(f=>({...f,[name]:value})); };

  const handleCreate = async e => { e.preventDefault(); try{ setCreating(true); setError(null); const payload = { ...form };
    if(selectedLocation){
      payload.latitude = selectedLocation.coordinates.lat;
      payload.longitude = selectedLocation.coordinates.lng;
      payload.address = selectedLocation.address;
      payload.city = selectedLocation.city || payload.city;
    }
    if(!payload.owner){ payload.owner = users.find(u=>u.id===form.owner)?.id || null; }
    const res = await api.post('/shops/', payload); setShops(prev=>[res.data, ...prev]); setForm({ owner:'', name:'',description:'',city:'',address:'',latitude:'',longitude:''}); setSelectedLocation(null); } catch(err){ setError('Creation failed'); } finally { setCreating(false);} };

  const handleDelete = async (id)=>{ if(!window.confirm('Delete this shop ?')) return; try{ await api.delete(`/shops/${id}/`); setShops(s=>s.filter(sh=>sh.id!==id)); } catch(e){ setError('Delete failed'); } };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.post(`/shops/${id}/toggle_active/`);
      const { shop } = res.data || {};
      if(shop){
        setShops(prev=> prev.map(s=> s.id===id ? {...s, is_active: shop.is_active} : s));
      }
    } catch(e){
      setError('Toggle failed');
    }
  };

  return (
    <div className='flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50'>
      <Sidebar />
      <div className='flex-1 overflow-y-auto overflow-x-hidden p-6'>
        <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-6'>Manage Shops</h1>
        {error && <div className='mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm'>{error}</div>}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 bg-white/80 rounded-2xl shadow border border-slate-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-slate-800'>All Shops ({shops.length})</h2>
            </div>
            {loading ? <div className='py-20 text-center text-slate-500'>Chargement...</div> : (
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-slate-50'>
                    <tr className='text-left text-slate-600 uppercase text-[11px] tracking-wide'>
                      <th className='px-4 py-3'>Nom</th>
                      <th className='px-4 py-3'>Ville</th>
                      <th className='px-4 py-3'>Produits</th>
                      <th className='px-4 py-3'>Actif</th>
                      <th className='px-4 py-3'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 bg-white'>
                    {shops.map(sh=>(
                      <tr key={sh.id} className='hover:bg-emerald-50/40 transition'>
                        <td className='px-4 py-3 font-medium text-slate-800'>{sh.name}</td>
                        <td className='px-4 py-3 text-slate-600'>{sh.city||'—'}</td>
                        <td className='px-4 py-3 text-slate-600'>{typeof sh.total_products==='number'? sh.total_products: '—'}</td>
                        <td className='px-4 py-3'>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sh.is_active? 'bg-emerald-100 text-emerald-700':'bg-slate-200 text-slate-600'}`}>{sh.is_active? 'Oui':'Non'}</span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={()=>handleToggleActive(sh.id)}
                              className={`text-sm font-medium transition-colors hover:underline ${sh.is_active? 'text-amber-600 hover:text-amber-700':'text-emerald-600 hover:text-emerald-700'}`}
                            >
                              {sh.is_active? 'disable':'enable'}
                            </button>
                            <span className='text-slate-300'>|</span>
                            <button
                              onClick={()=>handleDelete(sh.id)}
                              className='text-sm font-medium text-red-600 hover:text-red-700 transition-colors hover:underline'
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!shops.length && !loading && <tr><td colSpan={5} className='px-4 py-10 text-center text-slate-500'>Aucun shop</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className='bg-white/80 rounded-2xl shadow border border-slate-200 p-6 h-fit'>
            <h2 className='text-lg font-semibold text-slate-800 mb-4'>Créer / Assigner un Shop</h2>
            <form onSubmit={handleCreate} className='space-y-5'>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-1'>Owner *</label>
                <select name='owner' value={form.owner} onChange={handleInputChange} required className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400'>
                  <option value=''>-- Choisir un propriétaire --</option>
                  {users.map(u=> <option key={u.id} value={u.id}>{u.username} ({u.role || (u.is_staff?'admin':'')})</option>)}
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-1'>Nom *</label>
                <input name='name' value={form.name} onChange={handleInputChange} required className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400' placeholder='Nom du shop'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-1'>Description</label>
                <textarea name='description' value={form.description} onChange={handleInputChange} rows={3} className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400' placeholder='Brève description...'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-1'>Ville (optionnel si map)</label>
                <input name='city' value={form.city} onChange={handleInputChange} className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400' placeholder='Ex: Tunis'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-1'>Adresse (optionnel si map)</label>
                <input name='address' value={form.address} onChange={handleInputChange} className='w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400' placeholder='Rue, numéro ...'/>
              </div>
              <div>
                <label className='block text-xs font-semibold text-slate-600 mb-2'>Localisation sur la carte</label>
                <ShopLocationPicker value={selectedLocation} onChange={loc=> setSelectedLocation(loc)} />
              </div>
              <button disabled={creating} type='submit' className='w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow disabled:opacity-60'>
                {creating? 'Création...' : 'Créer le Shop'}
              </button>
            </form>
            <p className='mt-3 text-[11px] text-slate-500'>Le shop sera créé avec l'owner choisi. La localisation peut être définie via la carte (coordonnées auto).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
