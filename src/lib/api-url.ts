const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export const toApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with '/': received '${path}'`);
  }

  return normalizedBaseUrl ? `${normalizedBaseUrl}${path}` : path;
};
