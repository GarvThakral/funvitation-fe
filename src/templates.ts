import { parseTemplateHtml } from './templates/htmlParser';
import type { CanvasElement, CanvasSize, Invitation } from './types';

import valentineHtml from './templates/html/valentine.html?raw';
import birthdayPartyHtml from './templates/html/birthday-party.html?raw';
import holiFestHtml from './templates/html/holi-fest.html?raw';
import birthdayHtml from './templates/html/birthday.html?raw';

export interface Template {
  id: string;
  name: string;
  accessTier?: 'core' | 'premium';
  backgroundColor: string;
  successMessage?: string;
  rejectionMessage?: string;
  animationType?: 'confetti' | 'holi' | 'none';
  entranceAnimation?: NonNullable<Invitation['entranceAnimation']>;
  musicUrl?: string;
  canvasSize?: CanvasSize;
  elements: CanvasElement[];
}

export const TEMPLATES: Template[] = [
  { ...parseTemplateHtml(valentineHtml), accessTier: 'core' },
  { ...parseTemplateHtml(birthdayPartyHtml), accessTier: 'premium' },
  { ...parseTemplateHtml(holiFestHtml), accessTier: 'premium' },
  { ...parseTemplateHtml(birthdayHtml), accessTier: 'core' },
];
