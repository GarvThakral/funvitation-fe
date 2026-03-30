import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ExternalLink, Loader2, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createCustomerPortalSession,
  fetchBillingOverview,
  fetchMyInvitations,
  fetchPublicPlans,
  startPlanCheckout,
} from '../lib/billing-api';
import type { BillingOverview, InviteSummary, PlanId, PublicPlan } from '../types';
import { useAuth } from '../auth/AuthContext';
import AuthPanel from './landing/AuthPanel';

const feedback = [
  {
    quote: 'We made our wedding RSVP page in minutes and everyone loved it.',
    author: 'Riya, Event Organizer',
  },
  {
    quote: 'The playful animations made our launch invite stand out instantly.',
    author: 'Noah, Startup Founder',
  },
  {
    quote: 'Finally an invite builder that feels modern and actually fun to use.',
    author: 'Sam, Community Lead',
  },
];

const planSubtitles: Record<PlanId, string> = {
  starter: 'Great for trying the product',
  creator: 'For frequent invite creators',
  studio: 'For advanced branded invites',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
  const [myInvitations, setMyInvitations] = useState<InviteSummary[]>([]);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState<PlanId | 'portal' | null>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlans(await fetchPublicPlans());
      } catch (error) {
        console.error('Failed to load public plans:', error);
      }
    };

    void loadPlans();
  }, []);

  const refreshAccountState = useCallback(async () => {
    if (!user) {
      setBillingOverview(null);
      setMyInvitations([]);
      return;
    }

    setIsAccountLoading(true);
    try {
      const [nextBillingOverview, nextInvitations] = await Promise.all([
        fetchBillingOverview(),
        fetchMyInvitations(),
      ]);
      setBillingOverview(nextBillingOverview);
      setMyInvitations(nextInvitations);
      setBillingNotice(null);
    } catch (error) {
      console.error('Failed to load account workspace:', error);
      setBillingNotice(error instanceof Error ? error.message : 'Could not load account state.');
    } finally {
      setIsAccountLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshAccountState();
  }, [refreshAccountState]);

  const visiblePlans = useMemo<PublicPlan[]>(() => {
    if (plans.length > 0) {
      return plans;
    }

    return [
      {
        id: 'starter',
        label: 'Starter',
        priceLabel: '$0',
        marketingFeatures: ['1 active invite', 'Core templates', 'Basic sharing'],
        limits: { maxActiveInvites: 1 },
        capabilities: {
          templateAccess: 'core',
          allowCustomResponseMessages: false,
          allowMusic: false,
          allowPostLoadEffects: false,
          allowPremiumEntranceAnimations: false,
          allowCustomCanvasSize: false,
        },
        checkoutEnabled: false,
        isFree: true,
      },
      {
        id: 'creator',
        label: 'Creator',
        priceLabel: '$12/mo',
        marketingFeatures: ['Unlimited invites', 'Premium templates', 'Custom response messages'],
        limits: { maxActiveInvites: null },
        capabilities: {
          templateAccess: 'all',
          allowCustomResponseMessages: true,
          allowMusic: false,
          allowPostLoadEffects: false,
          allowPremiumEntranceAnimations: false,
          allowCustomCanvasSize: false,
        },
        checkoutEnabled: false,
        isFree: false,
      },
      {
        id: 'studio',
        label: 'Studio',
        priceLabel: '$29/mo',
        marketingFeatures: ['Unlimited invites', 'Music + premium effects', 'Custom canvas sizes'],
        limits: { maxActiveInvites: null },
        capabilities: {
          templateAccess: 'all',
          allowCustomResponseMessages: true,
          allowMusic: true,
          allowPostLoadEffects: true,
          allowPremiumEntranceAnimations: true,
          allowCustomCanvasSize: true,
        },
        checkoutEnabled: false,
        isFree: false,
      },
    ];
  }, [plans]);

  const handlePlanAction = async (planId: PlanId) => {
    if (planId === 'starter') {
      if (user) {
        navigate('/editor');
      } else {
        document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (!user) {
      setBillingNotice('Sign in first to start a paid plan.');
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setBillingBusy(planId);

    try {
      const result = await startPlanCheckout(planId);
      if (result.mode === 'changed') {
        setBillingNotice(result.message || 'Plan change requested.');
        setBillingOverview(await fetchBillingOverview());
        return;
      }

      if (!result.checkoutUrl) {
        throw new Error('Checkout session did not return a URL.');
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Pricing action failed:', error);
      setBillingNotice(error instanceof Error ? error.message : 'Could not start checkout.');
    } finally {
      setBillingBusy(null);
    }
  };

  const handleManageBilling = async () => {
    setBillingBusy('portal');

    try {
      const portalUrl = await createCustomerPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Customer portal open failed:', error);
      setBillingNotice(error instanceof Error ? error.message : 'Could not open billing portal.');
    } finally {
      setBillingBusy(null);
    }
  };

  const activeInvitations = myInvitations.filter((invitation) => invitation.status === 'active');
  const archivedInvitations = myInvitations.filter((invitation) => invitation.status === 'archived');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff6e6_0%,_#fef9d8_42%,_#f3ffd9_100%)] text-[var(--play-ink)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-bold tracking-tight">funvitation</p>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={() => void refreshAccountState()}
              disabled={loading || isAccountLoading}
              className="inline-flex items-center gap-2 rounded-full border border-[#b3e283] bg-white px-4 py-2 text-sm font-medium text-[#42622b] hover:bg-[#f7ffe9] disabled:opacity-60"
            >
              <RefreshCcw size={14} className={isAccountLoading ? 'animate-spin' : ''} />
              Check state
            </button>
          ) : (
            <a href="#auth" className="rounded-full border border-[#e99497]/50 bg-white px-4 py-2 text-sm font-medium hover:bg-[#fff0f0]">
              Sign in
            </a>
          )}
          {user && (
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="rounded-full bg-[#e99497] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d98287]"
            >
              Open editor
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="grid gap-8 py-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-[#e99497]/50 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#c86d75]">
              Invite Builder
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Design playful invites and share live links in minutes.
            </h1>
            <p className="mt-3 max-w-xl text-base text-[#5f5a50]">
              Create interactive invitation pages with animations, music, and one-tap sharing.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#auth" className="inline-flex items-center gap-2 rounded-xl bg-[#e99497] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d98287]">
                Get started
                <ArrowRight size={16} />
              </a>
              {user && (
                <button
                  onClick={() => navigate('/editor')}
                  className="inline-flex items-center rounded-xl border border-[#f3c583] bg-[#fff8ea] px-4 py-3 text-sm font-semibold text-[#9d6f2f]"
                >
                  Go to editor
                </button>
              )}
              <a href="#pricing" className="inline-flex items-center rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-4 py-3 text-sm font-semibold text-[#4b6a2e]">
                See pricing
              </a>
            </div>

            {billingOverview && (
              <div className="mt-4 inline-flex rounded-2xl border border-[#f3c583]/50 bg-white px-4 py-3 text-sm text-[#6a645a]">
                Current plan: <span className="ml-1 font-semibold text-[#2f2c28]">{billingOverview.currentPlan.label}</span>
              </div>
            )}

            {billingNotice && (
              <div className="mt-4 max-w-xl rounded-2xl bg-white px-4 py-3 text-sm text-[#6a645a]">
                {billingNotice}
              </div>
            )}
          </div>

          {user ? (
            <section className="rounded-3xl border border-[#f3c583]/60 bg-white p-6 shadow-xl shadow-[#f3c583]/25">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--play-ink)]">Workspace</h2>
                  <p className="mt-1 text-sm text-[#6a645a]">
                    Signed in as {billingOverview?.profile.email || user.email || 'your account'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAccountState()}
                  disabled={isAccountLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#f3c583]/60 bg-[#fff8ea] px-4 py-2 text-sm font-semibold text-[#9d6f2f] disabled:opacity-60"
                >
                  {isAccountLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                  Refresh state
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#fff6e8] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9d6f2f]">Plan</p>
                  <p className="mt-2 text-lg font-bold">{billingOverview?.currentPlan.label || 'Loading...'}</p>
                  <p className="mt-1 text-sm text-[#6a645a]">
                    {billingOverview?.profile.subscriptionStatus || 'Checking status'}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7ffe9] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#4b6a2e]">Active Invites</p>
                  <p className="mt-2 text-lg font-bold">{activeInvitations.length}</p>
                  <p className="mt-1 text-sm text-[#5b6850]">
                    {billingOverview?.usage.maxActiveInvites === null
                      ? 'Unlimited on this plan'
                      : `${billingOverview?.usage.remainingActiveInvites ?? 0} slots remaining`}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fff0f0] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">Archived</p>
                  <p className="mt-2 text-lg font-bold">{archivedInvitations.length}</p>
                  <p className="mt-1 text-sm text-[#6a645a]">Saved for later reuse</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/editor')}
                  className="rounded-xl bg-[#e99497] px-4 py-3 text-sm font-semibold text-white hover:bg-[#d98287]"
                >
                  Continue in editor
                </button>
                {billingOverview?.profile.hasCustomerPortal && (
                  <button
                    type="button"
                    onClick={handleManageBilling}
                    disabled={billingBusy === 'portal'}
                    className="rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-4 py-3 text-sm font-semibold text-[#3f6630] disabled:opacity-60"
                  >
                    {billingBusy === 'portal' ? 'Opening...' : 'Manage billing'}
                  </button>
                )}
              </div>
            </section>
          ) : (
            <AuthPanel onSuccess={() => navigate('/editor')} />
          )}
        </section>

        {user && (
          <section className="mt-8 rounded-3xl border border-[#e8e46e]/50 bg-white/90 p-6 shadow-lg shadow-[#f3c583]/15">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Your Invites</h2>
                <p className="mt-2 text-sm text-[#5f5a50]">
                  One consolidated view for active and archived invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/editor')}
                className="rounded-xl border border-[#f3c583]/60 bg-[#fff8ea] px-4 py-3 text-sm font-semibold text-[#9d6f2f]"
              >
                Create new invite
              </button>
            </div>

            {isAccountLoading ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-[#6a645a]">
                <Loader2 size={16} className="animate-spin" />
                Loading your invite workspace...
              </div>
            ) : myInvitations.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#f3c583]/70 bg-[#fffaf0] px-4 py-5 text-sm text-[#6a645a]">
                No invitations yet. Open the editor and publish your first one.
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {myInvitations.map((invitation) => (
                  <article
                    key={invitation.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#f3c583]/50 bg-[#fffdf8] p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[#2f2c28]">
                          {invitation.title || 'Untitled invitation'}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            invitation.status === 'active'
                              ? 'bg-[#f7ffe9] text-[#4b6a2e]'
                              : 'bg-[#f1f0ec] text-[#6a645a]'
                          }`}
                        >
                          {invitation.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#6a645a]">
                        {invitation.templateId ? `Template: ${invitation.templateId}` : 'Custom canvas'}
                      </p>
                      <p className="mt-1 text-xs text-[#8b857b]">
                        Created {new Date(invitation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`/invite/${invitation.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-4 py-2.5 text-sm font-semibold text-[#3f6630]"
                      >
                        Open invite
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate('/editor')}
                        className="rounded-xl border border-[#f3c583]/60 bg-[#fff8ea] px-4 py-2.5 text-sm font-semibold text-[#9d6f2f]"
                      >
                        Open editor
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section id="pricing" className="mt-12">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <p className="mt-2 text-sm text-[#5f5a50]">These limits are enforced on the backend, not just shown in the UI.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {visiblePlans.map((plan) => {
              const isCurrentPlan = billingOverview?.profile.planId === plan.id;
              const canManageBilling = Boolean(
                billingOverview?.profile.hasCustomerPortal && !plan.isFree && isCurrentPlan
              );

              return (
                <article key={plan.id} className="rounded-2xl border border-[#f3c583]/50 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#d3872e]">{plan.label}</p>
                      <p className="mt-2 text-3xl font-black">{plan.priceLabel}</p>
                      <p className="mt-1 text-sm text-[#6a645a]">{planSubtitles[plan.id]}</p>
                    </div>
                    {isCurrentPlan && (
                      <span className="rounded-full bg-[#f7ffe9] px-2 py-1 text-[10px] font-semibold text-[#4b6a2e]">
                        Current
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-[#3f3b35]">
                    {plan.marketingFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 text-[#6fa44a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {canManageBilling ? (
                      <button
                        type="button"
                        onClick={handleManageBilling}
                        disabled={billingBusy === 'portal'}
                        className="w-full rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-4 py-3 text-sm font-semibold text-[#3f6630] disabled:opacity-60"
                      >
                        {billingBusy === 'portal' ? 'Opening...' : 'Manage Billing'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePlanAction(plan.id)}
                        disabled={
                          billingBusy === plan.id ||
                          (isCurrentPlan && !plan.isFree) ||
                          (!plan.checkoutEnabled && !plan.isFree)
                        }
                        className="w-full rounded-xl bg-[#fff4dd] px-4 py-3 text-sm font-semibold text-[#9d6f2f] disabled:opacity-60"
                      >
                        {billingBusy === plan.id
                          ? 'Please wait...'
                          : isCurrentPlan && !plan.isFree
                            ? 'Current plan'
                            : !plan.checkoutEnabled && !plan.isFree
                              ? 'Unavailable'
                            : plan.isFree
                              ? 'Start Free'
                              : `Choose ${plan.label}`}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Loved by creators</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {feedback.map((item) => (
              <article key={item.author} className="rounded-2xl border border-[#e8e46e]/60 bg-white/90 p-5">
                <p className="text-sm text-[#3f3b35]">“{item.quote}”</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#6a645a]">{item.author}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e99497]/30 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[#5f5a50] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} funvitation. Made for memorable moments.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#2f2c28]">Privacy</a>
            <a href="#" className="hover:text-[#2f2c28]">Terms</a>
            <a href="#auth" className="hover:text-[#2f2c28]">Get Started</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
