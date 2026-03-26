import { BUTTON_SIZE_PRESETS } from './canvas-config';
import {
  DEFAULT_BUTTON_RADIUS,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_TEXT_COLOR,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_TEXT_FONT,
} from './invitation';
import type { ButtonSize, CanvasElement, FontWeight, TextAlign } from '../types';

const textMeasureCanvas =
  typeof document !== 'undefined' ? document.createElement('canvas') : null;
const textMeasureContext = textMeasureCanvas?.getContext('2d') ?? null;

const normalizeTextContent = (value: string | undefined) => {
  const normalized = (value || '').replace(/\s+/g, ' ').trim();
  return normalized || ' ';
};

export const inferButtonSizePreset = (element: CanvasElement): ButtonSize => {
  if (element.buttonSize) {
    return element.buttonSize;
  }

  const width = element.width ?? BUTTON_SIZE_PRESETS.medium.width;
  if (width <= BUTTON_SIZE_PRESETS.small.width + 8) return 'small';
  if (width >= BUTTON_SIZE_PRESETS.large.width - 8) return 'large';
  return 'medium';
};

export const getElementTextPadding = (element: CanvasElement) => {
  if (element.type !== 'button') {
    return { paddingX: 0, paddingY: 0 };
  }

  const presetKey = inferButtonSizePreset(element);
  const preset =
    presetKey === 'custom' ? BUTTON_SIZE_PRESETS.medium : BUTTON_SIZE_PRESETS[presetKey];

  return {
    paddingX: element.paddingX ?? preset.paddingX,
    paddingY: element.paddingY ?? preset.paddingY,
  };
};

export interface ElementTextLayout {
  text: string;
  fontFamily: string;
  fontStyle: FontWeight;
  fontSize: number;
  fill: string;
  textAlign: TextAlign;
  lineHeight: number;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

export const getElementTextLayout = (element: CanvasElement): ElementTextLayout => {
  const text = normalizeTextContent(element.text);
  const { paddingX, paddingY } = getElementTextPadding(element);
  const fontFamily = element.fontFamily || DEFAULT_TEXT_FONT;
  const fontStyle = element.fontWeight || DEFAULT_FONT_WEIGHT;
  const textAlign =
    element.type === 'button' ? 'center' : element.textAlign || DEFAULT_TEXT_ALIGN;
  const lineHeight = element.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const width = Math.max(1, element.width ?? 220);
  const height = Math.max(1, element.height ?? 48);
  const fill =
    element.type === 'button'
      ? element.textColor || DEFAULT_BUTTON_TEXT_COLOR
      : element.fill || '#2f2c28';
  const borderRadius =
    element.type === 'button'
      ? Math.max(0, element.borderRadius ?? DEFAULT_BUTTON_RADIUS)
      : element.type === 'character'
        ? 50
        : 8;

  const availableWidth = Math.max(8, width - paddingX * 2);
  const availableHeight = Math.max(8, height - paddingY * 2);
  const baseFontSize = Math.max(8, element.fontSize ?? (element.type === 'button' ? 16 : 24));

  let fittedFontSize = baseFontSize;
  if (textMeasureContext) {
    while (fittedFontSize > 8) {
      textMeasureContext.font = `${fontStyle} ${fittedFontSize}px "${fontFamily}"`;
      const measuredWidth = textMeasureContext.measureText(text).width;
      const measuredHeight = fittedFontSize * lineHeight;

      if (measuredWidth <= availableWidth && measuredHeight <= availableHeight) {
        break;
      }

      fittedFontSize -= 1;
    }
  }

  return {
    text,
    fontFamily,
    fontStyle,
    fontSize: fittedFontSize,
    fill,
    textAlign,
    lineHeight,
    width,
    height,
    paddingX,
    paddingY,
    borderRadius,
  };
};

export const getButtonPresetValues = (size: ButtonSize) => {
  if (size === 'custom') {
    return BUTTON_SIZE_PRESETS.medium;
  }

  return BUTTON_SIZE_PRESETS[size || DEFAULT_BUTTON_SIZE];
};
