import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

export const fetchMyProducts = createAsyncThunk('myProducts/fetch', async (shopId, { rejectWithValue }) => {
  try { return await productService.getMyProducts(shopId); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to load products'); }
});

export const createMyProduct = createAsyncThunk('myProducts/create', async (data, { rejectWithValue }) => {
  try { return await productService.createProduct(data); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to create product'); }
});

export const updateMyProduct = createAsyncThunk('myProducts/update', async ({id, data}, { rejectWithValue }) => {
  try { return await productService.updateProduct(id, data); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to update product'); }
});

export const deleteMyProduct = createAsyncThunk('myProducts/delete', async (id, { rejectWithValue }) => {
  try { await productService.deleteProduct(id); return id; } catch (e){ return rejectWithValue(e.response?.data || 'Failed to delete product'); }
});

const slice = createSlice({
  name: 'myProducts',
  initialState: { items: [], loading: false, creating: false, error: null, updating:false, deleting:false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyProducts.pending, s=>{s.loading=true; s.error=null;})
     .addCase(fetchMyProducts.fulfilled,(s,a)=>{s.loading=false; s.items=a.payload;})
     .addCase(fetchMyProducts.rejected,(s,a)=>{s.loading=false; s.error=a.payload;})
     .addCase(createMyProduct.pending, s=>{s.creating=true; s.error=null;})
     .addCase(createMyProduct.fulfilled,(s,a)=>{s.creating=false; s.items.push(a.payload);})
     .addCase(createMyProduct.rejected,(s,a)=>{s.creating=false; s.error=a.payload;});
  b.addCase(updateMyProduct.pending, s=>{s.updating=true; s.error=null;})
   .addCase(updateMyProduct.fulfilled,(s,a)=>{s.updating=false; const idx=s.items.findIndex(i=>i.id===a.payload.id); if(idx>-1) s.items[idx]=a.payload;})
   .addCase(updateMyProduct.rejected,(s,a)=>{s.updating=false; s.error=a.payload;});
  b.addCase(deleteMyProduct.pending, s=>{s.deleting=true; s.error=null;})
   .addCase(deleteMyProduct.fulfilled,(s,a)=>{s.deleting=false; s.items = s.items.filter(i=>i.id!==a.payload);})
   .addCase(deleteMyProduct.rejected,(s,a)=>{s.deleting=false; s.error=a.payload;});
  }
});

export default slice.reducer;
