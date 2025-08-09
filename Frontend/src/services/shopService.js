import api from './api';

const shopService = {
  getShops: async (params={}) => {
    const res = await api.get('/shops/', { params });
    // If paginated, DRF returns {count,next,previous,results:[]}
    if (res.data && Array.isArray(res.data.results)) {
      return res.data;
    }
    // Fallback to array for non-paginated legacy
    if (Array.isArray(res.data)) return { results: res.data, count: res.data.length, next: null, previous: null };
    return { results: [], count: 0, next: null, previous: null };
  },
  createShop: async (data) => {
    const res = await api.post('/shops/', data);
    return res.data;
  },
  updateShop: async (id, data) => {
    const res = await api.patch(`/shops/${id}/`, data);
    return res.data;
  },
  deleteShop: async (id) => {
    await api.delete(`/shops/${id}/`);
    return id;
  },
  getMyShops: async (userId) => {
    const res = await api.get('/shops/', { params: { owner: userId } });
    return Array.isArray(res.data) ? res.data : [];
  },
  getShop: async (id) => {
    const res = await api.get(`/shops/${id}/`);
    return res.data;
  },
  getShopProducts: async (id) => {
    // reuse products list filter by shop
    const res = await api.get('/products/', { params: { shop: id } });
    // backend returns {products, categories} or array? earlier list returns object with 'products'
    if(Array.isArray(res.data)) return res.data; // fallback if simple list
    return res.data.products || [];
  },
  getShopProductsPaginated: async (id, page=1, pageSize=12) => {
    const res = await api.get('/products/', { params: { shop: id, page, page_size: pageSize } });
    if(Array.isArray(res.data)) return { results: res.data, next: null, previous: null, count: res.data.length };
    // Expect DRF pagination structure or our custom object
    if(res.data.results) return res.data; // already paginated
    const products = res.data.products || [];
    return { results: products, next: null, previous: null, count: products.length };
  },
  getShopStats: async (id) => {
    const res = await api.get(`/shops/${id}/stats/`);
    return res.data;
  }
};

export default shopService;
