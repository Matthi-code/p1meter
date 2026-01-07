import Link from 'next/link'
import {
  Zap,
  Gauge,
  Smartphone,
  Wrench,
  CheckCircle,
  ArrowRight,
  Activity,
  Wifi,
  Euro,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              HomeWizard p1Meter Partner
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Realtime inzicht in je{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                energieverbruik
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              De p1Meter van HomeWizard geeft je direct inzicht in je stroom- en gasverbruik.
              Wij verzorgen de professionele installatie bij jou thuis.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Inloggen
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-xl text-lg font-medium hover:bg-slate-50 transition-colors border border-slate-200"
              >
                Meer informatie
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Waarom een p1Meter?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Ontdek de voordelen van realtime energiemonitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Realtime monitoring
              </h3>
              <p className="text-slate-600">
                Zie direct je actuele verbruik van stroom en gas.
                Ontdek welke apparaten de meeste energie gebruiken.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <Euro className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Bespaar op je energiekosten
              </h3>
              <p className="text-slate-600">
                Door inzicht in je verbruik kun je bewuster omgaan met energie
                en flink besparen op je maandelijkse kosten.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                HomeWizard app
              </h3>
              <p className="text-slate-600">
                Bekijk je verbruik overal via de gratis HomeWizard app.
                Beschikbaar voor iOS en Android.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Hoe werkt het?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              In drie simpele stappen naar realtime energie-inzicht
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute top-0 left-8 w-px h-full bg-blue-200 md:hidden" />
              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
                  1
                </div>
                <div className="md:mt-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Afspraak maken
                  </h3>
                  <p className="text-slate-600">
                    Plan een afspraak in. Onze monteur komt langs op een moment dat jou uitkomt.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute top-0 left-8 w-px h-full bg-blue-200 md:hidden" />
              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
                  2
                </div>
                <div className="md:mt-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Installatie
                  </h3>
                  <p className="text-slate-600">
                    De monteur installeert de p1Meter op je slimme meter en configureert de WiFi-verbinding.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
                  3
                </div>
                <div className="md:mt-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Direct inzicht
                  </h3>
                  <p className="text-slate-600">
                    Open de HomeWizard app en zie direct je verbruik. Zo simpel is het!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Compatibel met alle slimme meters
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                De p1Meter werkt met alle DSMR 4.0+ slimme meters in Nederland.
                Onze monteurs controleren de compatibiliteit bij installatie.
              </p>

              <div className="space-y-4">
                {[
                  'Landis+Gyr',
                  'Kaifa',
                  'Iskra',
                  'Sagemcom',
                  'Kamstrup',
                ].map((brand) => (
                  <div key={brand} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700">{brand}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <Gauge className="h-8 w-8 text-blue-600 mb-4" />
                  <h4 className="font-semibold text-slate-900">Stroom</h4>
                  <p className="text-sm text-slate-500 mt-1">Realtime kW verbruik</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <Activity className="h-8 w-8 text-teal-600 mb-4" />
                  <h4 className="font-semibold text-slate-900">Gas</h4>
                  <p className="text-sm text-slate-500 mt-1">Dagelijks m³ verbruik</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <Wifi className="h-8 w-8 text-violet-600 mb-4" />
                  <h4 className="font-semibold text-slate-900">WiFi</h4>
                  <p className="text-sm text-slate-500 mt-1">Draadloze verbinding</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <Wrench className="h-8 w-8 text-amber-600 mb-4" />
                  <h4 className="font-semibold text-slate-900">Installatie</h4>
                  <p className="text-sm text-slate-500 mt-1">Door onze monteurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar om te starten?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Log in om je afspraken te bekijken of neem contact met ons op voor meer informatie.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Inloggen
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl text-lg font-medium hover:bg-blue-400 transition-colors"
            >
              Veelgestelde vragen
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
