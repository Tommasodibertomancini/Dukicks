import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('account/login', credentials);
      console.log('Login response:', response);

      if (response && response.token) {
        localStorage.setItem('token', response.token);

        const savedToken = localStorage.getItem('token');
        console.log(
          'Token saved in localStorage:',
          savedToken ? 'YES' : 'NO',
          savedToken?.substring(0, 20) + '...'
        );

        return {
          token: response.token,
          user: {
            email: credentials.email,
          },
          expires: response.expires,
        };
      } else {
        throw new Error('Nessun token ricevuto dal server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('account/register', userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nessun token disponibile');
      }

      const response = await api.get('account/profile');

      if (!response || (!response.data && !response.firstName)) {
        console.error('Risposta getProfile incompleta:', response);
        throw new Error('Dati profilo incompleti');
      }

      const userData = response.data || response;

      return {
        data: userData,
        status: 'success',
      };
    } catch (error) {
      console.error('Errore nel recupero del profilo:', error);
      throw error;
    }
  },

  updateProfile: (profileData) => api.put('account/profile', profileData),

  changePassword: (passwordData) =>
    api.post('account/change-password', passwordData),

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);

      if (expirationDate < new Date()) {
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token invalid', error);
      localStorage.removeItem('token');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('account/users');
      return response;
    } catch (error) {
      console.error('Errore nel recupero degli utenti:', error);
      throw error;
    }
  },
};

export default authService;
