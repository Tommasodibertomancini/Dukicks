import api from './api';

const paymentService = {
  /**
   * @param {Object} paymentData - Dati del pagamento (orderId, paymentMethod, cardNumber, etc.)
   * @returns {Promise<Object>} Risultato del pagamento
   */
  processPayment: async (paymentData) => {
    try {
      console.log('Processing payment with data:', {
        ...paymentData,
        cardNumber: paymentData.cardNumber
          ? '************' + paymentData.cardNumber.slice(-4)
          : null,
        cvv: paymentData.cvv ? '***' : null,
      });

      const response = await api.post('payments/process', paymentData);
      console.log('Payment processing response:', response);
      return response;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  },

  /**
   * Payment Intent per Stripe
   * @param {Object} intentData - Dati per il Payment Intent
   * @returns {Promise<Object>} 
   */
  createPaymentIntent: async (intentData) => {
    try {
      console.log('Creating payment intent:', intentData);
      const response = await api.post('payments/create-intent', intentData);
      console.log('Payment intent response:', response);
      return response;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  },

  /**
   * Sessione di checkout con Stripe
   * @param {Object} sessionData - Dati della sessione 
   * @returns {Promise<Object>} Dati della sessione creata, incluso sessionId
   */
  createCheckoutSession: async (sessionData) => {
    try {
      console.log('Creating checkout session:', sessionData);
      const response = await api.post('payments/create-session', sessionData);
      console.log('Checkout session response:', response);
      return response;
    } catch (error) {
      console.error('Checkout session creation error:', error);
      throw error;
    }
  },

  /**
   * Aggiorna lo stato di pagamento di un ordine
   * @param {Object} paymentData - Dati del pagamento (orderId, status, transactionId)
   * @returns {Promise<Object>} Ordine aggiornato
   */
  updateOrderPaymentStatus: async (paymentData) => {
    try {
      console.log('Updating order payment status:', paymentData);
      const response = await api.put(`orders/${paymentData.orderId}/payment`, {
        status: paymentData.status,
        transactionId: paymentData.transactionId,
      });
      console.log('Order payment status update response:', response);
      return response;
    } catch (error) {
      console.error('Order payment status update error:', error);
      throw error;
    }
  },

  /**
   * Verifica lo stato di un pagamento
   * @param {string} transactionId - ID della transazione
   * @returns {Promise<Object>} Stato del pagamento
   */
  verifyPayment: async (transactionId) => {
    try {
      console.log('Verifying payment:', transactionId);
      const response = await api.get(`payments/verify/${transactionId}`);
      console.log('Payment verification response:', response);
      return response;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  /**
   * Simulazione  pagamento 
   * @param {Object} paymentData - Dati del pagamento
   * @returns {Promise<Object>} Risultato simulato
   */
  simulatePayment: async (paymentData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = 'tr_' + Math.random().toString(36).substr(2, 9);

    const success = Math.random() > 0.15;

    const response = {
      success: success,
      transactionId: success ? transactionId : null,
      message: success
        ? 'Pagamento completato con successo'
        : 'Pagamento rifiutato. Controlla i dati della carta.',
      amount: paymentData.amount || 0,
    };

    console.log('Simulated payment response:', response);

    if (!success) {
      throw new Error(response.message);
    }

    return response;
  },
};

export default paymentService;
