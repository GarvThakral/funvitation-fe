import InfoPageLayout from './InfoPageLayout';

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms"
      subtitle="A simple usage page so the legal footer routes are implemented and readable instead of blank placeholders."
    >
      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Acceptable use</h2>
        <p className="mt-2">
          Use the editor to create lawful invitation content. Do not upload abusive, infringing,
          or malicious content into public invitation links.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Plans and limits</h2>
        <p className="mt-2">
          Plan limits are enforced server-side. Free and paid access can change based on your plan,
          archived invites, and successful billing events.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Service availability</h2>
        <p className="mt-2">
          The app depends on Firebase, Dodo Payments, and Cloudinary. Temporary outages or
          provider-side issues can affect login, uploads, billing, and invitation delivery.
        </p>
      </section>
    </InfoPageLayout>
  );
}
