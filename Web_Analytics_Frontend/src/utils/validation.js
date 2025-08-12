/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Formats a URL to ensure it has a protocol
 * @param {string} url - The URL to format
 * @returns {string} - Formatted URL with protocol
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  // Remove whitespace
  url = url.trim();
  
  // Add https:// if no protocol is present
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  
  return url;
};

/**
 * Extracts domain name from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - Domain name or empty string if invalid
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};