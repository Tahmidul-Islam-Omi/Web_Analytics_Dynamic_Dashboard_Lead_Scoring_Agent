// API Configuration
// Local development URL (uncomment for local development)
// export const API_BASE_URL = 'http://127.0.0.1:8000';

// Production URL (Render deployment)
export const API_BASE_URL = 'https://web-analytics-agent.onrender.com';

export const API_ENDPOINTS = {
  TRACK: '/api/track',
  WEBSITES: '/api/websites',
};

// Tracking Script Configuration
export const TRACKING_SCRIPT_URL = `${API_BASE_URL}/track.js`;

// UI Configuration
export const FORM_VALIDATION = {
  URL_REQUIRED: 'Website URL is required',
  URL_INVALID: 'Please enter a valid URL (e.g., https://example.com)',
  SITE_NAME_REQUIRED: 'Site name is required',
  SITE_NAME_MIN_LENGTH: 'Site name must be at least 2 characters',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WEBSITE_ADDED: 'Website added successfully! You can now start tracking analytics.',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Failed to add website. Please check your connection and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};