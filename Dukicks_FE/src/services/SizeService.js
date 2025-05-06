import api from './api';

const sizeService = {
  getSizes: () => api.get('sizes'),

  getProductSizes: (productId) => api.get(`sizes/product/${productId}`),

  createSize: (sizeData) => api.post('sizes', sizeData),

  addProductSize: (productId, sizeData) =>
    api.post('sizes/product-size', { productId, ...sizeData }),

  updateProductSize: (productId, sizeId, stock) =>
    api.put('sizes/product-size', { productId, sizeId, stock }),

  deleteProductSize: (productId, sizeId) =>
    api.delete(`sizes/product-size/${productId}/${sizeId}`),
};

export default sizeService;
