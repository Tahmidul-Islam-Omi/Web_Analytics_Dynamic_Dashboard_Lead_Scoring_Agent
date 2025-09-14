// URL validation utilities

export const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

export const formatUrl = (url) => {
    if (!url) return '';
    
    // Add https:// if no protocol is specified
    if (!url.match(/^https?:\/\//)) {
        return `https://${url}`;
    }
    
    return url;
};

export const extractDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (_) {
        return '';
    }
};