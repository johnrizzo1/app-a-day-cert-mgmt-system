import axios from 'axios';

// Replace with your actual API URL
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Certificate API endpoints
export const certificateApi = {
  // Get all certificates
  getAll: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const response = await api.get(`/certificates?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get a single certificate by ID
  getById: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },

  // Create a new certificate
  create: async (certificateData) => {
    const response = await api.post('/certificates', certificateData);
    return response.data;
  },

  // Update a certificate
  update: async (id, certificateData) => {
    const response = await api.put(`/certificates/${id}`, certificateData);
    return response.data;
  },

  // Delete a certificate
  delete: async (id) => {
    await api.delete(`/certificates/${id}`);
    return true;
  },

  // Generate a certificate
  generate: async (id) => {
    const response = await api.post(`/certificates/${id}/generate`);
    return response.data;
  },

  // Get certificate with private key
  getWithPrivateKey: async (id) => {
    const response = await api.get(`/certificates/${id}/private-key`);
    return response.data;
  },
};

export default api;