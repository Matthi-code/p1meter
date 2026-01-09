'use client'

import { useState, useRef } from 'react'
import {
  Zap,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Cable,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Smartphone,
  X,
  Loader2
} from 'lucide-react'
import { mockSmartMeters } from '@/lib/mock-data'
import type { SmartMeter } from '@/types/database'

type ChecklistItem = {
  id: string
  label: string
  checked: boolean
}

const initialChecklist: ChecklistItem[] = [
  { id: 'p1_found', label: 'P1-poort gevonden op slimme meter', checked: false },
  { id: 'adapter_check', label: 'USB-C adapter gecontroleerd (indien nodig)', checked: false },
  { id: 'p1_connected', label: 'p1Meter aangesloten op P1-poort', checked: false },
  { id: 'led_green', label: 'LED knippert groen', checked: false },
  { id: 'wifi_connected', label: 'p1Meter verbonden met WiFi', checked: false },
  { id: 'app_data', label: 'Data zichtbaar in HomeWizard app', checked: false },
  { id: 'customer_shown', label: 'Klant getoond hoe app werkt', checked: false },
]

export default function InstallerInstructionsPage() {
  const [darkMode, setDarkMode] = useState(true)
  const [checklist, setChecklist] = useState(initialChecklist)
  const [expandedSection, setExpandedSection] = useState<string | null>('meter')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [detectedMeter, setDetectedMeter] = useState<SmartMeter | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  const completedCount = checklist.filter(item => item.checked).length
  const allCompleted = completedCount === checklist.length

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result as string)
      analyzeMeter()
    }
    reader.readAsDataURL(file)
  }

  const analyzeMeter = () => {
    setAnalyzing(true)
    setDetectedMeter(null)

    // Simulate AI analysis - in production zou dit Claude Vision API aanroepen
    setTimeout(() => {
      // Random meter selecteren voor demo
      const randomMeter = mockSmartMeters[Math.floor(Math.random() * mockSmartMeters.length)]
      setDetectedMeter(randomMeter)
      setAnalyzing(false)
    }, 2000)
  }

  const clearImage = () => {
    setUploadedImage(null)
    setDetectedMeter(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white'
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-600'
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors`}>
      {/* Header */}
      <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-10`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">p1Meter Installatie</h1>
                <p className={`text-xs ${textMuted}`}>Instructies voor Energie Buddies</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Voortgang</span>
            <span className={textMuted}>{completedCount}/{checklist.length}</span>
          </div>
          <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all ${allCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${(completedCount / checklist.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Meter Herkenning */}
        <div className={`${cardBg} rounded-xl ${borderColor} border overflow-hidden`}>
          <button
            onClick={() => toggleSection('meter')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Camera className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-semibold">Meter Herkenning</span>
            </div>
            {expandedSection === 'meter' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'meter' && (
            <div className={`px-4 pb-4 border-t ${borderColor}`}>
              <p className={`mt-4 text-sm ${textMuted}`}>
                Upload een foto van de slimme meter om te bepalen of een USB-C adapter nodig is.
              </p>

              {!uploadedImage ? (
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="meter-upload"
                  />
                  <label
                    htmlFor="meter-upload"
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${borderColor} rounded-xl cursor-pointer hover:border-blue-500 transition-colors`}
                  >
                    <Upload className={`h-10 w-10 ${textMuted} mb-2`} />
                    <span className="font-medium">Foto uploaden</span>
                    <span className={`text-sm ${textMuted}`}>of maak een foto</span>
                  </label>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded meter"
                      className="w-full rounded-xl"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {analyzing ? (
                    <div className={`flex items-center justify-center gap-3 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl`}>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span>Meter analyseren...</span>
                    </div>
                  ) : detectedMeter && (
                    <div className={`p-4 rounded-xl ${detectedMeter.needs_adapter ? (darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200') : (darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200')} border`}>
                      <div className="flex items-start gap-3">
                        {detectedMeter.needs_adapter ? (
                          <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">
                            {detectedMeter.brand} {detectedMeter.model}
                          </p>
                          <p className={`text-sm ${textMuted}`}>
                            SMR versie: {detectedMeter.smr_version}
                          </p>
                          <p className={`mt-2 text-sm font-medium ${detectedMeter.needs_adapter ? 'text-yellow-600' : 'text-green-600'}`}>
                            {detectedMeter.needs_adapter
                              ? 'USB-C adapter VEREIST'
                              : 'Geen adapter nodig'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ondersteunde meters */}
              <div className="mt-6">
                <h3 className={`text-sm font-medium ${textMuted} mb-3`}>Ondersteunde meters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mockSmartMeters.map(meter => (
                    <div
                      key={meter.id}
                      className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} text-sm`}
                    >
                      <p className="font-medium">{meter.brand}</p>
                      <p className={textMuted}>{meter.model}</p>
                      <p className={`text-xs mt-1 ${meter.needs_adapter ? 'text-yellow-500' : 'text-green-500'}`}>
                        {meter.needs_adapter ? 'Adapter nodig' : 'Direct aansluiten'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Installatie Stappen */}
        <div className={`${cardBg} rounded-xl ${borderColor} border overflow-hidden`}>
          <button
            onClick={() => toggleSection('steps')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <Cable className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-semibold">Installatie Stappen</span>
            </div>
            {expandedSection === 'steps' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'steps' && (
            <div className={`px-4 pb-4 border-t ${borderColor}`}>
              <ol className="mt-4 space-y-4">
                <li className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center font-bold text-blue-500`}>1</span>
                  <div>
                    <p className="font-medium">Zoek de P1-poort</p>
                    <p className={`text-sm ${textMuted}`}>
                      De P1-poort bevindt zich meestal aan de onderkant of zijkant van de slimme meter.
                      Het is een RJ12 aansluiting (vergelijkbaar met telefoonaansluiting).
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center font-bold text-blue-500`}>2</span>
                  <div>
                    <p className="font-medium">Controleer adapter behoefte</p>
                    <p className={`text-sm ${textMuted}`}>
                      SMR 5.0 en nieuwer: direct aansluiten. SMR 4.x en ouder: USB-C adapter vereist.
                      Gebruik de meter herkenning hierboven voor advies.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center font-bold text-blue-500`}>3</span>
                  <div>
                    <p className="font-medium">Sluit de p1Meter aan</p>
                    <p className={`text-sm ${textMuted}`}>
                      Steek de p1Meter (met of zonder adapter) in de P1-poort.
                      De LED zal gaan knipperen.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center font-bold text-blue-500`}>4</span>
                  <div>
                    <p className="font-medium">Verbind met WiFi</p>
                    <p className={`text-sm ${textMuted}`}>
                      Open de HomeWizard app en volg de instructies om de p1Meter te koppelen
                      met het WiFi netwerk van de klant.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center font-bold text-blue-500`}>5</span>
                  <div>
                    <p className="font-medium">Controleer werking</p>
                    <p className={`text-sm ${textMuted}`}>
                      Wacht tot de LED groen knippert en controleer in de HomeWizard app
                      of de actuele verbruiksdata zichtbaar is.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* WiFi Troubleshooting */}
        <div className={`${cardBg} rounded-xl ${borderColor} border overflow-hidden`}>
          <button
            onClick={() => toggleSection('wifi')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <Wifi className="h-5 w-5 text-purple-500" />
              </div>
              <span className="font-semibold">WiFi Problemen</span>
            </div>
            {expandedSection === 'wifi' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'wifi' && (
            <div className={`px-4 pb-4 border-t ${borderColor}`}>
              <div className="mt-4 space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className="font-medium">LED knippert rood?</p>
                  <ul className={`mt-2 text-sm ${textMuted} list-disc list-inside space-y-1`}>
                    <li>Controleer of WiFi bereikbaar is bij de meterkast</li>
                    <li>Reset de p1Meter: houd knop 10 sec ingedrukt</li>
                    <li>Gebruik 2.4GHz netwerk (geen 5GHz)</li>
                    <li>Controleer of wachtwoord correct is</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className="font-medium">Geen verbinding mogelijk?</p>
                  <ul className={`mt-2 text-sm ${textMuted} list-disc list-inside space-y-1`}>
                    <li>Meterkast vaak in kelder = slecht bereik</li>
                    <li>Adviseer WiFi repeater/extender</li>
                    <li>Powerline adapter als alternatief</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className={`${cardBg} rounded-xl ${borderColor} border overflow-hidden`}>
          <button
            onClick={() => toggleSection('checklist')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${allCompleted ? (darkMode ? 'bg-green-900/50' : 'bg-green-100') : (darkMode ? 'bg-orange-900/50' : 'bg-orange-100')}`}>
                <CheckCircle2 className={`h-5 w-5 ${allCompleted ? 'text-green-500' : 'text-orange-500'}`} />
              </div>
              <span className="font-semibold">Oplevering Checklist</span>
            </div>
            {expandedSection === 'checklist' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'checklist' && (
            <div className={`px-4 pb-4 border-t ${borderColor}`}>
              <ul className="mt-4 space-y-3">
                {checklist.map(item => (
                  <li key={item.id}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={item.checked ? 'line-through opacity-60' : ''}>
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              {allCompleted && (
                <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-600">Installatie voltooid!</p>
                      <p className={`text-sm ${textMuted}`}>
                        Alle stappen zijn afgerond. De klant kan nu de p1Meter gebruiken.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Klant Instructies */}
        <div className={`${cardBg} rounded-xl ${borderColor} border overflow-hidden`}>
          <button
            onClick={() => toggleSection('customer')}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-cyan-900/50' : 'bg-cyan-100'}`}>
                <Smartphone className="h-5 w-5 text-cyan-500" />
              </div>
              <span className="font-semibold">Klant Instructies</span>
            </div>
            {expandedSection === 'customer' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {expandedSection === 'customer' && (
            <div className={`px-4 pb-4 border-t ${borderColor}`}>
              <p className={`mt-4 text-sm ${textMuted}`}>
                Deel deze link met de klant voor instructies over het gebruik van de HomeWizard app:
              </p>
              <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}>
                <code className="text-sm text-blue-500 truncate">
                  /instructions/homeowner
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.origin + '/instructions/homeowner')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kopieer
                </button>
              </div>
              <p className={`mt-4 text-sm ${textMuted}`}>
                Of scan de QR-code op de verpakking van de p1Meter.
              </p>
            </div>
          )}
        </div>

        {/* HomeWizard Link */}
        <a
          href="https://www.homewizard.com/p1-meter/"
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${cardBg} rounded-xl p-4 ${borderColor} border hover:border-blue-500 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">HomeWizard Website</p>
                <p className={`text-sm ${textMuted}`}>Officiële productpagina en documentatie</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 -rotate-90 ${textMuted}`} />
          </div>
        </a>
      </main>
    </div>
  )
}
