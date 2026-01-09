import { Zap, Users, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react'

export default function OverPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Over p1Meter Installaties
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Wij verzorgen de professionele installatie van p1Meters bij huiseigenaren door heel Nederland.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 md:p-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Onze missie</h2>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            Wij geloven dat iedereen inzicht verdient in zijn energieverbruik. Door de installatie van p1Meters
            zo makkelijk mogelijk te maken, helpen we huiseigenaren bewuster om te gaan met energie en te besparen
            op hun energiekosten.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Wat ons kenmerkt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Ervaren Energie Buddies</h3>
              <p className="text-slate-600 text-sm">
                Ons team bestaat uit ervaren Energie Buddies die zijn getraind in de installatie van slimme energie-apparatuur.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Betrouwbaar</h3>
              <p className="text-slate-600 text-sm">
                We komen onze afspraken na en zorgen voor een zorgvuldige installatie met aandacht voor kwaliteit.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Snel & flexibel</h3>
              <p className="text-slate-600 text-sm">
                Binnen enkele dagen een afspraak en flexibele tijden die bij jouw schema passen.
              </p>
            </div>
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
                <p className="text-slate-400 text-sm">
                  Energiestraat 123<br />
                  1234 AB Amsterdam
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Telefoon</h4>
                <p className="text-slate-400 text-sm">
                  088 - 123 4567<br />
                  Ma-Vr 09:00 - 17:00
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
                  info@p1meter-installaties.nl
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
