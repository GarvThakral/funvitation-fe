import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createCustomerPortalSession, fetchBillingOverview, fetchPublicPlans, startPlanCheckout } from '../lib/billing-api';
import type { BillingOverview, PlanId, PublicPlan } from '../types';
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
  const { user } = useAuth();
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState<PlanId | 'portal' | null>(null);

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

  useEffect(() => {
    const loadBilling = async () => {
      if (!user) {
        setBillingOverview(null);
        return;
      }

      try {
        setBillingOverview(await fetchBillingOverview());
      } catch (error) {
        console.error('Failed to load billing overview:', error);
      }
    };

    void loadBilling();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff6e6_0%,_#fef9d8_42%,_#f3ffd9_100%)] text-[var(--play-ink)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-lg font-bold tracking-tight">funvitation</p>
        <a href="#auth" className="rounded-full border border-[#e99497]/50 bg-white px-4 py-2 text-sm font-medium hover:bg-[#fff0f0]">
          Sign in
        </a>
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

          <AuthPanel onSuccess={() => navigate('/editor')} />
        </section>

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
