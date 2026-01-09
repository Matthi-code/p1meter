'use client'

import { useState } from 'react'
import { ChevronDown, Zap, HelpCircle } from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  // Algemeen
  {
    category: 'Algemeen',
    question: 'Wat is een p1Meter?',
    answer:
      'De p1Meter van HomeWizard is een slimme energiemeter die je aansluit op de P1-poort van je slimme meter. Hiermee kun je realtime je stroom- en gasverbruik monitoren via de HomeWizard app op je smartphone.',
  },
  {
    category: 'Algemeen',
    question: 'Wat zijn de voordelen van een p1Meter?',
    answer:
      'Met een p1Meter krijg je direct inzicht in je energieverbruik. Je ziet precies hoeveel stroom je op dit moment verbruikt, kunt energievreters opsporen en bewuster omgaan met energie. Dit kan flink besparen op je energierekening.',
  },
  {
    category: 'Algemeen',
    question: 'Wat kost de installatie?',
    answer:
      'De kosten voor installatie zijn afhankelijk van je situatie. Neem contact met ons op voor een vrijblijvende offerte. De p1Meter zelf kost rond de €25-30 en is een eenmalige aanschaf zonder abonnementskosten.',
  },

  // Installatie
  {
    category: 'Installatie',
    question: 'Hoe werkt de installatie?',
    answer:
      'Onze Energie Buddy komt bij je langs, sluit de p1Meter aan op de P1-poort van je slimme meter, en configureert de WiFi-verbinding. Daarna helpt de Energie Buddy je met het instellen van de HomeWizard app. De hele installatie duurt ongeveer 15-30 minuten.',
  },
  {
    category: 'Installatie',
    question: 'Werkt de p1Meter met mijn slimme meter?',
    answer:
      'De p1Meter werkt met alle DSMR 4.0+ slimme meters in Nederland. Dit zijn meters van merken zoals Landis+Gyr, Kaifa, Iskra, Sagemcom en Kamstrup. Bij twijfel controleren onze Energie Buddies de compatibiliteit voor installatie.',
  },
  {
    category: 'Installatie',
    question: 'Heb ik een adapter nodig?',
    answer:
      'Dit hangt af van je slimme meter. Meters met SMR 5.0 of nieuwer hebben geen adapter nodig - de p1Meter kan direct worden aangesloten. Bij oudere meters (SMR 4.x en eerder) is een USB-C adapter vereist. Onze Energie Buddy brengt de juiste adapter mee indien nodig.',
  },
  {
    category: 'Installatie',
    question: 'Waar zit de P1-poort op mijn meter?',
    answer:
      'De P1-poort zit meestal aan de onderkant of zijkant van je slimme meter. Het is een kleine poort met een afdekkapje. Onze Energie Buddy vindt de juiste aansluiting voor je.',
  },

  // App & Gebruik
  {
    category: 'App & Gebruik',
    question: 'Waar kan ik de HomeWizard app downloaden?',
    answer:
      'De HomeWizard app is gratis beschikbaar in de Apple App Store (voor iPhone/iPad) en Google Play Store (voor Android). Zoek op "HomeWizard Energy" om de app te vinden.',
  },
  {
    category: 'App & Gebruik',
    question: 'Moet ik een account aanmaken?',
    answer:
      'Ja, je hebt een gratis HomeWizard account nodig om de app te gebruiken. Dit account kun je aanmaken in de app zelf. Met dit account kun je de p1Meter koppelen en je verbruik bekijken.',
  },
  {
    category: 'App & Gebruik',
    question: 'Kan ik meerdere p1Meters aan mijn account koppelen?',
    answer:
      'Ja, je kunt meerdere p1Meters aan je HomeWizard account koppelen. Dit is handig als je bijvoorbeeld een tweede woning hebt of je bedrijfspand ook wilt monitoren.',
  },
  {
    category: 'App & Gebruik',
    question: 'Werkt de p1Meter ook zonder internet?',
    answer:
      'De p1Meter heeft een WiFi-verbinding nodig om de data naar de app te sturen. Zonder internet kun je de gegevens niet bekijken in de app. De meter blijft wel meten, en de data wordt gesynchroniseerd zodra de verbinding weer beschikbaar is.',
  },

  // Problemen
  {
    category: 'Problemen',
    question: 'De p1Meter toont geen data, wat nu?',
    answer:
      'Controleer eerst of de LED op de p1Meter groen knippert - dit betekent dat er verbinding is. Zo niet, controleer de WiFi-verbinding en probeer de p1Meter opnieuw te configureren via de app. Bij aanhoudende problemen kun je contact opnemen met onze support.',
  },
  {
    category: 'Problemen',
    question: 'Mijn gasverbruik wordt niet getoond',
    answer:
      'Het gasverbruik wordt door de slimme meter alleen elk uur bijgewerkt, niet realtime zoals stroom. Als je na een uur nog steeds geen gasdata ziet, controleer dan of je gasmeter ook "slim" is en gekoppeld aan je elektriciteitsmeter.',
  },
  {
    category: 'Problemen',
    question: 'De p1Meter verbindt niet met WiFi',
    answer:
      'Zorg dat je 2.4GHz WiFi gebruikt (5GHz wordt niet ondersteund). Controleer of het WiFi-wachtwoord correct is ingevoerd. De p1Meter moet binnen bereik van je router zijn. Herstart eventueel je router en probeer opnieuw.',
  },
]

// Groepeer FAQ items per categorie
const categories = [...new Set(faqItems.map((item) => item.category))]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('Algemeen')

  function toggleItem(index: number) {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const filteredItems = faqItems.filter((item) => item.category === activeCategory)

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Hulp & Ondersteuning
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Veelgestelde vragen
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Vind antwoorden op de meest gestelde vragen over de p1Meter
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const globalIndex = faqItems.indexOf(item)
            const isOpen = openItems.includes(globalIndex)

            return (
              <div
                key={globalIndex}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(globalIndex)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Vraag niet gevonden?
          </h3>
          <p className="text-slate-600 mb-6">
            Neem contact met ons op, we helpen je graag verder.
          </p>
          <a
            href="mailto:info@p1meter-installaties.nl"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Contact opnemen
          </a>
        </div>
      </div>
    </div>
  )
}
