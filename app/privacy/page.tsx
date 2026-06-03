export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      
      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-2">
        Privacy Policy
      </h1>

      <p className="text-gray-500 mb-12">
        Last updated: June 2026
      </p>

      {/* INTRO */}
      <section className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          Six Sigma Macro Tools ("we", "our", or "us") respects your privacy and is committed to protecting your personal information.
        </p>

        <p>
          This Privacy Policy explains how we collect, use, and protect information when you use our website and services.
        </p>
      </section>

      {/* INFORMATION COLLECTED */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Information We Collect
        </h2>

        <p className="text-gray-700 mb-3">
          When you create an account or use our services, we may collect the following information:
        </p>

        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Email address</li>
          <li>Authentication data provided through Supabase login system</li>
          <li>Basic usage data required for platform functionality</li>
        </ul>

        <p className="text-gray-700 mt-4">
          We do not sell, rent, or trade personal information with third parties.
        </p>
      </section>

      {/* HOW WE USE DATA */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          How We Use Information
        </h2>

        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide access to the platform</li>
          <li>Authenticate users securely</li>
          <li>Improve product performance and user experience</li>
          <li>Respond to support requests</li>
          <li>Maintain platform security and prevent abuse</li>
        </ul>
      </section>

      {/* THIRD PARTY */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Third-Party Services
        </h2>

        <p className="text-gray-700 mb-3">
          We use trusted third-party providers to operate the service:
        </p>

        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Supabase – authentication and database services</li>
          <li>Vercel – hosting and infrastructure</li>
          <li>Google services – indexing and analytics (if enabled)</li>
          <li>YouTube – embedded training content</li>
        </ul>

        <p className="text-gray-700 mt-4">
          These providers may process limited data necessary for the operation of their services.
        </p>
      </section>

      {/* COOKIES */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Cookies and Tracking
        </h2>

        <p className="text-gray-700 leading-relaxed">
          We may use cookies or similar technologies to improve website functionality, security, and user experience.
        </p>
      </section>

      {/* SECURITY */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Data Security
        </h2>

        <p className="text-gray-700 leading-relaxed">
          We implement reasonable technical and organizational measures to protect your personal data against unauthorized access, loss, or misuse.
        </p>
      </section>

      {/* USER RIGHTS */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Your Rights
        </h2>

        <p className="text-gray-700 leading-relaxed">
          You may request access, correction, or deletion of your personal data by contacting us at:
        </p>

        <p className="mt-3 font-medium">
          support@sixsigmamacrotools.com
        </p>
      </section>

      {/* CHANGES */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Changes to This Policy
        </h2>

        <p className="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
        </p>
      </section>

      {/* CONTACT */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Contact
        </h2>

        <p className="text-gray-700 leading-relaxed">
          If you have any questions about this Privacy Policy, you can contact us at:
        </p>

        <p className="mt-3 font-medium">
          support@sixsigmamacrotools.com
        </p>
      </section>

    </main>
  )
}