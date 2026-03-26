import type { Invitation } from '../types';
import { toApiUrl } from './api-url';
import { getAuthHeaders } from './auth-request';
import { sanitizeInvitationRecord } from './invitation';

export const createInvitation = async (invitation: Partial<Invitation>) => {
  const response = await fetch(toApiUrl('/api/invitations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ invitation }),
  });

  const payload = await response.json().catch(() => ({} as { error?: string; id?: string }));
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to save invitation.');
  }
  if (!payload.id) {
    throw new Error('Save succeeded but no invitation id was returned.');
  }

  return payload.id;
};

export const fetchInvitation = async (id: string) => {
  const response = await fetch(toApiUrl(`/api/invitations/${encodeURIComponent(id)}`));
  const payload = await response
    .json()
    .catch(() => ({} as { error?: string; invitation?: Invitation }));

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load invitation.');
  }
  if (!payload.invitation) {
    throw new Error('Invitation was not returned by the server.');
  }

  return sanitizeInvitationRecord(payload.invitation);
};
