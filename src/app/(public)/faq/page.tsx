'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Zap, HelpCircle, Loader2, Send, CheckCircle } from 'lucide-react'

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

        {/* Question Suggestion Form */}
        <QuestionSuggestionForm />
      </div>
    </div>
  )
}

// Question Suggestion Form Component
function QuestionSuggestionForm() {
  const [question, setQuestion] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/cms/faq/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          email: email.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        setQuestion('')
        setEmail('')
      } else {
        setError(data.error || 'Er ging iets mis. Probeer het opnieuw.')
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="mt-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Bedankt voor je vraag!
        </h3>
        <p className="text-slate-600 mb-6">
          We hebben je vraag ontvangen en zullen deze zo snel mogelijk beantwoorden.
          {email && ' Je ontvangt een e-mail zodra het antwoord beschikbaar is.'}
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-emerald-600 font-medium hover:text-emerald-700"
        >
          Nog een vraag stellen
        </button>
      </div>
    )
  }

  return (
    <div className="mt-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Vraag niet gevonden?
          </h3>
          <p className="text-slate-600">
            Stel je vraag hieronder en we voegen het antwoord toe aan onze FAQ.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-slate-700 mb-1.5">
              Je vraag *
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Bijv. Hoe lang duurt het voordat ik mijn verbruik kan zien?"
              rows={3}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              E-mailadres <span className="text-slate-400 font-normal">(optioneel)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@voorbeeld.nl"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Laat je e-mail achter om een bericht te ontvangen zodra je vraag beantwoord is.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !question.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Versturen...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Vraag insturen
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
