import type { CanvasElement, CanvasSize, Invitation } from '../types';

export interface ParsedTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  successMessage?: string;
  rejectionMessage?: string;
  animationType?: 'confetti' | 'holi' | 'none';
  entranceAnimation?: NonNullable<Invitation['entranceAnimation']>;
  musicUrl?: string;
  canvasSize?: CanvasSize;
  elements: CanvasElement[];
}

const parsePixel = (value: string | null | undefined, fallback = 0) => {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value.replace('px', '').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readOptionalNumber = (value: string | null | undefined) => {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseTemplateHtml = (html: string): ParsedTemplate => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const root = document.querySelector<HTMLElement>('[data-template-root="true"]');

  if (!root) {
    throw new Error('Template HTML is missing [data-template-root="true"].');
  }

  const id = root.dataset.templateId;
  const name = root.dataset.templateName;
  const backgroundColor = root.dataset.backgroundColor;
  const canvasWidth = readOptionalNumber(root.dataset.canvasWidth);
  const canvasHeight = readOptionalNumber(root.dataset.canvasHeight);

  if (!id || !name || !backgroundColor) {
    throw new Error('Template root must include data-template-id, data-template-name, and data-background-color.');
  }

  const elements: CanvasElement[] = [];
  const nodes = root.querySelectorAll<HTMLElement>('[data-element-id]');

  nodes.forEach((node) => {
    const type = node.dataset.type as CanvasElement['type'] | undefined;
    const elementId = node.dataset.elementId;

    if (!type || !elementId) return;

    const { style } = node;
    const width = parsePixel(style.width, 0);
    const height = parsePixel(style.height, 0);

    const element: CanvasElement = {
      id: elementId,
      type,
      x: parsePixel(style.left, 0),
      y: parsePixel(style.top, 0),
      width: width || undefined,
      height: height || undefined,
      fill: node.dataset.fill || undefined,
      rotation: readOptionalNumber(node.dataset.rotation) || 0,
    };

    if (type === 'text') {
      element.text = (node.textContent || '').trim();
      element.fontSize = readOptionalNumber(node.dataset.fontSize) || 24;
      element.fontFamily = node.dataset.fontFamily || 'Inter';
      element.fontWeight = (node.dataset.fontWeight as CanvasElement['fontWeight']) || 'normal';
      element.textAlign = (node.dataset.textAlign as CanvasElement['textAlign']) || 'left';
      element.lineHeight = readOptionalNumber(node.dataset.lineHeight) || 1.2;
    }

    if (type === 'button') {
      element.text = node.dataset.text || (node.textContent || '').trim();
      element.fontSize = readOptionalNumber(node.dataset.fontSize) || 16;
      element.fontFamily = node.dataset.fontFamily || 'Inter';
      element.fontWeight = (node.dataset.fontWeight as CanvasElement['fontWeight']) || 'normal';
      element.textColor = node.dataset.textColor || '#ffffff';
      element.borderRadius = readOptionalNumber(node.dataset.borderRadius) || 18;
      element.buttonSize = (node.dataset.buttonSize as CanvasElement['buttonSize']) || 'medium';
      element.paddingX = readOptionalNumber(node.dataset.paddingX) || undefined;
      element.paddingY = readOptionalNumber(node.dataset.paddingY) || undefined;
      element.buttonType = node.dataset.buttonType as CanvasElement['buttonType'];
    }

    if (type === 'character') {
      element.characterPart = node.dataset.characterPart || 'heart';
    }

    if (type === 'image') {
      element.src = node.dataset.src;
    }

    elements.push(element);
  });

  return {
    id,
    name,
    backgroundColor,
    successMessage: root.dataset.successMessage,
    rejectionMessage: root.dataset.rejectionMessage,
    animationType: root.dataset.animationType as ParsedTemplate['animationType'],
    entranceAnimation: root.dataset.entranceAnimation as ParsedTemplate['entranceAnimation'],
    musicUrl: root.dataset.musicUrl,
    canvasSize:
      canvasWidth && canvasHeight
        ? {
            width: canvasWidth,
            height: canvasHeight,
          }
        : undefined,
    elements,
  };
};
