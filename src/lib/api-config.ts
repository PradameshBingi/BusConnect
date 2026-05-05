/**
 * Centralized API Configuration
 * Using relative paths to Next.js API routes to eliminate CORS and network issues.
 */

export const API_ENDPOINTS = {
  CREATE: "/api/create-ticket",
  VERIFY: "/api/verify-ticket", // Use as `${API_ENDPOINTS.VERIFY}/${code}`
  USE: "/api/use-ticket"        // Use as `${API_ENDPOINTS.USE}/${code}`
};
