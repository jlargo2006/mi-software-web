import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <div className="bg-white p-10 rounded-2xl shadow-sm max-w-md w-full">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4">¡Pago completado!</h1>
        <p className="text-gray-600 mb-8">
          Gracias por suscribirte a 6 Sigma Macro Tools. En breve recibirás un email con las instrucciones de acceso.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 rounded-xl text-sm font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}