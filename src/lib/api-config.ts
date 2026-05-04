// Central API Configuration
export const BASE_URL = "https://busconnect-server-q8f6.onrender.com"; // Use the actual production backend URL

export const API_ENDPOINTS = {
  CREATE: `${BASE_URL}/create-ticket`,
  VERIFY: (code: string) => `${BASE_URL}/verify-ticket/${code}`,
  USE: (code: string) => `${BASE_URL}/use-ticket/${code}`,
};
