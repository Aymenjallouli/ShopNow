import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shopService from '../../services/shopService';

export const fetchShops = createAsyncThunk('shops/fetchShops', async (params, { rejectWithValue }) => {
  try { return await shopService.getShops(params); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to fetch shops'); }
});

export const fetchMoreShops = createAsyncThunk('shops/fetchMoreShops', async (url, { rejectWithValue }) => {
  try {
    // url is full next URL; backend base already set in api, so extract query params if same domain
    if(!url) return { results: [], next: null, previous: null, count: 0 };
    const u = new URL(url, window.location.origin);
    const page = u.searchParams.get('page');
    const res = await shopService.getShops({ page });
    return res;
  } catch(e){
    return rejectWithValue(e.response?.data || 'Failed to load more shops');
  }
});

export const createShop = createAsyncThunk('shops/createShop', async (data, { rejectWithValue }) => {
  try { return await shopService.createShop(data); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to create shop'); }
});

export const updateShop = createAsyncThunk('shops/updateShop', async ({ id, data }, { rejectWithValue }) => {
  try { return await shopService.updateShop(id, data); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to update shop'); }
});

export const deleteShop = createAsyncThunk('shops/deleteShop', async (id, { rejectWithValue }) => {
  try { return await shopService.deleteShop(id); } catch (e){ return rejectWithValue(e.response?.data || 'Failed to delete shop'); }
});

const slice = createSlice({
  name: 'shops',
  initialState: { list: [], creating: false, loading: false, error: null, myShop: null, updating: false, deleting: false, next: null, previous: null, count: 0 },
  reducers: {
  setMyShop: (state, action) => { state.myShop = action.payload; },
  resetShopsState: (state) => { state.myShop = null; state.list = []; state.error = null; state.creating=false; state.updating=false; state.deleting=false; }
  },
  extraReducers: (b) => {
    b.addCase(fetchShops.pending, s=>{s.loading=true; s.error=null;})
  .addCase(fetchShops.fulfilled,(s,a)=>{s.loading=false; const data=a.payload; s.list=data.results || []; s.next=data.next; s.previous=data.previous; s.count=data.count;})
     .addCase(fetchShops.rejected,(s,a)=>{s.loading=false; s.error=a.payload;})
    .addCase(createShop.pending, s=>{s.creating=true; s.error=null;})
     .addCase(createShop.fulfilled,(s,a)=>{s.creating=false; s.myShop=a.payload; s.list.push(a.payload);})
     .addCase(createShop.rejected,(s,a)=>{s.creating=false; s.error=a.payload;});
  b.addCase(fetchMoreShops.fulfilled,(s,a)=>{ const data=a.payload; s.list=[...s.list, ...(data.results||[])]; s.next=data.next; s.previous=data.previous; s.count=data.count; })
  .addCase(fetchMoreShops.rejected,(s,a)=>{ s.error=a.payload; });
  b.addCase(updateShop.pending, s=>{s.updating=true; s.error=null;})
   .addCase(updateShop.fulfilled,(s,a)=>{s.updating=false; s.myShop=a.payload; const idx=s.list.findIndex(sh=>sh.id===a.payload.id); if(idx!==-1) s.list[idx]=a.payload;})
   .addCase(updateShop.rejected,(s,a)=>{s.updating=false; s.error=a.payload;})
   .addCase(deleteShop.pending, s=>{s.deleting=true; s.error=null;})
   .addCase(deleteShop.fulfilled,(s,a)=>{s.deleting=false; s.list=s.list.filter(sh=>sh.id!==a.payload); if(s.myShop && s.myShop.id===a.payload) s.myShop=null;})
   .addCase(deleteShop.rejected,(s,a)=>{s.deleting=false; s.error=a.payload;});
  }
});

export const { setMyShop, resetShopsState } = slice.actions;
export default slice.reducer;
