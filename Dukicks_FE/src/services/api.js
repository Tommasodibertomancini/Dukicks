const API_URL = 'https://localhost:7025/api';

const api = {
  async get(endpoint, params = {}) {
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.substring(1)
      : endpoint;

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    const url = `${API_URL}/${cleanEndpoint}${queryString}`;

    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set with token');
    } else {
      console.warn('No token available for request');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'same-origin',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Response error:', response.status, response.statusText);
      if (response.status === 401) {
        console.warn('Unauthorized access, clearing token');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  async post(endpoint, data = {}) {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const error = await response.json().catch(() => ({
        message: 'Si è verificato un errore',
      }));

      throw new Error(error.message || 'Si è verificato un errore');
    }

    return await response.json();
  },

  async put(endpoint, data = {}) {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const error = await response.json().catch(() => ({
        message: 'Si è verificato un errore',
      }));

      throw new Error(error.message || 'Si è verificato un errore');
    }

    return await response.json();
  },

  async delete(endpoint, data = null) {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method: 'DELETE',
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const error = await response.json().catch(() => ({
        message: 'Si è verificato un errore',
      }));

      throw new Error(error.message || 'Si è verificato un errore');
    }

    if (response.status === 204) {
      return true;
    }

    return await response.json();
  },
};

export default api;
