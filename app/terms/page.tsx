export const metadata = {
  title: 'Terms of Service · Six Sigma Macro Tools',
  description:
    'Terms governing the use of Six Sigma Macro Tools, a browser-based statistical analysis tool for DMAIC projects.',
}

import Link from 'next/link'

const BRAND = '#00674d'
const PRODUCT_NAME = 'Six Sigma Macro Tools'
const CONTACT_EMAIL = 'support@sixsigmamacrotools.com'

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: September 2026</p>

        {/* SUMMARY BOX */}
        <div
          className="rounded-3xl border p-8 mb-12"
          style={{ backgroundColor: '#e6f2ee', borderColor: '#cfe6dd' }}
        >
          <h2 className="text-lg font-bold mb-4">The short version</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                The service is free while in early access. Registering with an email is
                all that is required.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                A paid annual plan may be introduced later. Existing accounts will be
                notified in advance and <strong>nothing will ever be charged
                automatically</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                Your work is not stored on our servers. Export it before you sign out or
                it is lost.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold" style={{ color: BRAND }}>✓</span>
              <span>
                Statistical results are provided as a tool. You remain responsible for
                interpreting them and for any decision you base on them.
              </span>
            </li>
          </ul>
        </div>

        <section className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            By accessing or using {PRODUCT_NAME}, you agree to be bound by these Terms of
            Service.
          </p>
          <p>If you do not agree with these terms, please do not use the platform.</p>
        </section>

        {/* THE SERVICE */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">The Service</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            {PRODUCT_NAME} is a browser-based statistical analysis application for Lean
            Six Sigma and quality improvement work. It provides studies organised by the
            Define, Measure, Analyse, Improve and Control phases, together with
            explanatory theory, formulas and worked examples for each method.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The service is delivered entirely through the web browser. There is no
            software to download or install, and no separate licence is issued.
          </p>
        </section>

        {/* ACCESS AND FUTURE PRICING */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Access and Future Pricing</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            The service is currently offered free of charge during its early access
            period. Creating an account requires only a valid email address and a
            password. We do not ask for payment details, and there is no trial period
            that expires.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            We may introduce a paid annual subscription in the future. If we do:
          </p>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Registered users will be notified by email a reasonable time in advance.
            </li>
            <li>
              <strong>No charge will ever be applied automatically.</strong> A paid plan
              will only begin if you actively choose to subscribe and provide payment
              details yourself.
            </li>
            <li>
              If you choose not to subscribe, access to some or all features may end, but
              you will not owe anything.
            </li>
            <li>
              You will have the opportunity to export your work before any change to your
              level of access takes effect.
            </li>
          </ul>

          <p className="text-gray-700 leading-relaxed mt-4">
            Because the service is provided free of charge during early access, features
            may change, be added or be withdrawn, and availability is not guaranteed.
          </p>
        </section>

        {/* USER ACCOUNTS */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activity carried out through your account. Accounts
            are personal and should not be shared.
          </p>

          <p className="text-gray-700 leading-relaxed">
            You may request deletion of your account at any time by writing to us. We may
            suspend or terminate an account that breaches these terms or that is used in a
            way that threatens the security or availability of the service.
          </p>
        </section>

        {/* YOUR DATA AND YOUR RESPONSIBILITY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Your Data and Your Responsibility</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            The data you enter into the application is not stored on our servers. It
            exists only in your browser session and is discarded when that session ends.
            The only way to preserve your work is to export it as a file to your own
            computer.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>You are solely responsible for exporting and safeguarding your
            work.</strong> We cannot recover lost sessions, because we hold no copy of
            them.
          </p>

          <p className="text-gray-700 leading-relaxed">
            You are also responsible for ensuring that you are entitled to use the data
            you enter. If the data belongs to your employer, a customer or another third
            party, you must comply with any applicable confidentiality obligations and
            internal policies. Do not enter data you are not permitted to process outside
            your own organisation&apos;s systems.
          </p>
        </section>

        {/* ACCEPTABLE USE */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>

          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Do not attempt to gain unauthorised access to the platform or to other users&apos; accounts.</li>
            <li>Do not interfere with the operation, integrity or security of the system.</li>
            <li>Do not use the service for unlawful purposes.</li>
            <li>Do not attempt to copy, scrape or redistribute the application or its content without permission.</li>
            <li>Do not use automated means to place unreasonable load on the service.</li>
          </ul>
        </section>

        {/* INTELLECTUAL PROPERTY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            The application, its source code, interface, branding, written explanatory
            content and documentation are the property of their respective owners and are
            protected by applicable intellectual property laws. Your account grants you
            permission to use the service; it does not transfer any ownership.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The statistical methods themselves are established, publicly documented
            techniques and are not claimed as proprietary. The data you enter, and any
            file you export, remain entirely yours.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            The service is provided on an &quot;as is&quot; and &quot;as available&quot;
            basis, without warranties of any kind, whether express or implied. We do not
            warrant uninterrupted or error-free operation.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The application is a calculation and learning aid. While we take care over the
            correctness of the statistical routines, <strong>results should be reviewed by
            a competent user before being relied upon</strong>. Nothing in the application
            constitutes engineering, quality, regulatory or professional advice, and you
            remain responsible for the interpretation of results and for any decision
            taken on the basis of them.
          </p>
        </section>

        {/* LIMITATION OF LIABILITY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>

          <p className="text-gray-700 leading-relaxed">
            To the maximum extent permitted by law, {PRODUCT_NAME} shall not be liable for
            any indirect, incidental, special, consequential or punitive damages, nor for
            loss of data, loss of profits or business interruption, arising from the use of
            or inability to use the service. Nothing in these terms limits liability where
            such limitation is not permitted by applicable law.
          </p>
        </section>

        {/* PRIVACY */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Privacy</h2>

          <p className="text-gray-700 leading-relaxed">
            Our handling of personal data is described in the{' '}
            <Link href="/privacy" className="underline hover:no-underline" style={{ color: BRAND }}>
              Privacy Policy
            </Link>
            , which forms part of these terms.
          </p>
        </section>

        {/* CHANGES */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>

          <p className="text-gray-700 leading-relaxed">
            We may update these Terms of Service from time to time. Updated versions will
            be published on this page with a revised date. Where a change materially
            affects your rights, in particular any change relating to pricing, registered
            users will be notified by email.
          </p>
        </section>

        {/* CONTACT */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>

          <p className="text-gray-700 leading-relaxed">
            Questions regarding these Terms may be sent through the{' '}
            <Link href="/contact" className="underline hover:no-underline" style={{ color: BRAND }}>
              contact form
            </Link>{' '}
            or by email to:
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
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
        </div>
      </div>
    </main>
  )
}
