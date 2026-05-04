/**
 * Centralized API Configuration
 * Ensure BASE_URL matches your Google Cloud Workstation subdomain for port 5000.
 */

export const BASE_URL = "https://5000-firebase-busconnect2-1772532304408.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev";

export const API_ENDPOINTS = {
  CREATE: `${BASE_URL}/api/create-ticket`,
  VERIFY: `${BASE_URL}/api/verify-ticket`,
  USE: `${BASE_URL}/api/use-ticket`
};
