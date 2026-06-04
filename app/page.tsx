'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {

  const [activeTab, setActiveTab] = useState('define')

  const videos = {
    define: [
      {
        title: 'Define Pareto',
        id: 'VPOqSBL3gEo',
      },
      {
        title: 'Define Random Distribution',
        id: 'P_tvEONoUZU',
      },
    ],

    measure: [
      {
        title: 'Cause And Effect',
        id: 'WVz2maqfN4A',
      },
      {
        title: 'Descriptive Statistics',
        id: 'UtP2feF1VYQ',
      },
      {
        title: 'Normality Test',
        id: 'O3k0PPV4jn4',
      },
      {
        title: 'Graphical Summary',
        id: 'SG9-DV3ie8I',
      },
    ],

    analyze: [],
    improve: [],
    control: [],
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
              6σ
            </div>

            <div>

              <div className="font-bold text-lg leading-none">
                6 Sigma Macro Tools
              </div>

              <div className="text-xs text-gray-500">
                Statistical Excel Automation
              </div>

            </div>

          </div>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">

            <a
              href="#features"
              className="hover:text-gray-500 transition"
            >
              Features
            </a>

            <a
              href="#videos"
              className="hover:text-gray-500 transition"
            >
              Videos
            </a>

            <a
              href="#pricing"
              className="hover:text-gray-500 transition"
            >
              Pricing
            </a>

            <Link href="/login">
              <button className="border border-gray-300 hover:border-black px-5 py-2.5 rounded-2xl transition">
                Login
              </button>
            </Link>

            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-semibold transition hover:scale-105">
              Try Free
            </button>

          </div>

        </div>

      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-32">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gray-200 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto text-center">

          {/* BADGE */}
          <div className="inline-flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-full px-6 py-3 mb-10">

            <div className="w-2 h-2 rounded-full bg-green-500" />

            <span className="text-sm font-medium">
              Excel-Based Six Sigma Platform
            </span>

          </div>

          {/* TITLE */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none max-w-6xl mx-auto">

            Six Sigma Analysis Platform
            <br />

            <span className="text-gray-400">
              for Excel
            </span>

          </h1>

          {/* SUBTITLE */}
          <p className="mt-10 text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">

            Organize your entire DMAIC workflow inside Excel.
            Generate capability studies, control charts,
            hypothesis tests and quality reports in seconds.

          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap justify-center gap-5 mt-14">

            <button className="bg-black text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition">
              Try Free
            </button>

            <button className="border border-gray-300 hover:border-black px-10 py-5 rounded-2xl text-lg transition">
              View Training
            </button>

          </div>

          {/* METRICS */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">

            <div className="bg-white border shadow-sm rounded-3xl p-8">

              <div className="text-5xl font-bold mb-4">
                50+
              </div>

              <div className="text-gray-600 text-lg">
                Statistical Tools
              </div>

            </div>

            <div className="bg-white border shadow-sm rounded-3xl p-8">

              <div className="text-5xl font-bold mb-4">
                DMAIC
              </div>

              <div className="text-gray-600 text-lg">
                Full Six Sigma Workflow
              </div>

            </div>

            <div className="bg-white border shadow-sm rounded-3xl p-8">

              <div className="text-5xl font-bold mb-4">
                Excel
              </div>

              <div className="text-gray-600 text-lg">
                Native Integration
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* WHY CHOOSE */}
      <section className="px-6 py-24 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why Quality Teams Choose
              <br />
              Six Sigma Macro Tools
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Lean Six Sigma practitioners who work
              in Excel every day.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* DMAIC */}
            <div className="bg-white border rounded-3xl p-10 shadow-sm hover:shadow-lg transition">

              <div className="text-5xl mb-6">
                🎯
              </div>

              <h3 className="text-2xl font-bold mb-4">
                DMAIC Driven
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed">
                Tools organized around the Define, Measure, Analyze,
                Improve and Control methodology instead of generic
                statistical menus.
              </p>

            </div>

            {/* EXCEL */}
            <div className="bg-white border rounded-3xl p-10 shadow-sm hover:shadow-lg transition">

              <div className="text-5xl mb-6">
                📊
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Excel Native
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed">
                Perform advanced statistical analysis directly inside
                Excel without importing or exporting data between
                different applications.
              </p>

            </div>

            {/* SPEED */}
            <div className="bg-white border rounded-3xl p-10 shadow-sm hover:shadow-lg transition">

              <div className="text-5xl mb-6">
                ⚡
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Faster Workflow
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed">
                Access the most commonly used Six Sigma tools from a
                dedicated ribbon designed for quality engineers and
                process improvement teams.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* SOFTWARE PREVIEW */}
      <section className="px-6 py-28 bg-gradient-to-b from-white to-gray-100">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Professional Statistical Analysis
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced Six Sigma reporting and process capability tools
              directly integrated into Excel workflows.
            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-10">

            {/* GRAPHICAL SUMMARY */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/graphical-summary.png"
                alt="Graphical Summary"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Graphical Summary
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Automatically generate histograms, density curves,
                  confidence intervals and normality analysis.
                </p>

              </div>

            </div>

            {/* CAPABILITY */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/capability-test.png"
                alt="Capability Analysis"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Process Capability
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Cp, Cpk, PPM and sigma capability analysis
                  generated instantly from production data.
                </p>

              </div>

            </div>

            {/* PARETO */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/pareto.png"
                alt="Pareto Analysis"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Pareto Analysis
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Identify critical causes and prioritize process
                  improvements using Pareto methodology.
                </p>

              </div>

            </div>

            {/* T TEST */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/two-sample-t-test.png"
                alt="Two Sample T-Test"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Hypothesis Testing
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Compare populations and validate process
                  improvements using statistical testing.
                </p>

              </div>

            </div>

            {/* IMR */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/imr.png"
                alt="IMR Control Chart"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  IMR Control Charts
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Monitor process stability and detect special causes
                  using Individuals & Moving Range charts.
                </p>

              </div>

            </div>

            {/* NORMALITY */}
            <div className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">

              <img
                src="/images/normality-test.png"
                alt="Normality Test"
                className="w-full transition duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Normality Testing
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  Validate statistical assumptions with automated
                  Anderson-Darling normality analysis.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* DMAIC WORKFLOW */}
      <section className="px-6 py-28 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Built Around DMAIC
            </h2>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Unlike traditional statistical software, tools are organized
              according to the Lean Six Sigma methodology, making projects
              easier to execute from Define through Control.
            </p>

          </div>

          <div className="grid lg:grid-cols-5 gap-6">

            {/* DEFINE */}
            <div className="bg-gray-50 border rounded-3xl p-8">

              <div className="text-sm font-semibold text-gray-500 mb-3">
                PHASE 1
              </div>

              <h3 className="text-3xl font-bold mb-6">
                Define
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li>• Pareto Chart</li>
                <li>• Random Samples</li>
              </ul>

            </div>

            {/* MEASURE */}
            <div className="bg-gray-50 border rounded-3xl p-8">

              <div className="text-sm font-semibold text-gray-500 mb-3">
                PHASE 2
              </div>

              <h3 className="text-3xl font-bold mb-6">
                Measure
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li>• Graphical Summary</li>
                <li>• Normality Test</li>
                <li>• Capability Analysis</li>
                <li>• Gage R&R</li>
                <li>• Attribute Agreement</li>
                <li>• Histograms</li>
              </ul>

            </div>

            {/* ANALYZE */}
            <div className="bg-gray-50 border rounded-3xl p-8">

              <div className="text-sm font-semibold text-gray-500 mb-3">
                PHASE 3
              </div>

              <h3 className="text-3xl font-bold mb-6">
                Analyze
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li>• Hypothesis Tests</li>
                <li>• Multi-Vari Chart</li>
                <li>• Root Cause Analysis</li>
              </ul>

            </div>

            {/* IMPROVE */}
            <div className="bg-gray-50 border rounded-3xl p-8">

              <div className="text-sm font-semibold text-gray-500 mb-3">
                PHASE 4
              </div>

              <h3 className="text-3xl font-bold mb-6">
                Improve
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li>• DOE (Coming Soon)</li>
                <li>• Optimization Tools</li>
              </ul>

            </div>

            {/* CONTROL */}
            <div className="bg-gray-50 border rounded-3xl p-8">

              <div className="text-sm font-semibold text-gray-500 mb-3">
                PHASE 5
              </div>

              <h3 className="text-3xl font-bold mb-6">
                Control
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li>• I-MR Charts</li>
                <li>• SPC Monitoring</li>
                <li>• Control Plans</li>
              </ul>

            </div>

          </div>

        </div>

      </section>

      {/* COMPARISON */}
      <section
        id="features"
        className="px-6 py-28 bg-gray-50"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6">
              Why Teams Prefer DMAIC Workflows
            </h2>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Six Sigma Macro Tools focuses on workflow efficiency and
              Excel integration rather than forcing users to navigate
              complex statistical software menus.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full bg-white rounded-3xl overflow-hidden shadow-lg">

              <thead>

                <tr className="border-b">

                  <th className="text-left p-8 text-xl">
                    Feature
                  </th>

                  <th className="p-8 text-xl">
                    Six Sigma Macro Tools
                  </th>

                  <th className="p-8 text-xl">
                    Traditional Statistical Software
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="p-6 font-medium">DMAIC Organization</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✗</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6 font-medium">Excel Native Workflow</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✗</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6 font-medium">Dedicated Six Sigma Taskbar</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✗</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6 font-medium">Capability Analysis</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✓</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6 font-medium">Control Charts</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✓</td>
                </tr>

                <tr className="border-b">
                  <td className="p-6 font-medium">Hypothesis Testing</td>
                  <td className="p-6 text-center">✓</td>
                  <td className="p-6 text-center">✓</td>
                </tr>

                <tr>
                  <td className="p-6 font-medium">DOE</td>
                  <td className="p-6 text-center">Coming Soon</td>
                  <td className="p-6 text-center">✓</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* VIDEOS */}
      <section
        id="videos"
        className="px-6 py-28"
      >

        <div className="max-w-7xl mx-auto">

          <h2 className="text-5xl font-bold text-center mb-16">
            Training Videos
          </h2>

          {/* TABS */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">

            {['define', 'measure', 'analyze', 'improve', 'control'].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-2xl capitalize transition ${
                  activeTab === tab
                    ? 'bg-black text-white'
                    : 'bg-gray-100'
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* VIDEO GRID */}
          <div className="grid md:grid-cols-2 gap-10">

            {videos[activeTab as keyof typeof videos].length > 0 ? (

              videos[activeTab as keyof typeof videos].map((video) => (

                <div
                  key={video.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border"
                >

                  <iframe
                    className="w-full aspect-video"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allowFullScreen
                  />

                  <div className="p-6">

                    <h3 className="text-2xl font-semibold">
                      {video.title}
                    </h3>

                  </div>

                </div>

              ))

            ) : (

              <div className="col-span-2 text-center py-20 text-gray-500 text-xl">
                Coming Soon
              </div>

            )}

          </div>

        </div>

      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="px-6 py-28 bg-gray-50"
      >

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-5xl font-bold mb-8">
            Pricing
          </h2>

          <p className="text-xl text-gray-600 mb-16">
            Start free and upgrade when your team grows.
          </p>

          <div className="bg-white border rounded-3xl p-14 shadow-sm">

            <h3 className="text-3xl font-bold mb-4">
              Professional
            </h3>

            <p className="text-6xl font-bold mb-8">
              $49
            </p>

            <ul className="space-y-4 text-lg text-gray-600 mb-10">
              <li>✓ Full macro toolkit</li>
              <li>✓ Training videos</li>
              <li>✓ Lifetime updates</li>
              <li>✓ Email support</li>
            </ul>

            <button className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold">
              Try Free
            </button>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="px-6 py-28 text-center">

        <h2 className="text-5xl font-bold max-w-4xl mx-auto leading-tight">
          Improve Your Six Sigma Workflow Today
        </h2>

        <p className="mt-8 text-xl text-gray-600">
          Faster analysis. Better reporting. Smarter Excel automation.
        </p>

        <button className="mt-12 bg-black text-white px-10 py-5 rounded-2xl text-xl font-semibold">
          Try Free
        </button>

      </section>
      
      {/* DARK SECTION */}
      <section className="bg-black text-white px-6 py-32">

        <div className="max-w-7xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* LEFT */}
            <div>

              <div className="inline-block bg-white/10 border border-white/10 rounded-full px-5 py-2 text-sm mb-8">
                Lean Six Sigma Platform
              </div>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                Designed For
                <br />
                Real Quality Teams
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
                Automate statistical analysis, process capability,
                control charts and reporting workflows directly
                inside Excel using advanced Six Sigma tools.
              </p>

              <div className="flex flex-wrap gap-4">

                <button className="bg-white text-black px-8 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition">
                  Try Free
                </button>

                <Link href="/contact">
                  <button className="border border-white/20 px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition">
                    Contact Sales
                  </button>
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="grid grid-cols-2 gap-6">

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

                <div className="text-5xl font-bold mb-4">
                  50+
                </div>

                <div className="text-gray-300 text-lg">
                  Statistical Tools
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

                <div className="text-5xl font-bold mb-4">
                  DMAIC
                </div>

                <div className="text-gray-300 text-lg">
                  Full Workflow
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

                <div className="text-5xl font-bold mb-4">
                  Excel
                </div>

                <div className="text-gray-300 text-lg">
                  Native Integration
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

                <div className="text-5xl font-bold mb-4">
                  SPC
                </div>

                <div className="text-gray-300 text-lg">
                  Process Control
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t px-6 py-10">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="text-gray-500">
            © 2025 6 Sigma Macro Tools
          </div>

          <div className="flex gap-8 text-gray-500">

            <Link href="/privacy">
              Privacy
            </Link>

            <Link href="/terms">
              Terms
            </Link>

            <Link href="/contact">
              Contacto
            </Link>
          </div>

        </div>

      </footer>

    </main>
  )
}