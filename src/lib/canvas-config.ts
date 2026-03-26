import type { CanvasSize, ElementAnimationType } from '../types';

export const STAGE_WIDTH = 600;
export const STAGE_HEIGHT = 800;
export const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
};

export const CANVAS_SIZE_PRESETS = {
  square: { label: 'Square', width: 600, height: 600 },
  portrait: { label: 'Portrait', width: 600, height: 900 },
  landscape: { label: 'Landscape', width: 900, height: 600 },
  a4: { label: 'A4', width: 794, height: 1123 },
  custom: { label: 'Custom', width: STAGE_WIDTH, height: STAGE_HEIGHT },
} as const;

export const DEFAULT_ELEMENT_ANIMATION_DURATIONS: Record<ElementAnimationType, number> = {
  none: 0,
  pulse: 1.2,
  bounce: 0.9,
  shake: 0.5,
  fadeLoop: 1.5,
  spin: 2,
};

export const EDITOR_FONTS = [
  'Inter',
  'Playfair Display',
  'Dancing Script',
  'Montserrat',
  'Lora',
  'Pacifico',
  'Cormorant Garamond',
] as const;

export const BUTTON_SIZE_PRESETS = {
  small: { width: 120, height: 42, paddingX: 14, paddingY: 8 },
  medium: { width: 156, height: 50, paddingX: 18, paddingY: 10 },
  large: { width: 192, height: 58, paddingX: 24, paddingY: 12 },
} as const;
