import api from './api';

const wishlistService = {
  getWishlist: () => api.get('wishlist'),

  addToWishlist: (productId) => api.post('wishlist/add', { productId }),

  removeFromWishlist: (wishlistItemId) =>
    api.delete(`wishlist/${wishlistItemId}`),

  clearWishlist: () => api.delete('wishlist/clear'),

  isInWishlist: (productId) => api.get(`wishlist/check/${productId}`),
};

export default wishlistService;
