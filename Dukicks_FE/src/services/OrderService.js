import api from './api';

const orderService = {
  getUserOrders: () => api.get('orders'),

  getAllOrders: (status = null) => {
    const url = status ? `orders/all?status=${status}` : 'orders/all';
    return api.get(url);
  },

  getOrderById: (id) => api.get(`orders/${id}`),

  createOrder: async (orderData) => {
    try {
      console.log('OrderService sending data:', orderData);
      const response = await api.post('orders', orderData);
      console.log('OrderService received raw response:', response);

      return response;
    } catch (error) {
      console.error('OrderService error:', error);
      throw error;
    }
  },
  updateOrderStatus: (orderId, status) =>
    api.put(`orders/${orderId}/status`, { status }),

  updatePaymentStatus: (orderId, status, transactionId = null) =>
    api.put(`orders/${orderId}/payment`, { status, transactionId }),

  cancelOrder: (orderId) => api.post(`orders/${orderId}/cancel`),

  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`payments/status/${transactionId}`);
      return response;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  },
};

export default orderService;
