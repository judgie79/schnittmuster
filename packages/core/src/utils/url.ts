import { apiClient } from '../services/api';

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const resolveAssetUrl = (input?: string | null): string | undefined => {
  if (!input) {
    return undefined;
  }
  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input;
  }
  
  const baseURL = apiClient.defaults.baseURL || '';
  // Remove /api/v1 suffix if present to get the root URL for static files if they are served from root
  // But usually files are served from the same domain.
  // If input starts with /, it's relative to root.
  // If API_BASE_URL includes /api/v1, we might need to adjust.
  
  // Assuming the backend serves static files relative to the base URL or root.
  // If input is like "/uploads/...", and API is "http://.../api/v1", 
  // we probably want "http://.../uploads/...".
  
  try {
    const url = new URL(baseURL);
    return new URL(input, url.origin).toString();
  } catch {
    return input;
  }
};
