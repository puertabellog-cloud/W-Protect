import { apiClient } from '../api/apiClient';

const createAlert = async (alertData) => {
  try {
    const response = await apiClient.post('/w/alerts', alertData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const closeAlert = async (alertId) => {
  try {
    const response = await apiClient.put(`/w/alerts/${alertId}/close`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const trackLocation = async (alertId, locationData) => {
  try {
    const response = await apiClient.post(`/w/alerts/${alertId}/locations`, locationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  createAlert,
  closeAlert,
  trackLocation,
};