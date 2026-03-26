import type { BillingOverview, InviteSummary, PlanId, PublicPlan } from '../types';
import { toApiUrl } from './api-url';
import { getAuthHeaders } from './auth-request';

const readJson = async <T>(response: Response) => response.json().catch(() => ({} as T));

export const fetchPublicPlans = async () => {
  const response = await fetch(toApiUrl('/api/billing/plans'));
  const payload = await readJson<{ plans?: PublicPlan[]; error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load pricing plans.');
  }

  return payload.plans || [];
};

export const fetchBillingOverview = async () => {
  const response = await fetch(toApiUrl('/api/billing/me'), {
    headers: await getAuthHeaders(),
  });
  const payload = await readJson<BillingOverview & { error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load billing status.');
  }

  return payload as BillingOverview;
};

export const startPlanCheckout = async (planId: PlanId) => {
  const response = await fetch(toApiUrl('/api/billing/checkout'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ planId }),
  });

  const payload = await readJson<{ checkoutUrl?: string; mode?: 'checkout' | 'changed'; message?: string; error?: string }>(
    response
  );

  if (!response.ok) {
    throw new Error(payload.error || 'Could not start checkout.');
  }

  return payload;
};

export const createCustomerPortalSession = async () => {
  const response = await fetch(toApiUrl('/api/billing/portal'), {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  const payload = await readJson<{ portalUrl?: string; error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.error || 'Could not open the billing portal.');
  }

  if (!payload.portalUrl) {
    throw new Error('Billing portal link was not returned.');
  }

  return payload.portalUrl;
};

export const fetchMyInvitations = async () => {
  const response = await fetch(toApiUrl('/api/invitations/mine'), {
    headers: await getAuthHeaders(),
  });
  const payload = await readJson<{ invitations?: InviteSummary[]; error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load your invitations.');
  }

  return payload.invitations || [];
};

export const archiveInvitation = async (id: string) => {
  const response = await fetch(toApiUrl(`/api/invitations/${encodeURIComponent(id)}/archive`), {
    method: 'PATCH',
    headers: await getAuthHeaders(),
  });
  const payload = await readJson<{ archived?: boolean; error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload.error || 'Could not archive invitation.');
  }

  return Boolean(payload.archived);
};
