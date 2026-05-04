// Central API Configuration
// Ensure this matches your actual deployed backend URL
export const BASE_URL = "https://busconnect-server-q8f6.onrender.com"; 

export const API_ENDPOINTS = {
  CREATE: `${BASE_URL}/create-ticket`,
  VERIFY: (code: string) => `${BASE_URL}/verify-ticket/${code}`,
  USE: (code: string) => `${BASE_URL}/use-ticket/${code}`,
};
