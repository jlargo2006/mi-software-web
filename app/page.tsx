'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-provider'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'
import Link from 'next/link'

// 🎨 Paleta Ford (cámbiala aquí si quieres)
const BRAND = '#00674d'
const BRAND_DARK = '#00513d'
const BRAND_SOFT = '#e6f2ee'
const PRODUCT_NAME = '6 Sigma Studio' // 👈 cambia el nombre aquí

function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <iframe
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        title={title}
        allow="autoplay"
        allowFullScreen
      />
    )
  }

  return (
    <button
      onClick={() => setActive(true)}
      className="relative w-full aspect-video bg-black group"
      aria-label={`Reproducir ${title}`}
    >
      <Image
        src={`/images/thumb-${id}.jpg`}
        alt={title}
        fill
        priority
        className="object-cover opacity-80 group-hover:opacity-60 transition"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('define')
  const { user } = useAuth()

  const videos = {
    define: [
      { title: 'Pareto', id: 'VPOqSBL3gEo' },
      { title: 'Muestreo aleatorio', id: 'P_tvEONoUZU' },
    ],
    measure: [
      { title: 'Diagrama causa-efecto', id: 'WVz2maqfN4A' },
      { title: 'Estadística descriptiva', id: 'UtP2feF1VYQ' },
      { title: 'Test de normalidad', id: 'O3k0PPV4jn4' },
      { title: 'Resumen gráfico', id: 'SG9-DV3ie8I' },
    ],
    analyze: [],
    improve: [],
    control: [],
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: BRAND }}
            >
              6σ
            </div>
            <div>
              <div className="font-bold text-lg leading-none">{PRODUCT_NAME}</div>
              <div className="text-xs text-gray-500">Análisis Six Sigma de principio a fin</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-[color:var(--brand)] transition" style={{ ['--brand' as string]: BRAND }}>
              Funciones
            </a>
            <a href="#videos" className="hover:opacity-70 transition">Vídeos</a>
            <a href="#pricing" className="hover:opacity-70 transition">Precios</a>

            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <Link href="/app/six-sigma">
                  <button
                    className="text-white px-5 py-2.5 rounded-2xl transition text-sm font-semibold"
                    style={{ backgroundColor: BRAND }}
                  >
                    Ir a la app
                  </button>
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut() }}
                  className="border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition text-sm"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="border border-gray-300 hover:border-gray-900 px-5 py-2.5 rounded-2xl transition text-sm">
                    Iniciar sesión
                  </button>
                </Link>
                <Link href="/login?mode=register">
                  <button
                    className="text-white px-6 py-3 rounded-2xl font-semibold transition hover:scale-105 text-sm"
                    style={{ backgroundColor: BRAND }}
                  >
                    Prueba gratis 7 días
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BRAND_SOFT}, #ffffff)` }} />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: BRAND_SOFT }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 mb-10 border"
            style={{ backgroundColor: BRAND_SOFT, borderColor: BRAND_SOFT }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND }} />
            <span className="text-sm font-medium" style={{ color: BRAND_DARK }}>
              Plataforma Six Sigma completa
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none max-w-6xl mx-auto">
            Tus estudios Six Sigma
            <br />
            <span style={{ color: BRAND }}>de principio a fin</span>
          </h1>

          <p className="mt-10 text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Todo el ciclo DMAIC en un único software: capability, cartas de control,
            tests de hipótesis y análisis de normalidad. Sin instalaciones, sin licencias caras
            y con toda la potencia estadística que necesitas.
          </p>

          <div className="flex flex-wrap justify-center gap-5 mt-14">
            <Link href="/login?mode=register">
              <button
                className="text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition"
                style={{ backgroundColor: BRAND }}
              >
                Empieza tu prueba gratis de 7 días
              </button>
            </Link>
            <Link
              href="#videos"
              className="border border-gray-300 hover:border-gray-900 px-10 py-5 rounded-2xl text-lg transition"
            >
              Ver demostraciones
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            Sin tarjeta de crédito · Acceso completo durante 7 días
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            {[
              ['50+', 'Herramientas estadísticas'],
              ['DMAIC', 'Flujo Six Sigma completo'],
              ['Cloud', 'Sin instalar nada'],
            ].map(([big, small]) => (
              <div key={big} className="bg-white border shadow-sm rounded-3xl p-8">
                <div className="text-5xl font-bold mb-4" style={{ color: BRAND }}>{big}</div>
                <div className="text-gray-600 text-lg">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Diseñado para equipos de calidad
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pensado para profesionales Lean Six Sigma que necesitan resultados fiables
              sin pelearse con menús interminables.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['🎯', 'Guiado por DMAIC', 'Las herramientas se organizan por las fases Definir, Medir, Analizar, Mejorar y Controlar, no en menús estadísticos genéricos.'],
              ['☁️', 'En la nube', 'Trabaja desde cualquier navegador. Sin instalaciones, sin licencias por equipo y con tus estudios siempre disponibles.'],
              ['⚡', 'Flujo más rápido', 'Genera capability, cartas de control y tests en segundos, con informes listos para presentar.'],
            ].map(([icon, title, text]) => (
              <div key={title} className="bg-white border rounded-3xl p-10 shadow-sm hover:shadow-lg transition">
                <div className="text-5xl mb-6">{icon}</div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOFTWARE PREVIEW */}
      <section className="px-6 py-28" style={{ background: `linear-gradient(to bottom, #ffffff, ${BRAND_SOFT})` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Análisis estadístico profesional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Informes Six Sigma y capability de proceso con la calidad que esperas
              de una herramienta profesional.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {[
              ['/images/graphical-summary.png', 'Resumen gráfico', 'Histogramas, curvas de densidad, intervalos de confianza y análisis de normalidad de forma automática.'],
              ['/images/capability-test.png', 'Capacidad de proceso', 'Cp, Cpk, PPM y nivel sigma calculados al instante desde tus datos de producción.'],
              ['/images/pareto.png', 'Análisis de Pareto', 'Identifica las causas críticas y prioriza las mejoras del proceso.'],
              ['/images/two-sample-t-test.png', 'Tests de hipótesis', 'Compara poblaciones y valida mejoras del proceso con contrastes estadísticos.'],
              ['/images/imr.png', 'Cartas de control I-MR', 'Monitoriza la estabilidad del proceso y detecta causas especiales.'],
              ['/images/normality-test.png', 'Test de normalidad', 'Valida supuestos estadísticos con el análisis de Anderson-Darling.'],
            ].map(([src, title, text]) => (
              <div key={title} className="group bg-white rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl transition duration-300">
                <Image src={src} alt={title} width={800} height={500} className="w-full transition duration-500 group-hover:scale-[1.01]" />
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DMAIC WORKFLOW */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Construido en torno a DMAIC</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              A diferencia del software estadístico tradicional, las herramientas se organizan
              según la metodología Lean Six Sigma, facilitando cada proyecto desde Definir hasta Controlar.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {[
              ['FASE 1', 'Definir', ['Diagrama de Pareto', 'Muestreo aleatorio']],
              ['FASE 2', 'Medir', ['Resumen gráfico', 'Test de normalidad', 'Capability', 'Gage R&R', 'Acuerdo de atributos', 'Histogramas']],
              ['FASE 3', 'Analizar', ['Tests de hipótesis', 'Multi-Vari', 'Análisis causa raíz']],
              ['FASE 4', 'Mejorar', ['DOE (próximamente)', 'Optimización']],
              ['FASE 5', 'Controlar', ['Cartas I-MR', 'Monitorización SPC', 'Planes de control']],
            ].map(([phase, title, items]) => (
              <div key={title as string} className="rounded-3xl p-8 border" style={{ backgroundColor: BRAND_SOFT, borderColor: '#cfe6dd' }}>
                <div className="text-sm font-semibold mb-3" style={{ color: BRAND_DARK }}>{phase}</div>
                <h3 className="text-3xl font-bold mb-6">{title}</h3>
                <ul className="space-y-3 text-gray-700">
                  {(items as string[]).map((i) => <li key={i}>• {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="features" className="px-6 py-28" style={{ backgroundColor: BRAND_SOFT }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">La misma potencia, mucho más simple</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Toda la potencia estadística del software de escritorio tradicional,
              pero en la nube, en español y organizado por el flujo DMAIC.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl overflow-hidden shadow-lg">
              <thead>
                <tr className="border-b" style={{ backgroundColor: BRAND, color: 'white' }}>
                  <th className="text-left p-8 text-xl">Característica</th>
                  <th className="p-8 text-xl">{PRODUCT_NAME}</th>
                  <th className="p-8 text-xl">Software estadístico tradicional</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Organización por DMAIC', true, false],
                  ['100% en la nube (sin instalar)', true, false],
                  ['Interfaz en español', true, false],
                  ['Prueba gratuita sin tarjeta', true, false],
                  ['Análisis de capability', true, true],
                  ['Cartas de control', true, true],
                  ['Tests de hipótesis', true, true],
                  ['DOE', 'Próximamente', true],
                ].map(([feat, us, them]) => (
                  <tr key={feat as string} className="border-b">
                    <td className="p-6 font-medium">{feat}</td>
                    <td className="p-6 text-center">
                      {us === true ? <span style={{ color: BRAND }}>✓</span> : us === false ? '✗' : <span className="text-sm text-gray-500">{us}</span>}
                    </td>
                    <td className="p-6 text-center">
                      {them === true ? '✓' : them === false ? '✗' : <span className="text-sm text-gray-500">{them}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="px-6 py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Vídeos de formación</h2>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {['define', 'measure', 'analyze', 'improve', 'control'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 rounded-2xl capitalize transition"
                style={
                  activeTab === tab
                    ? { backgroundColor: BRAND, color: 'white' }
                    : { backgroundColor: '#f3f4f6', color: '#111827' }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {videos[activeTab as keyof typeof videos].length > 0 ? (
              videos[activeTab as keyof typeof videos].map((video) => (
                <div key={video.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border">
                  <YouTubeFacade id={video.id} title={video.title} />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{video.title}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 text-gray-500 text-xl">Próximamente</div>
            )}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-28" style={{ backgroundColor: BRAND_SOFT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Empieza gratis hoy</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Prueba todas las funciones durante 7 días. Sin tarjeta de crédito y sin compromiso.
          </p>

          <div className="bg-white rounded-3xl border shadow-2xl p-12 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6" style={{ backgroundColor: BRAND_SOFT }}>
              <span className="text-sm font-semibold" style={{ color: BRAND_DARK }}>
                Prueba gratuita
              </span>
            </div>

            <div className="mb-2">
              <span className="text-6xl font-bold" style={{ color: BRAND }}>7</span>
              <span className="text-2xl text-gray-600"> días gratis</span>
            </div>
            <p className="text-gray-500 mb-8">Acceso completo a toda la plataforma</p>

            <ul className="text-left space-y-4 mb-10">
              {[
                'Todas las herramientas DMAIC',
                'Estudios de capability ilimitados',
                'Cartas de control y tests de hipótesis',
                'Informes listos para presentar',
                'Sin instalación, 100% en la nube',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg" style={{ color: BRAND }}>✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/login?mode=register">
              <button
                className="w-full text-white px-8 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition"
                style={{ backgroundColor: BRAND }}
              >
                Crear cuenta y empezar
              </button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Sin tarjeta · Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-28 text-white" style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            ¿Listo para tu próximo proyecto Six Sigma?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
            Únete a los profesionales de calidad que ya realizan sus estudios de principio a fin.
          </p>
          <Link href="/login?mode=register">
            <button className="bg-white px-12 py-5 rounded-2xl text-lg font-semibold hover:scale-105 transition" style={{ color: BRAND_DARK }}>
              Empieza tu prueba gratis de 7 días
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-16 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold"
                style={{ backgroundColor: BRAND }}
              >
                6σ
              </div>
              <span className="font-bold text-lg text-white">{PRODUCT_NAME}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#features" className="hover:text-white transition">Funciones</a>
              <a href="#videos" className="hover:text-white transition">Vídeos</a>
              <a href="#pricing" className="hover:text-white transition">Precios</a>
              <Link href="/contact" className="hover:text-white transition">Contacto</Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
            © {new Date().getFullYear()} {PRODUCT_NAME}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  )
}
