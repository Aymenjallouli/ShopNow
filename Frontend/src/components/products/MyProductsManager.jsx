import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/products/productsSlice';
import { fetchMyProducts, createMyProduct, updateMyProduct, deleteMyProduct } from '../../features/products/myProductsSlice';
import productService from '../../services/productService';

export default function MyProductsManager({ shopId }){
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(s=>s.auth);
  const { items, loading, creating, error } = useSelector(s=>s.myProducts);
  const { categories } = useSelector(s=>s.products);
  const [form, setForm] = useState({ name:'', description:'', price:'', discount_price:'', stock:'', status:'available', image:null, category:'', featured:false, newCategoryName:'' });
  const [editingId, setEditingId] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [catError, setCatError] = useState(null);
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryPreview, setNewCategoryPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(()=>{
    if(user && user.role==='shop_owner' && shopId){
      dispatch(fetchMyProducts(shopId));
      if(!categories || categories.length===0){
        dispatch(fetchCategories());
      }
    }
  },[user, shopId]);

  const submit = (e)=>{
    e.preventDefault();
    let payload = { ...form };
    
    // Handle image upload to Cloudinary if file selected
    const uploadImage = async () => {
      if(form.image && typeof form.image !== 'string' && form.image instanceof File){
        try {
          const cloudData = new FormData();
          cloudData.append('file', form.image);
          cloudData.append('upload_preset', 'ml_default');
          cloudData.append('api_key', '411164346446782');
          cloudData.append('timestamp', Math.floor(Date.now() / 1000));
          const res = await fetch('https://api.cloudinary.com/v1_1/duluvuhp4/image/upload', {
            method: 'POST',
            body: cloudData
          });
          const data = await res.json();
          if (data.secure_url) {
            return data.secure_url;
          } else {
            throw new Error('Cloudinary upload failed');
          }
        } catch(e) {
          console.error('Image upload error:', e);
          return null;
        }
      }
      return form.image; // Return existing URL or null
    };

    const processSubmit = async () => {
      const imageUrl = await uploadImage();
      payload.image = imageUrl;
      
      if(creatingCategory && form.newCategoryName){
        payload.category_name = form.newCategoryName;
      }
      if(payload.price) payload.price = parseFloat(payload.price);
      if(payload.discount_price) payload.discount_price = parseFloat(payload.discount_price);
      if(payload.stock) payload.stock = parseInt(payload.stock,10);
      if(!payload.category) delete payload.category;
      delete payload.newCategoryName;
      
  if(shopId) payload.shop = shopId;
  const action = editingId ? updateMyProduct({id: editingId, data: payload}) : createMyProduct(payload);
      dispatch(action).unwrap().then(()=>{
        setForm({ name:'', description:'', price:'', discount_price:'', stock:'', status:'available', image:null, category:'', featured:false, newCategoryName:'' });
        setCreatingCategory(false);
        setEditingId(null);
        setPreviewImage(null);
      }).catch(()=>{});
    };
    
    processSubmit();
  };

  const normalizeName = (str='') => {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu,'')
      .replace(/\s+/g,' ');
  };

  const matchedExistingCategory = (()=>{
    if(!form.newCategoryName) return null;
    const target = normalizeName(form.newCategoryName);
    return (categories||[]).find(c=> normalizeName(c.name) === target) || null;
  })();

  const createCategory = async ()=>{
    if(!form.newCategoryName) return;
    setCatError(null);
    try {
      let imageUrl = null;
      // Upload image if provided and not duplicate (only attempt to set image for truly new category)
      if(newCategoryImage && !matchedExistingCategory){
        const cloudData = new FormData();
        cloudData.append('file', newCategoryImage);
        cloudData.append('upload_preset', 'ml_default');
        cloudData.append('api_key', '411164346446782');
        cloudData.append('timestamp', Math.floor(Date.now() / 1000));
        try {
          const res = await fetch('https://api.cloudinary.com/v1_1/duluvuhp4/image/upload', { method:'POST', body: cloudData });
          const data = await res.json();
          if(data.secure_url) imageUrl = data.secure_url;
        } catch(e){ console.error('Cat image upload error', e); }
      }
      const payload = { name: form.newCategoryName };
      if(imageUrl) payload.image = imageUrl;
      const cat = await productService.createCategory(payload);
      setForm(f=>({...f, category: cat.id, newCategoryName:''}));
      setNewCategoryImage(null);
      setNewCategoryPreview(null);
      dispatch(fetchCategories());
      setCreatingCategory(false);
    } catch(e){
      setCatError('Erreur création catégorie');
    }
  };

  const startEdit = (p)=>{
    setEditingId(p.id);
    setForm({ name:p.name, description:p.description||'', price:String(p.price), discount_price:String(p.discount_price||''), stock:String(p.stock), status:p.status, image:null, category:p.category||'', featured:p.featured||false, newCategoryName:'' });
    setPreviewImage(p.image);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files && files[0]) {
        setForm(f=>({...f, [name]: files[0]}));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setForm(f=>({...f, [name]: name === 'featured' ? checked : value}));
    }
  };

  const remove = (id)=>{
  if(!window.confirm(t('myProductsManager.confirmDelete', 'Supprimer ce produit ?'))) return;
    dispatch(deleteMyProduct(id));
  };

  return (
  <div className='space-y-8'>
      <div className='flex items-center justify-between'>
  <h2 className='text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent'>{t('myProductsManager.title', 'Mes Produits')}</h2>
      </div>
  <div className='grid md:grid-cols-2 gap-8'>
        <form onSubmit={submit} className='space-y-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20'>
          <h3 className='text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2'>
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 15H9v-2l8.586-8.586z" />
            </svg>
            {editingId ? t('myProductsManager.editProduct', 'Modifier le produit') : t('myProductsManager.addProduct', 'Ajouter un produit')}
          </h3>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.name', 'Nom')} <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200' 
              value={form.name} 
              onChange={handleInputChange}
              name="name"
              placeholder={t('myProductsManager.namePlaceholder', 'Entrez le nom du produit')}
            />
          </div>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.category', 'Catégorie')} <span className="text-red-500">*</span>
            </label>
            {!creatingCategory && (
              <div className='flex gap-2'>
                <div className="relative flex-1">
                  <select 
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none' 
                    value={form.category} 
                    onChange={handleInputChange}
                    name="category"
                  >
                    <option value=''>{t('myProductsManager.selectCategory', '-- Sélectionner --')}</option>
                    {categories && categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <button type='button' onClick={()=>{setCreatingCategory(true);}} className='px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors'>{t('myProductsManager.newCategory', 'Nouvelle')}</button>
              </div>
            )}
            {creatingCategory && (
              <div className='space-y-3 p-4 border rounded-xl bg-slate-50'>
                <div className='grid grid-cols-1 gap-3'>
                  <div>
                    <input 
                      className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200' 
                      placeholder={t('myProductsManager.newCategoryPlaceholder', 'Nom catégorie (ex: Électroménager)')} 
                      value={form.newCategoryName} 
                      onChange={handleInputChange}
                      name="newCategoryName"
                    />
                    {matchedExistingCategory && (
                      <p className='mt-1 text-xs text-emerald-600'>{t('myProductsManager.existingCategoryDetected', 'Catégorie existante détectée:')} <span className='font-medium'>{matchedExistingCategory.name}</span>. {t('myProductsManager.existingCategoryWillBeUsed', 'Elle sera réutilisée (pas de doublon créé).')}</p>
                    )}
                  </div>
                  {!matchedExistingCategory && (
                  <div>
                    <label className='block text-xs font-medium text-slate-600 mb-1'>{t('myProductsManager.categoryImage', 'Image (Cloudinary)')}</label>
                    <input 
                      type='file' 
                      accept='image/*'
                      onChange={e=>{
                        if(e.target.files && e.target.files[0]){
                          setNewCategoryImage(e.target.files[0]);
                          const r = new FileReader();
                          r.onloadend = ()=> setNewCategoryPreview(r.result);
                          r.readAsDataURL(e.target.files[0]);
                        } else { setNewCategoryImage(null); setNewCategoryPreview(null);} 
                      }}
                      className='w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-200 rounded-xl p-2 bg-white'
                    />
                    {newCategoryPreview && (
                      <div className='mt-2 flex items-center gap-3'>
                        <img src={newCategoryPreview} className='h-14 w-14 object-cover rounded-lg border border-slate-200 shadow-sm' alt='Cat preview' />
                        <button type='button' onClick={()=>{setNewCategoryImage(null); setNewCategoryPreview(null);}} className='text-xs text-red-600 hover:underline'>{t('myProductsManager.remove', 'Retirer')}</button>
                      </div>
                    )}
                  </div>
                  )}
                  <div className='flex flex-wrap gap-2'>
                    <button type='button' disabled={!form.newCategoryName} onClick={createCategory} className='px-4 py-2 rounded-lg bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1'>
                      <span>{matchedExistingCategory ? t('myProductsManager.use', 'Utiliser') : t('myProductsManager.create', 'Créer')}</span>
                    </button>
                    <button type='button' onClick={()=>{setCreatingCategory(false); setForm(f=>({...f,newCategoryName:''})); setNewCategoryImage(null); setNewCategoryPreview(null); setCatError(null);}} className='px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 transition-colors'>{t('myProductsManager.cancel', 'Annuler')}</button>
                  </div>
                  {catError && <p className='text-xs text-red-600'>{t('myProductsManager.categoryError', catError)}</p>}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.description', 'Description')} <span className="text-red-500">*</span>
            </label>
            <textarea 
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none' 
              rows={3} 
              value={form.description} 
              onChange={handleInputChange}
              name="description"
              placeholder={t('myProductsManager.descriptionPlaceholder', 'Entrez la description du produit')}
            />
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t('myProductsManager.price', 'Prix (DT)')} <span className="text-red-500">*</span>
              </label>
              <input 
                type='number' 
                min='0' 
                step='0.01' 
                required 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200' 
                value={form.price} 
                onChange={handleInputChange}
                name="price"
                placeholder={t('myProductsManager.pricePlaceholder', '0.00')}
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                {t('myProductsManager.discountPrice', 'Prix réduit (DT)')}
              </label>
              <input 
                type='number' 
                min='0' 
                step='0.01' 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200' 
                value={form.discount_price} 
                onChange={handleInputChange}
                name="discount_price"
                placeholder={t('myProductsManager.discountPricePlaceholder', '0.00')}
              />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.stock', 'Stock')} <span className="text-red-500">*</span>
            </label>
            <input 
              type='number' 
              min='0' 
              required 
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200' 
              value={form.stock} 
              onChange={handleInputChange}
              name="stock"
              placeholder={t('myProductsManager.stockPlaceholder', 'Quantité en stock')}
            />
          </div>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.productImage', 'Image du produit')}
            </label>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt={t('myProductsManager.imagePreviewAlt', 'Preview')}
                  className="h-32 w-32 object-cover rounded-xl shadow-md border border-slate-200"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              {t('myProductsManager.status', 'Statut')}
            </label>
            <div className="relative">
              <select 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none' 
                value={form.status} 
                onChange={handleInputChange}
                name="status"
              >
                <option value='available'>{t('myProductsManager.available', 'Disponible')}</option>
                <option value='unavailable'>{t('myProductsManager.unavailable', 'Indisponible')}</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-slate-50 rounded-xl">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={form.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <label htmlFor="featured" className="ml-3 text-sm font-medium text-slate-700">
              {t('myProductsManager.featured', 'Produit en vedette')}
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button 
              disabled={creating} 
              className='px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingId ? t('myProductsManager.updating', 'Mise à jour...') : t('myProductsManager.creating', 'Création...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingId ? t('myProductsManager.update', 'Mettre à jour') : t('myProductsManager.addProductBtn', 'Ajouter le produit')}
                </>
              )}
            </button>
            {editingId && (
              <button type='button' onClick={()=>{setEditingId(null); setForm({ name:'', description:'', price:'', discount_price:'', stock:'', status:'available', image:null, category:'', featured:false, newCategoryName:'' }); setPreviewImage(null);}} className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 border border-slate-200'>{t('myProductsManager.cancelEdit', 'Annuler édition')}</button>
            )}
          </div>
        </form>
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-slate-800'>{t('myProductsManager.list', 'Liste')}</h3>
          {loading && <p>{t('myProductsManager.loading', 'Chargement...')}</p>}
          {!loading && !items.length && <p className='text-sm text-slate-500'>{t('myProductsManager.noProducts', 'Aucun produit.')}</p>}
          <div className='space-y-3 max-h-[600px] overflow-y-auto pr-2'>
            {items.map(p=> (
              <div key={p.id} className={`p-4 rounded-xl border ${editingId===p.id ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200'} bg-white shadow-sm flex gap-4`}>
                <div className='w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center'>
                  {p.image ? <img src={p.image} alt={p.name} className='object-cover w-full h-full'/> : <span className='text-xs text-slate-400'>{t('myProductsManager.noImg', 'No Img')}</span>}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-slate-800 truncate'>{p.name}</p>
                  <p className='text-xs text-slate-500'>{p.category_name || t('myProductsManager.noCategory', 'Sans catégorie')}</p>
                  <p className='text-sm text-emerald-600 font-semibold'>{p.price} DT</p>
                  {p.discount_price && (
                    <p className='text-xs text-slate-500 line-through'>{p.discount_price} DT</p>
                  )}
                </div>
                <div className='text-xs text-slate-500 flex flex-col items-end gap-2'>
                  <div className='flex items-center gap-1'>
                    <span className={`px-2 py-1 rounded-full ${p.status==='available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{p.status}</span>
                    {p.featured && <span className='px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px]'>★</span>}
                  </div>
                  <span className='text-[10px]'>{t('myProductsManager.stockLabel', 'Stock')}: {p.stock}</span>
                  <div className='flex gap-2'>
                    <button onClick={()=>startEdit(p)} className='px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200'>{t('myProductsManager.edit', 'Éditer')}</button>
                    <button onClick={()=>remove(p.id)} className='px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200'>{t('myProductsManager.delete', 'Suppr')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  {error && <p className='text-sm text-red-600'>{t('myProductsManager.error', error)}</p>}
    </div>
  );
}
