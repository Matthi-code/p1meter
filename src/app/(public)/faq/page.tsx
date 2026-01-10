'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Zap, HelpCircle, Loader2 } from 'lucide-react'

type FAQItem = {
  id: string
  question: string
  answer: string
  category: string
}

// Fallback data in case database is not yet set up
const fallbackItems: FAQItem[] = [
  {
    id: '1',
    category: 'Algemeen',
    question: 'Wat is een p1Meter?',
    answer:
      'De p1Meter van HomeWizard is een slimme energiemeter die je aansluit op de P1-poort van je slimme meter. Hiermee kun je realtime je stroom- en gasverbruik monitoren via de HomeWizard app op je smartphone.',
  },
  {
    id: '2',
    category: 'Algemeen',
    question: 'Wat zijn de voordelen van een p1Meter?',
    answer:
      'Met een p1Meter krijg je direct inzicht in je energieverbruik. Je ziet precies hoeveel stroom je op dit moment verbruikt, kunt energievreters opsporen en bewuster omgaan met energie. Dit kan flink besparen op je energierekening.',
  },
  {
    id: '3',
    category: 'Installatie',
    question: 'Hoe werkt de installatie?',
    answer:
      'Onze Energie Buddy komt bij je langs, sluit de p1Meter aan op de P1-poort van je slimme meter, en configureert de WiFi-verbinding. Daarna helpt de Energie Buddy je met het instellen van de HomeWizard app. De hele installatie duurt ongeveer 15-30 minuten.',
  },
]

export default function FAQPage() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openItems, setOpenItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const response = await fetch('/api/cms/faq')
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          // Only show active items
          const activeItems = data.items.filter((item: FAQItem & { active: boolean }) => item.active !== false)
          setFaqItems(activeItems)
          // Set first category as active
          const categories = [...new Set(activeItems.map((item: FAQItem) => item.category))]
          if (categories.length > 0) {
            setActiveCategory(categories[0] as string)
          }
        } else {
          // Use fallback data
          setFaqItems(fallbackItems)
          setActiveCategory('Algemeen')
        }
      } catch (error) {
        console.error('Error fetching FAQ:', error)
        setFaqItems(fallbackItems)
        setActiveCategory('Algemeen')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFAQ()
  }, [])

  function toggleItem(id: string) {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const categories = [...new Set(faqItems.map((item) => item.category))]
  const filteredItems = faqItems.filter((item) => item.category === activeCategory)

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

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
          {filteredItems.map((item) => {
            const isOpen = openItems.includes(item.id)

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
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
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
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
