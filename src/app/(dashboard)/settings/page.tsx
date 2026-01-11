'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import {
  Settings,
  Save,
  Loader2,
  Mail,
  Phone,
  Building,
  CheckCircle,
} from 'lucide-react'

type Settings = {
  contact_email: string
  contact_phone: string
  company_name: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    contact_email: '',
    contact_phone: '',
    company_name: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.settings) {
        setSettings({
          contact_email: data.settings.contact_email || '',
          contact_phone: data.settings.contact_phone || '',
          company_name: data.settings.company_name || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave(key: keyof Settings) {
    setIsSaving(true)
    setSavedKey(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
      })

      const data = await response.json()
      if (data.success) {
        setSavedKey(key)
        setTimeout(() => setSavedKey(null), 2000)
      } else {
        alert(data.error || 'Opslaan mislukt')
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Er is een fout opgetreden')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Instellingen</h1>
        <p className="text-slate-500">Beheer algemene app-instellingen</p>
      </div>

      {/* Contact Settings */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Contactgegevens</h2>
            <p className="text-sm text-slate-500">Deze gegevens worden getoond op de website en in de FAQ</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building className="h-4 w-4 text-slate-400" />
              Bedrijfsnaam
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="input flex-1"
                placeholder="p1Meter"
              />
              <button
                onClick={() => handleSave('company_name')}
                disabled={isSaving}
                className="btn btn-primary"
              >
                {savedKey === 'company_name' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Mail className="h-4 w-4 text-slate-400" />
              E-mailadres klantenservice
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="input flex-1"
                placeholder="info@voorbeeld.nl"
              />
              <button
                onClick={() => handleSave('contact_email')}
                disabled={isSaving}
                className="btn btn-primary"
              >
                {savedKey === 'contact_email' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dit e-mailadres wordt getoond in de FAQ bij &quot;Hoe bereik ik de klantenservice?&quot;
            </p>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Phone className="h-4 w-4 text-slate-400" />
              Telefoonnummer klantenservice
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="input flex-1"
                placeholder="088 - 123 4567"
              />
              <button
                onClick={() => handleSave('contact_phone')}
                disabled={isSaving}
                className="btn btn-primary"
              >
                {savedKey === 'contact_phone' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Wijzigingen in de contactgegevens worden direct doorgevoerd op de FAQ pagina.
          Update de FAQ-vraag &quot;Hoe bereik ik de klantenservice?&quot; om de juiste tekst te tonen.
        </p>
      </div>
    </div>
  )
}
