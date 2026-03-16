import { parseTemplateHtml } from './templates/htmlParser';
import type { CanvasElement } from './types';

import valentineHtml from './templates/html/valentine.html?raw';
import birthdayPartyHtml from './templates/html/birthday-party.html?raw';
import holiFestHtml from './templates/html/holi-fest.html?raw';
import birthdayHtml from './templates/html/birthday.html?raw';

export interface Template {
  id: string;
  name: string;
  backgroundColor: string;
  successMessage?: string;
  animationType?: 'confetti' | 'holi' | 'none';
  musicUrl?: string;
  elements: CanvasElement[];
}

export const TEMPLATES: Template[] = [
  parseTemplateHtml(valentineHtml),
  parseTemplateHtml(birthdayPartyHtml),
  parseTemplateHtml(holiFestHtml),
  parseTemplateHtml(birthdayHtml),
];
