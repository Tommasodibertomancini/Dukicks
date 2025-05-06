import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    return await api.get('products', params);
  },

  getFeaturedProducts: async (count = 8) => {
    return await api.get('products/featured', { count });
  },

  getAllProductsForAdmin: async () => {
    try {
      const response = await api.get('products', { limit: 1000, page: 1 });

      if (response) {
        if (response.items) return response.items;
        if (response.Items) return response.Items;

        if (Array.isArray(response)) return response;
      }

      console.warn('Formato risposta inatteso:', response);
      return [];
    } catch (error) {
      console.error('Errore nel recuperare i prodotti per admin:', error);
      return [];
    }
  },

  getProductById: async (id) => {
    return await api.get(`products/${id}`);
  },

  getBrands: async () => {
    return await api.get('products/brands');
  },

  createProduct: async (productData) => {
    try {
      console.log('ProductService creating product with data:', productData);
      return await api.post('products', productData);
    } catch (error) {
      console.error('ProductService error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productData) => {
    return await api.put(`products/${productData.id}`, productData);
  },

  deleteProduct: async (id) => {
    return await api.delete(`products/${id}`);
  },

  addProductFeature: async (productId, featureData) => {
    return await api.post(`products/${productId}/features`, featureData);
  },

  updateProductFeature: async (featureId, featureData) => {
    return await api.put(`products/features/${featureId}`, featureData);
  },

  deleteProductFeature: async (featureId) => {
    return await api.delete(`products/features/${featureId}`);
  },

  updateProductStock: async (productId) => {
    return await api.post(`products/${productId}/update-stock`);
  },
};

export default productService;
