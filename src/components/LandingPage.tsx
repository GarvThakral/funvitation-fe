import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import AuthPanel from './landing/AuthPanel';
import { useAuth } from '../auth/AuthContext';

const pricingTiers = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: 'Great for trying the product',
    features: ['1 active invite', 'Core templates', 'Basic sharing'],
  },
  {
    name: 'Creator',
    price: '$12/mo',
    subtitle: 'For frequent invite creators',
    features: ['Unlimited invites', 'Premium templates', 'Custom success screens'],
  },
  {
    name: 'Studio',
    price: '$29/mo',
    subtitle: 'For teams and events',
    features: ['Team access', 'Priority support', 'Advanced branding controls'],
  },
];

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

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          </div>

          <AuthPanel onSuccess={() => navigate('/editor')} />
        </section>

        <section id="pricing" className="mt-12">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <p className="mt-2 text-sm text-[#5f5a50]">Start free. Upgrade when your invites scale.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <article key={tier.name} className="rounded-2xl border border-[#f3c583]/50 bg-white p-5">
                <p className="text-sm font-semibold text-[#d3872e]">{tier.name}</p>
                <p className="mt-2 text-3xl font-black">{tier.price}</p>
                <p className="mt-1 text-sm text-[#6a645a]">{tier.subtitle}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#3f3b35]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 text-[#6fa44a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
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
