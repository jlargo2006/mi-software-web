export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold mb-2">
        Contact
      </h1>

      <p className="text-gray-500 mb-12">
        Get in touch with the Six Sigma Macro Tools team.
      </p>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">

        <h2 className="text-2xl font-semibold mb-6">
          Support
        </h2>

        <p className="text-gray-700 mb-4">
          For questions, technical support, product feedback,
          licensing inquiries, or business requests, please contact us:
        </p>

        <div className="space-y-4">

          <div>
            <div className="font-semibold">
              Email
            </div>

            <div className="text-gray-700">
              support@sixsigmamacrotools.com
            </div>
          </div>

          <div>
            <div className="font-semibold">
              Website
            </div>

            <div className="text-gray-700">
              www.sixsigmamacrotools.com
            </div>
          </div>

        </div>

      </div>

      <section className="mt-12">

        <h2 className="text-2xl font-semibold mb-4">
          Business Hours
        </h2>

        <p className="text-gray-700">
          We aim to respond to inquiries as quickly as possible.
        </p>

      </section>

    </main>
  )
}