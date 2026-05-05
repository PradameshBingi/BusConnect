/**
 * API Configuration
 * Using relative paths to ensure standard Next.js routing.
 */

export const API_ENDPOINTS = {
  CREATE: '/api/create-ticket',
  VERIFY: '/api/verify-ticket', // Note: Append /<code> dynamically
  USE: '/api/use-ticket'        // Note: Append /<code> dynamically
};
