// Central API Configuration
// Single source of truth for all API calls
export const BASE_URL = "https://5000-firebase-busconnect2-1772532304408.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev"; 

export const API_ENDPOINTS = {
  CREATE: `${BASE_URL}/create-ticket`,
  VERIFY: `${BASE_URL}/verify-ticket`, // Used as `${API_ENDPOINTS.VERIFY}/${code}`
  USE: `${BASE_URL}/use-ticket`,     // Used as `${API_ENDPOINTS.USE}/${code}`
};
