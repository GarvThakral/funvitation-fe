import type { CanvasElement, CanvasSize } from '../types';

const getFallbackDimensions = (element: CanvasElement) => {
  if (element.type === 'text') {
    return { width: 240, height: 48 };
  }

  if (element.type === 'button') {
    return { width: 140, height: 48 };
  }

  return { width: 100, height: 100 };
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const clampElementToCanvas = (element: CanvasElement, canvasSize: CanvasSize): CanvasElement => {
  const fallback = getFallbackDimensions(element);
  const width = Math.max(1, element.width ?? fallback.width);
  const height = Math.max(1, element.height ?? fallback.height);
  const maxX = Math.max(0, canvasSize.width - width);
  const maxY = Math.max(0, canvasSize.height - height);

  return {
    ...element,
    x: clamp(element.x, 0, maxX),
    y: clamp(element.y, 0, maxY),
    width,
    height,
  };
};

export const resizeElementsForCanvas = (
  elements: CanvasElement[],
  previousSize: CanvasSize,
  nextSize: CanvasSize
) => {
  const widthRatio = nextSize.width / previousSize.width;
  const heightRatio = nextSize.height / previousSize.height;
  const fontRatio = Math.min(widthRatio, heightRatio);

  return elements.map((element) => {
    const fallback = getFallbackDimensions(element);
    const width = Math.max(1, (element.width ?? fallback.width) * widthRatio);
    const height = Math.max(1, (element.height ?? fallback.height) * heightRatio);

    const resized: CanvasElement = {
      ...element,
      x: element.x * widthRatio,
      y: element.y * heightRatio,
      width,
      height,
    };

    if (element.fontSize !== undefined) {
      resized.fontSize = Math.max(8, element.fontSize * fontRatio);
    }

    if (element.paddingX !== undefined) {
      resized.paddingX = Math.max(0, element.paddingX * widthRatio);
    }

    if (element.paddingY !== undefined) {
      resized.paddingY = Math.max(0, element.paddingY * heightRatio);
    }

    if (element.type === 'button') {
      resized.buttonSize = 'custom';
    }

    return clampElementToCanvas(resized, nextSize);
  });
};
