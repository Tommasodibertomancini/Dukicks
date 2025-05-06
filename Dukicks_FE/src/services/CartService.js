import api from './api';

const cartService = {
  getCart: () => api.get('cart'),

  addToCart: (productId, sizeId, quantity) =>
    api.post('cart/add', { productId, sizeId, quantity }),

  updateCartItem: (cartItemId, quantity) => {
    console.log('Inviando richiesta update:', { cartItemId, quantity });
    return api
      .put('cart/update', { cartItemId, quantity })
      .then((response) => {
        console.log('Risposta completa API:', response);
        return response.data || response;
      })
      .catch((error) => {
        console.error('Errore nella chiamata updateCartItem:', error);
        throw error;
      });
  },

  removeFromCart: (cartItemId) => api.delete(`cart/${cartItemId}`),

  clearCart: () => api.delete('cart/clear'),
};

export default cartService;
