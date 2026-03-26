import { estimateBytes } from './invitation';
import { toApiUrl } from './api-url';
import { getAuthHeaders } from './auth-request';

const MAX_IMAGE_DIMENSION = 1400;
const MAX_IMAGE_DATA_URL_BYTES = 8 * 1024 * 1024;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read image file.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image file.'));
    img.src = src;
  });

export const compressImageToDataUrl = async (file: File) => {
  const originalDataUrl = await fileToDataUrl(file);
  const originalImage = await loadImage(originalDataUrl);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(originalImage.width, originalImage.height));
  const width = Math.max(1, Math.round(originalImage.width * scale));
  const height = Math.max(1, Math.round(originalImage.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable in this browser.');

  ctx.drawImage(originalImage, 0, 0, width, height);

  let quality = 0.88;
  let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  while (estimateBytes(compressedDataUrl) > MAX_IMAGE_DATA_URL_BYTES && quality > 0.4) {
    quality -= 0.1;
    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (estimateBytes(compressedDataUrl) > MAX_IMAGE_DATA_URL_BYTES) {
    throw new Error('Image is too large after compression. Please choose a smaller image.');
  }

  return compressedDataUrl;
};

export const uploadImageViaBackend = async (file: File) => {
  const dataUrl = await compressImageToDataUrl(file);
  const response = await fetch(toApiUrl('/api/upload-image'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ dataUrl }),
  });

  const payload = await response.json().catch(() => ({} as { error?: string; secureUrl?: string }));
  if (!response.ok) {
    throw new Error(payload.error || 'Image upload failed on server.');
  }
  if (!payload.secureUrl || typeof payload.secureUrl !== 'string') {
    throw new Error('Image upload succeeded but no URL was returned.');
  }

  return payload.secureUrl;
};
