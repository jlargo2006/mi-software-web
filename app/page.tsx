'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'
import Link from 'next/link'

// 🎨 Brand palette
const BRAND = '#00674d'
const BRAND_DARK = '#00513d'
const BRAND_SOFT = '#e6f2ee'
const PRODUCT_NAME = 'Six Sigma Macro Tools'

// ---------------------------------------------------------------------------
//  DMAIC phases — kept in sync with lib/ribbon.ts
// ---------------------------------------------------------------------------
const PHASES = [
  {
    phase: 'PHASE 1',
    name: 'Define',
    count: 1,
    items: ['Pareto Chart'],
  },
  {
    phase: 'PHASE 2',
    name: 'Measure',
    count: 16,
    items: [
      'Cause & Effect (Fishbone)',
      'Descriptive Statistics',
      'Graphical Summary',
      'Normality Test',
      'Capability: Normal, Sixpack, Nonnormal',
      'Capability: Binomial, Poisson',
      'Distribution Identification',
      'Histogram · Dotplot · Boxplot · Time Series',
      'Gage R&R (Crossed)',
      'Attribute Agreement Analysis',
    ],
  },
  {
    phase: 'PHASE 3',
    name: 'Analyse',
    count: 22,
    items: [
      'Multi-Vari Chart',
      '1-Sample, 2-Sample & Paired t-tests',
      'Test for Equal Variance (F, Bartlett, Levene)',
      'One-Way ANOVA',
      'Sign · Wilcoxon · Mann-Whitney',
      "Mood's Median · Kruskal-Wallis",
      '1 & 2 Proportions · Chi-Square',
      'Power and Sample Size (8 designs)',
    ],
  },
  {
    phase: 'PHASE 4',
    name: 'Improve',
    count: 14,
    items: [
      'Scatterplot · Correlation',
      'Simple Linear Regression',
      'Fit Regression Model',
      'Best Subsets Regression',
      'Box-Cox Transformation · Matrix Plot',
      'Create & Analyze Factorial Design',
      'Response Optimizer',
      'Main Effects · Interaction · Cube · Contour',
    ],
  },
  {
    phase: 'PHASE 5',
    name: 'Control',
    count: 10,
    items: [
      'Xbar-R · Xbar-S Charts',
      'I-MR · Moving Range Charts',
      'P · NP · Laney P′ Charts',
      'U · C · Laney U′ Charts',
    ],
  },
]

// ---------------------------------------------------------------------------
//  Screenshots — files live in /public/images
// ---------------------------------------------------------------------------
const SCREENSHOTS = [
  {
    src: '/images/graphical-summary.png',
    title: 'Graphical Summary',
    text: 'Histogram with fitted curve, boxplot, confidence intervals for mean and median, and Anderson-Darling normality test in a single output.',
  },
  {
    src: '/images/capability-test.png',
    title: 'Process Capability',
    text: 'Cp, Cpk, Pp, Ppk, PPM and sigma level, with within and overall variation shown against your specification limits.',
  },
  {
    src: '/images/pareto.png',
    title: 'Pareto Chart',
    text: 'Rank defect categories by frequency with cumulative percentage line to isolate the vital few causes.',
  },
  {
    src: '/images/two-sample-t-test.png',
    title: 'Hypothesis Testing',
    text: 'Full battery of parametric and non-parametric tests, with assumption checks and plain-language conclusions.',
  },
  {
    src: '/images/imr.png',
    title: 'Control Charts',
    text: 'I-MR, Xbar-R, Xbar-S and attribute charts with Nelson rules applied automatically to flag special causes.',
  },
  {
    src: '/images/normality-test.png',
    title: 'Normality Test',
    text: 'Probability plot with Anderson-Darling statistic and p-value, so you know which test is valid before you run it.',
  },
]

const THEORY_POINTS = [
  {
    icon: '📐',
    title: 'Theory next to every study',
    text: 'Each analysis ships with its own theory panel: assumptions, formulas, decision rules and a worked example. Learn the method while you apply it.',
  },
  {
    icon: '📚',
    title: 'Referenced methodology',
    text: 'Studies cite the standard statistical literature they are based on, so results can be traced back to a published source.',
  },
  {
    icon: '☁️',
    title: 'Nothing to install',
    text: 'Runs in the browser. No desktop client, no license server, no admin rights needed on your machine.',
  },
  {
    icon: '🔒',
    title: 'Your data stays yours',
    text: 'Datasets are never stored on our servers. They live in your browser session and are gone when you sign out.',
  },
]

export default function Home() {
  const [activePhase, setActivePhase] = useState('Measure')
  const { user } = useAuth()

  const current = PHASES.find((p) => p.name === activePhase) ?? PHASES[1]
  const totalStudies = PHASES.reduce((sum, p) => sum + p.count, 0)

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
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

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#studies" className="hover:opacity-70 transition">Studies</a>
            <a href="#preview" className="hover:opacity-70 transition">Preview</a>
            <a href="#access" className="hover:opacity-70 transition">Access</a>

            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link href="/app">
                  <button
                    className="text-white px-5 py-2.5 rounded-2xl transition text-sm font-semibold"
                    style={{ backgroundColor: BRAND }}
                  >
                    Go to app
                  </button>
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut() }}
                  className="border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition text-sm"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition text-sm">
                    Sign in
                  </button>
                </Link>
                <Link href="/login?mode=register">
                  <button
                    className="text-white px-6 py-3 rounded-2xl font-semibold transition hover:scale-105 text-sm"
                    style={{ backgroundColor: BRAND }}
                  >
                    Create free account
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden">
            <Link href={user ? '/app' : '/login?mode=register'}>
              <button
                className="text-white px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: BRAND }}
              >
                {user ? 'Open app' : 'Sign up'}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-28">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${BRAND_SOFT}, #ffffff)` }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: BRAND_SOFT }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 mb-10 border"
            style={{ backgroundColor: BRAND_SOFT, borderColor: '#cfe6dd' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND }} />
            <span className="text-sm font-medium" style={{ color: BRAND_DARK }}>
              Free while in early access
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-5xl mx-auto">
            The full DMAIC toolkit,
            <br />
            <span style={{ color: BRAND }}>in your browser</span>
          </h1>

          <p className="mt-10 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {totalStudies} statistical studies organised by Define, Measure, Analyse,
            Improve and Control — each one with its own theory, formulas and worked
            example. Nothing to install.
          </p>

          <div className="flex flex-wrap justify-center gap-5 mt-14">
            <Link href={user ? '/app' : '/login?mode=register'}>
              <button
                className="text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition"
                style={{ backgroundColor: BRAND }}
              >
                {user ? 'Open the app' : 'Create your free account'}
              </button>
            </Link>
            <a
              href="#preview"
              className="border border-gray-300 hover:border-gray-900 px-10 py-5 rounded-2xl text-lg transition"
            >
              See it in action
            </a>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            Register with an email and start straight away · No payment details
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            {[
              [`${totalStudies}`, 'Statistical studies available'],
              ['DMAIC', 'Organised by project phase, not by menu'],
              ['0', 'Files to install or license'],
            ].map(([big, small]) => (
              <div key={small} className="bg-white border shadow-sm rounded-3xl p-8">
                <div className="text-5xl font-bold mb-4" style={{ color: BRAND }}>{big}</div>
                <div className="text-gray-600 text-lg">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for people doing the project
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Not a general-purpose statistics package with a Six Sigma menu bolted on.
              The whole tool is arranged the way a DMAIC project actually runs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {THEORY_POINTS.map(({ icon, title, text }) => (
              <div
                key={title}
                className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-lg transition"
              >
                <div className="text-4xl mb-5">{icon}</div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIES BY PHASE */}
      <section id="studies" className="px-6 py-28" style={{ backgroundColor: BRAND_SOFT }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Every phase covered
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pick a phase to see what is available today. All of it is built and
              working — nothing on this list is a placeholder.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {PHASES.map((p) => (
              <button
                key={p.name}
                onClick={() => setActivePhase(p.name)}
                className="px-6 py-3 rounded-2xl transition font-medium border"
                style={
                  activePhase === p.name
                    ? { backgroundColor: BRAND, color: 'white', borderColor: BRAND }
                    : { backgroundColor: 'white', color: '#111827', borderColor: '#cfe6dd' }
                }
              >
                {p.name}
                <span className="ml-2 text-xs opacity-70">{p.count}</span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border shadow-lg p-10 max-w-4xl mx-auto">
            <div className="text-sm font-semibold mb-2" style={{ color: BRAND_DARK }}>
              {current.phase}
            </div>
            <div className="flex items-baseline gap-4 mb-8">
              <h3 className="text-4xl font-bold">{current.name}</h3>
              <span className="text-gray-500">{current.count} studies</span>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {current.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 font-bold" style={{ color: BRAND }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SCREENSHOT PREVIEW */}
      <section
        id="preview"
        className="px-6 py-28"
        style={{ background: `linear-gradient(to bottom, ${BRAND_SOFT}, #ffffff)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Reports you can put in a review
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real output from the application, not mock-ups.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {SCREENSHOTS.map(({ src, title, text }) => (
              <figure
                key={title}
                className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300"
              >
                <Image
                  src={src}
                  alt={`${title} output in ${PRODUCT_NAME}`}
                  width={800}
                  height={500}
                  className="w-full transition duration-500 group-hover:scale-[1.01]"
                />
                <figcaption className="p-8">
                  <h3 className="text-2xl font-bold mb-3">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How it works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three steps, and your data never leaves your machine unless you decide otherwise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['01', 'Load your data', 'Paste or type your measurements into the worksheet, or restore a previously saved JSON file from your computer.'],
              ['02', 'Run the study', 'Choose the phase, pick the study, set your options. Read the theory panel if you want the reasoning behind the method.'],
              ['03', 'Save what you need', 'Export your session as a JSON file to your own machine. Nothing is kept on our servers, so bring it back next time you sign in.'],
            ].map(([num, title, text]) => (
              <div key={num} className="relative">
                <div
                  className="text-6xl font-bold mb-5 opacity-20"
                  style={{ color: BRAND }}
                >
                  {num}
                </div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-16 rounded-3xl p-8 border text-center"
            style={{ backgroundColor: BRAND_SOFT, borderColor: '#cfe6dd' }}
          >
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              <strong>A note on saving.</strong> Sessions are not stored server-side.
              That is deliberate — it keeps your process data under your control — but it
              means you need to export your work before signing out, and load it back in
              on your next visit.
            </p>
          </div>
        </div>
      </section>

      {/* ACCESS */}
      <section id="access" className="px-6 py-28" style={{ backgroundColor: BRAND_SOFT }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Free while in early access</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Create an account with your email and you get everything. No payment
            details, no trial countdown.
          </p>

          <div className="bg-white rounded-3xl border shadow-2xl p-12">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
              style={{ backgroundColor: BRAND_SOFT }}
            >
              <span className="text-sm font-semibold" style={{ color: BRAND_DARK }}>
                Early access
              </span>
            </div>

            <div className="mb-2">
              <span className="text-6xl font-bold" style={{ color: BRAND }}>Free</span>
            </div>
            <p className="text-gray-500 mb-8">Registration is all that is required</p>

            <ul className="text-left space-y-4 mb-10 max-w-sm mx-auto">
              {[
                `All ${totalStudies} studies, every DMAIC phase`,
                'Theory, formulas and worked examples included',
                'Export and reload your sessions as JSON',
                'No install, runs in any modern browser',
                'No credit card, no payment details',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg" style={{ color: BRAND }}>✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <Link href={user ? '/app' : '/login?mode=register'}>
              <button
                className="w-full text-white px-8 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition"
                style={{ backgroundColor: BRAND }}
              >
                {user ? 'Open the app' : 'Create free account'}
              </button>
            </Link>

            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              A paid annual plan is planned for the future. Accounts created during
              early access will be told well in advance, and nothing will start
              charging without you actively choosing it.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="px-6 py-28 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready for your next study?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
            Sign up with an email and run your first capability analysis in the next
            five minutes.
          </p>
          <Link href={user ? '/app' : '/login?mode=register'}>
            <button
              className="bg-white px-12 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition"
              style={{ color: BRAND_DARK }}
            >
              {user ? 'Open the app' : 'Create free account'}
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-16 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND }}
              >
                6σ
              </div>
              <span className="font-bold text-lg text-white">{PRODUCT_NAME}</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#studies" className="hover:text-white transition">Studies</a>
              <a href="#preview" className="hover:text-white transition">Preview</a>
              <a href="#access" className="hover:text-white transition">Access</a>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
            © {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
