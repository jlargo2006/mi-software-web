export const metadata = {
  title: 'Privacy Policy · Six Sigma Macro Tools',
  description:
    'How Six Sigma Macro Tools handles account data. Datasets are never stored on our servers.',
}

import Link from 'next/link'

const BRAND = '#00674d'
const PRODUCT_NAME = 'Six Sigma Macro Tools'
const CONTACT_EMAIL = 'support@sixsigmamacrotools.com'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* NAVBAR — provides the way back */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: BRAND }}
            >
              6σ
            </div>
            <div>
              <div className="font-bold text-lg leading-none">{PRODUCT_NAME}</div>
              <div className="text-xs text-gray-500">Six Sigma studies in your browser</div>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-8"
        >
          ← Home
        </Link>

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: September 2026</p>

        {/* SUMMARY BOX — the part most people actually read */}
        <div
          className="rounded-3xl border p-8 mb-12"
          style={{ backgroundColor: '#e6f2ee', borderColor: '#cfe6dd' }}
        >
          <h2 className="text-lg font-bold mb-4">The short version</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                We store your email address and an encrypted form of your password, so
                that you can sign in. Nothing else about you.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                <strong>We never store the data you analyse.</strong> Your datasets stay
                in your browser and are gone when your session ends.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                We do not sell, rent or trade your personal information, and we do not
                use it for advertising.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                You can ask us to delete your account and your email address at any
                time.
              </span>
            </li>
          </ul>
        </div>

        {/* INTRO */}
        <section className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            {PRODUCT_NAME} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects
            your privacy and is committed to protecting your personal information.
          </p>
          <p>
            This Privacy Policy explains what information we collect when you use our
            website and services, how we use it, and what rights you have over it.
          </p>
        </section>

        {/* INFORMATION COLLECTED */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

          <p className="text-gray-700 mb-3">
            When you create an account or use our services, we collect the following:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Your email address</strong>, used to identify your account and to
              send you account-related messages such as email confirmation and password
              resets.
            </li>
            <li>
              <strong>Your password, stored only in encrypted (hashed) form</strong> by
              our authentication provider. We cannot read your password, and neither can
              anyone else.
            </li>
            <li>
              <strong>Basic authentication and session data</strong> required to keep you
              signed in and to secure the account.
            </li>
            <li>
              <strong>Messages you send us</strong> through the contact form, including
              the name and email address you provide there.
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            We do not collect names, employers, job titles, telephone numbers or payment
            details, because the service does not require them.
          </p>

          <p className="text-gray-700 mt-4">
            We do not sell, rent or trade personal information with third parties.
          </p>
        </section>

        {/* THE DATA YOU ANALYSE — the key section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">The Data You Analyse</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            This section is separate from the one above on purpose. The measurements,
            observations and datasets you enter into the application are treated
            differently from your account information:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Datasets are never stored on our servers.</strong> There is no
              database of user worksheets or analysis results.
            </li>
            <li>
              Your data is held only in your browser for the duration of your session.
              When you sign out or close the application, it is discarded.
            </li>
            <li>
              The only way to keep your work is to <strong>export it as a JSON file to
              your own computer</strong>, which you do explicitly. That file is under your
              control and is never transmitted to us.
            </li>
            <li>
              Because nothing is retained, you must load your data again on each visit.
              This is a deliberate design decision, not a limitation.
            </li>
          </ul>

          <p className="text-gray-700 mt-4 leading-relaxed">
            One consequence worth stating plainly: we cannot recover your work for you,
            because we never had a copy of it. Export before you sign out.
          </p>

          <p className="text-gray-700 mt-4 leading-relaxed">
            You remain responsible for the data you choose to enter. If you work with
            information that is confidential to your employer or a third party, please
            follow your own organisation&apos;s policies and use decontextualised data
            where appropriate.
          </p>
        </section>

        {/* HOW WE USE DATA */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">How We Use Information</h2>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide access to the platform</li>
            <li>Authenticate users securely and manage sign-in sessions</li>
            <li>Send account-related messages, such as email confirmation and password resets</li>
            <li>Respond to support requests and contact form messages</li>
            <li>Maintain platform security and prevent abuse</li>
            <li>
              Inform registered users about significant changes to the service, including
              any future introduction of a paid plan
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            We do not use your information for advertising or profiling, and we do not
            send marketing messages from third parties.
          </p>
        </section>

        {/* THIRD PARTY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>

          <p className="text-gray-700 mb-3">
            We use the following providers to operate the service:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Supabase</strong> — authentication and account storage. Holds your
              email address and your encrypted password.
            </li>
            <li>
              <strong>Vercel</strong> — hosting and infrastructure. Processes standard
              technical request data such as IP address, as any web host does.
            </li>
          </ul>

          <p className="text-gray-700 mt-4">
            These providers process only the limited data necessary to operate their
            services. We do not embed third-party video players, advertising networks or
            social media trackers.
          </p>
        </section>

        {/* COOKIES */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Local Storage</h2>

          <p className="text-gray-700 leading-relaxed">
            We use cookies and browser storage only for purposes that are strictly
            necessary to run the service: keeping you signed in, maintaining your session
            and protecting the account. We do not use advertising or third-party tracking
            cookies.
          </p>
        </section>

        {/* SECURITY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>

          <p className="text-gray-700 leading-relaxed">
            All traffic to the site is encrypted in transit over HTTPS. Passwords are
            stored only as salted hashes by our authentication provider and are never
            accessible in plain text. We implement reasonable technical and
            organisational measures to protect your personal data against unauthorised
            access, loss or misuse. Because analysis data is never stored on our servers,
            it is not exposed by any incident affecting them.
          </p>
        </section>

        {/* RETENTION */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>

          <p className="text-gray-700 leading-relaxed">
            We keep your account information for as long as your account remains active.
            If you request deletion, your account and email address are removed. Contact
            form messages are kept only as long as needed to deal with your enquiry.
            Analysis data is not retained at all.
          </p>
        </section>

        {/* USER RIGHTS */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>

          <p className="text-gray-700 leading-relaxed mb-3">
            Depending on where you live, and in particular under the EU General Data
            Protection Regulation, you may have the right to:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Have inaccurate data corrected</li>
            <li>Have your data deleted, including your account</li>
            <li>Object to or restrict certain processing</li>
            <li>Receive a copy of your data in a portable format</li>
          </ul>

          <p className="text-gray-700 mt-4 leading-relaxed">
            To exercise any of these rights, write to us at the address below. In
            practice, the personal data we hold about you is your email address, so most
            requests are quick to fulfil.
          </p>

          <p className="mt-3 font-medium">
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:no-underline" style={{ color: BRAND }}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* CHANGES */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>

          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be
            posted on this page with an updated revision date. If a change materially
            affects how we handle your information, we will notify registered users by
            email.
          </p>
        </section>

        {/* CONTACT */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>

          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, you can reach us through
            the{' '}
            <Link href="/contact" className="underline hover:no-underline" style={{ color: BRAND }}>
              contact form
            </Link>{' '}
            or by email at:
          </p>

          <p className="mt-3 font-medium">
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:no-underline" style={{ color: BRAND }}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* FOOTER NAV */}
        <div className="mt-16 pt-8 border-t flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition">Home</Link>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
        </div>
      </div>
    </main>
  )
}
