export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.API_BASE_URL)) ||
  (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ||
  (typeof window !== 'undefined' && (window.API_BASE_URL || window.location.origin));
