import InfoPageLayout from './InfoPageLayout';

const currentOrigin =
  typeof window !== 'undefined' ? window.location.origin : 'https://funvitation.entrext.com';

export default function SupportPage() {
  return (
    <InfoPageLayout
      title="Support"
      subtitle="This page centralizes the support, upvote, and social/community footer destinations so those links point to real content."
    >
      <section id="support">
        <h2 className="text-lg font-bold text-[#2f2c28]">Get help</h2>
        <p className="mt-2">
          If an invite fails to save, billing does not refresh, or uploads stop working, use the
          workspace dashboard first to check your current plan and archived invite count.
        </p>
      </section>

      <section id="upvote">
        <h2 className="text-lg font-bold text-[#2f2c28]">Upvote and share</h2>
        <p className="mt-2">
          Want to support the product? Share the public site with friends, event organizers, and
          collaborators using this URL:
        </p>
        <p className="mt-3 rounded-2xl bg-[#fffaf0] px-4 py-3 font-medium text-[#6a645a]">
          {currentOrigin}
        </p>
      </section>

      <section id="socials">
        <h2 className="text-lg font-bold text-[#2f2c28]">Community links</h2>
        <p className="mt-2">
          Social destinations are now routed here instead of dead `#` links. Add your final public
          handles whenever they are ready and keep this page as the central fallback.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <a
            href="/"
            className="rounded-2xl border border-[#f3c583]/55 bg-[#fffdf8] px-4 py-3 font-semibold text-[#2f2c28]"
          >
            Website
          </a>
          <a
            href="/support#upvote"
            className="rounded-2xl border border-[#f3c583]/55 bg-[#fffdf8] px-4 py-3 font-semibold text-[#2f2c28]"
          >
            Upvote
          </a>
          <a
            href="/support#support"
            className="rounded-2xl border border-[#f3c583]/55 bg-[#fffdf8] px-4 py-3 font-semibold text-[#2f2c28]"
          >
            Support
          </a>
        </div>
      </section>
    </InfoPageLayout>
  );
}
