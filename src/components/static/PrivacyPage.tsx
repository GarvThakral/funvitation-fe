import InfoPageLayout from './InfoPageLayout';

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Privacy"
      subtitle="This page explains what account and invitation data the app stores so the footer link no longer dead-ends."
    >
      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Account data</h2>
        <p className="mt-2">
          funvitation uses Firebase Authentication for sign-in and stores your email, plan state,
          and invitation ownership metadata so the editor can show your workspace.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Invitation data</h2>
        <p className="mt-2">
          Invitations are stored in Firestore as JSON documents, including your canvas elements,
          colors, responses, and any uploaded image URLs needed to render the final invitation.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#2f2c28]">Billing and media</h2>
        <p className="mt-2">
          Billing is handled through Dodo Payments, and image uploads are sent through Cloudinary.
          The app stores only the identifiers and URLs required to keep your plan and invitations working.
        </p>
      </section>
    </InfoPageLayout>
  );
}
