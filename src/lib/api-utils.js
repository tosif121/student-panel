import axios from 'axios';

const api = axios.create({
  baseURL: 'https://esamwad.iotcom.io',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic function to handle API calls with error handling
const handleApiRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url,
      data,
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data.message || `API error with status ${error.response.status}`;
      throw new Error(errorMessage);
    } else {
      throw new Error('An unexpected error occurred. Please check your network connection.');
    }
  }
};

export const get = (url, token) => handleApiRequest('get', url, null, token);
export const post = (url, data, token) => handleApiRequest('post', url, data, token);
export const remove = (url, token) => handleApiRequest('delete', url, null, token);

