'use client'

import { useState, useEffect } from 'react'
import { Zap, Users, Shield, Clock, MapPin, Phone, Mail, Loader2 } from 'lucide-react'

type OverPageContent = {
  subtitle: string
  mission: {
    title: string
    text: string
  }
  values: Array<{
    icon: string
    title: string
    text: string
  }>
  contact: {
    address: string
    phone: string
    email: string
  }
}

// Fallback content
const fallbackContent: OverPageContent = {
  subtitle: 'Wij verzorgen de professionele installatie van p1Meters bij huiseigenaren door heel Nederland.',
  mission: {
    title: 'Onze missie',
    text: 'Wij geloven dat iedereen inzicht verdient in zijn energieverbruik. Door de installatie van p1Meters zo makkelijk mogelijk te maken, helpen we huiseigenaren bewuster om te gaan met energie en te besparen op hun energiekosten.',
  },
  values: [
    {
      icon: 'users',
      title: 'Ervaren Energie Buddies',
      text: 'Ons team bestaat uit ervaren Energie Buddies die zijn getraind in de installatie van slimme energie-apparatuur.',
    },
    {
      icon: 'shield',
      title: 'Betrouwbaar',
      text: 'We komen onze afspraken na en zorgen voor een zorgvuldige installatie met aandacht voor kwaliteit.',
    },
    {
      icon: 'clock',
      title: 'Snel & flexibel',
      text: 'Binnen enkele dagen een afspraak en flexibele tijden die bij jouw schema passen.',
    },
  ],
  contact: {
    address: 'Energiestraat 123\n1234 AB Amsterdam',
    phone: '088 - 123 4567\nMa-Vr 09:00 - 17:00',
    email: 'info@p1meter-installaties.nl',
  },
}

const iconComponents: Record<string, typeof Users> = {
  users: Users,
  shield: Shield,
  clock: Clock,
}

const iconColors: Record<string, { bg: string; text: string }> = {
  users: { bg: 'bg-blue-100', text: 'text-blue-600' },
  shield: { bg: 'bg-teal-100', text: 'text-teal-600' },
  clock: { bg: 'bg-violet-100', text: 'text-violet-600' },
}

export default function OverPage() {
  const [title, setTitle] = useState('Over p1Meter Installaties')
  const [content, setContent] = useState<OverPageContent>(fallbackContent)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/cms/pages?slug=over')
        const data = await response.json()
        if (data.page) {
          setTitle(data.page.title)
          setContent({
            ...fallbackContent,
            ...data.page.content,
          })
        }
      } catch (error) {
        console.error('Error fetching page:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [])

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
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 md:p-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{content.mission.title}</h2>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
            {content.mission.text}
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Wat ons kenmerkt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.values.map((value, index) => {
              const IconComponent = iconComponents[value.icon] || Users
              const colors = iconColors[value.icon] || iconColors.users

              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-line">{value.text}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
          <h2 className="text-2xl font-bold mb-8">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Adres</h4>
                <p className="text-slate-400 text-sm whitespace-pre-line">
                  {content.contact.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Telefoon</h4>
                <p className="text-slate-400 text-sm whitespace-pre-line">
                  {content.contact.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">E-mail</h4>
                <p className="text-slate-400 text-sm">
                  {content.contact.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
