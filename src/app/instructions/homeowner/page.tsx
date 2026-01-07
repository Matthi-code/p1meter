'use client'

import { useState } from 'react'
import {
  Zap,
  Smartphone,
  Wifi,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  PlayCircle
} from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Waarom zie ik geen data in de app?',
    answer: 'Controleer of de LED op de p1Meter groen knippert. Als de LED rood is, is er een verbindingsprobleem. Zorg dat de p1Meter binnen WiFi bereik is en herstart eventueel de app.'
  },
  {
    question: 'Hoe reset ik de p1Meter?',
    answer: 'Houd de knop op de p1Meter 10 seconden ingedrukt totdat de LED snel begint te knipperen. De meter is nu gereset en kan opnieuw worden gekoppeld via de app.'
  },
  {
    question: 'Kan ik de p1Meter met meerdere apparaten gebruiken?',
    answer: 'Ja! Je kunt de HomeWizard app op meerdere telefoons installeren en met hetzelfde account inloggen om de data te bekijken.'
  },
  {
    question: 'Hoe nauwkeurig zijn de metingen?',
    answer: 'De p1Meter leest de officiële data van je slimme meter uit. De nauwkeurigheid is gelijk aan je energierekening, tot op de watt nauwkeurig.'
  },
  {
    question: 'Werkt de p1Meter ook met zonnepanelen?',
    answer: 'Ja! De p1Meter toont zowel verbruik als teruglevering. Je ziet precies hoeveel stroom je opwekt en verbruikt.'
  },
  {
    question: 'Wat betekenen de kleuren van de LED?',
    answer: 'Groen knipperend: alles werkt goed. Blauw knipperend: setup modus. Rood: geen verbinding. Oranje: firmware update bezig.'
  },
]

export default function HomeownerInstructionsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('setup')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">p1Meter Handleiding</h1>
              <p className="text-xs text-gray-500">Aan de slag met je energie-inzicht</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Welkom bij je p1Meter!</h2>
          <p className="text-blue-100 text-sm">
            Met de p1Meter en HomeWizard app heb je altijd inzicht in je energieverbruik.
            Volg onderstaande stappen om alles in te stellen.
          </p>
        </div>

        {/* App Download */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('download')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Stap 1: Download de app</span>
            </div>
            {expandedSection === 'download' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expandedSection === 'download' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <p className="mt-4 text-sm text-gray-600">
                Download de gratis HomeWizard Energy app:
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://apps.apple.com/app/homewizard-energy/id1563622859"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>App Store</span>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.homewizard.energy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span>Google Play</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Account Setup */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('setup')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Stap 2: Account aanmaken</span>
            </div>
            {expandedSection === 'setup' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expandedSection === 'setup' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">1</span>
                  <div>
                    <p className="font-medium text-gray-900">Open de HomeWizard app</p>
                    <p className="text-sm text-gray-500">Na het downloaden en installeren</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">2</span>
                  <div>
                    <p className="font-medium text-gray-900">Tik op &quot;Account aanmaken&quot;</p>
                    <p className="text-sm text-gray-500">Of log in als je al een account hebt</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">3</span>
                  <div>
                    <p className="font-medium text-gray-900">Vul je e-mailadres in</p>
                    <p className="text-sm text-gray-500">Je ontvangt een bevestigingsmail</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">4</span>
                  <div>
                    <p className="font-medium text-gray-900">Bevestig je account</p>
                    <p className="text-sm text-gray-500">Klik op de link in de e-mail</p>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Connect p1Meter */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('connect')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Wifi className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-900">Stap 3: p1Meter koppelen</span>
            </div>
            {expandedSection === 'connect' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'connect' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> De monteur heeft de p1Meter waarschijnlijk al voor je gekoppeld.
                    Check of je data ziet in de app voordat je deze stappen doorloopt.
                  </p>
                </div>
              </div>

              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">1</span>
                  <div>
                    <p className="font-medium text-gray-900">Tik op het + icoon</p>
                    <p className="text-sm text-gray-500">Rechtsboven in de app</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">2</span>
                  <div>
                    <p className="font-medium text-gray-900">Selecteer &quot;p1Meter&quot;</p>
                    <p className="text-sm text-gray-500">Uit de lijst met apparaten</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">3</span>
                  <div>
                    <p className="font-medium text-gray-900">Verbind met WiFi</p>
                    <p className="text-sm text-gray-500">Volg de instructies om de p1Meter te verbinden met je thuisnetwerk</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">4</span>
                  <div>
                    <p className="font-medium text-gray-900">Wacht op verbinding</p>
                    <p className="text-sm text-gray-500">De LED wordt groen als alles goed is</p>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Using the App */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('usage')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-semibold text-gray-900">Stap 4: App gebruiken</span>
            </div>
            {expandedSection === 'usage' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expandedSection === 'usage' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <p className="font-medium text-gray-900">Dashboard</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Op het hoofdscherm zie je direct je huidige verbruik in Watt.
                    Groen betekent dat je stroom teruglevert (zonnepanelen).
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    <p className="font-medium text-gray-900">Grafieken</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tik op de p1Meter voor gedetailleerde grafieken per dag, week of maand.
                    Zo zie je wanneer je het meeste energie verbruikt.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-gray-600" />
                    <p className="font-medium text-gray-900">Kosten</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Stel je energietarieven in om direct te zien wat je verbruik kost.
                    Ga naar Instellingen → Tarieven.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Tutorial */}
        <a
          href="https://www.youtube.com/watch?v=homewizard-p1meter-setup"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <PlayCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Video instructie</p>
              <p className="text-sm text-gray-500">Bekijk hoe je de p1Meter installeert</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </div>
        </a>

        {/* Troubleshooting */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('trouble')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="font-semibold text-gray-900">Problemen oplossen</span>
            </div>
            {expandedSection === 'trouble' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expandedSection === 'trouble' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-medium text-red-800">Geen data zichtbaar?</p>
                  <ol className="mt-2 text-sm text-red-700 list-decimal list-inside space-y-1">
                    <li>Controleer of de LED groen knippert</li>
                    <li>Herstart de HomeWizard app</li>
                    <li>Wacht 5 minuten - data kan vertraagd zijn</li>
                    <li>Controleer je WiFi verbinding</li>
                  </ol>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="font-medium text-orange-800">LED knippert rood?</p>
                  <ol className="mt-2 text-sm text-orange-700 list-decimal list-inside space-y-1">
                    <li>De p1Meter heeft geen WiFi verbinding</li>
                    <li>Controleer of je router aan staat</li>
                    <li>Probeer de p1Meter opnieuw te koppelen</li>
                    <li>Meterkast te ver van router? Gebruik een repeater</li>
                  </ol>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="font-medium text-blue-800">p1Meter resetten</p>
                  <p className="mt-2 text-sm text-blue-700">
                    Houd de knop op de p1Meter 10 seconden ingedrukt.
                    De LED gaat snel knipperen. De meter is nu gereset en kan opnieuw worden gekoppeld.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('faq')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100">
                <HelpCircle className="h-5 w-5 text-cyan-600" />
              </div>
              <span className="font-semibold text-gray-900">Veelgestelde vragen</span>
            </div>
            {expandedSection === 'faq' ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {expandedSection === 'faq' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="mt-4 space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-3 text-sm text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="font-bold mb-2">Hulp nodig?</h3>
          <p className="text-gray-300 text-sm mb-4">
            Kom je er niet uit? Neem contact op met je installateur of bezoek de HomeWizard support pagina.
          </p>
          <a
            href="https://helpdesk.homewizard.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            HomeWizard Helpdesk
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>p1Meter is een product van HomeWizard</p>
          <a
            href="https://www.homewizard.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            www.homewizard.com
          </a>
        </div>
      </footer>
    </div>
  )
}
