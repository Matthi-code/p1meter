'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useCustomers, useInstallations } from '@/hooks/useData'
import { useAuth } from '@/lib/auth'
import * as dataApi from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { geocodeCustomerAddress } from '@/lib/geocoding'
import { Card } from '@/components/ui'
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Map,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Users,
  Wrench,
  Copy,
  Check,
  User,
  FileText,
  Loader2,
  Camera,
  Navigation,
  ChevronRight,
} from 'lucide-react'
import type { Customer } from '@/types/supabase'

// Dynamic import for the map (disable SSR)
const CustomersMap = dynamic(() => import('@/components/CustomersMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="text-slate-400">Kaart laden...</div>
    </div>
  ),
})

export default function CustomersPage() {
  const { data: customers, isLoading, refetch } = useCustomers()
  const { data: installations } = useInstallations()
  const { hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Gefilterde klanten op basis van zoekquery
  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    if (!searchQuery.trim()) return customers

    const query = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    )
  }, [customers, searchQuery])

  // Tel installaties per klant
  function getInstallationCount(customerId: string): number {
    if (!installations) return 0
    return installations.filter((i) => i.customer_id === customerId).length
  }

  // Open modal voor nieuwe klant
  function handleAddNew() {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  // Open modal voor bewerken
  function handleEdit(customer: Customer) {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  // Verwijder klant
  async function handleDelete(customerId: string) {
    if (confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      try {
        await dataApi.deleteCustomer(customerId)
        setSelectedCustomer(null)
        refetch()
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Kon klant niet verwijderen')
      }
    }
  }

  // Opslaan klant (nieuw of bewerken)
  async function handleSave(customerData: Partial<Customer>) {
    try {
      // Automatisch geocoden als adres of postcode is ingevuld
      if (customerData.postal_code && customerData.address) {
        const coords = await geocodeCustomerAddress(
          customerData.postal_code,
          customerData.address
        )
        if (coords) {
          customerData.latitude = coords.latitude
          customerData.longitude = coords.longitude
        }
      }

      if (editingCustomer) {
        await dataApi.updateCustomer(editingCustomer.id, customerData)
        // Update selected customer if it's the one being edited
        if (selectedCustomer?.id === editingCustomer.id) {
          setSelectedCustomer({ ...selectedCustomer, ...customerData } as Customer)
        }
      } else {
        await dataApi.createCustomer(customerData as Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'portal_token'>)
      }
      setIsModalOpen(false)
      setEditingCustomer(null)
      refetch()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Kon klant niet opslaan')
    }
  }

  // Select first customer if none selected and customers are loaded
  const activeCustomer = selectedCustomer || (filteredCustomers.length > 0 ? filteredCustomers[0] : null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Klanten</h1>
          <p className="text-sm text-slate-500">{customers?.length || 0} klanten</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`btn ${showMap ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Kaart</span>
          </button>
          <button onClick={handleAddNew} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nieuwe klant</span>
          </button>
        </div>
      </div>

      {/* Map view */}
      {showMap && (
        <div className="mb-6">
          <Card padding="none" className="overflow-hidden">
            <CustomersMap
              customers={filteredCustomers}
              onSelectCustomer={(customer) => setSelectedCustomer(customer)}
            />
          </Card>
        </div>
      )}

      {/* Master-Detail Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Customer List */}
        <div className={`flex flex-col ${activeCustomer ? 'hidden lg:flex lg:w-[400px]' : 'w-full'} flex-shrink-0`}>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op naam, adres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Geen klanten gevonden</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <CustomerListItem
                    key={customer.id}
                    customer={customer}
                    isSelected={activeCustomer?.id === customer.id}
                    installationCount={getInstallationCount(customer.id)}
                    onSelect={() => setSelectedCustomer(customer)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Customer Detail */}
        {activeCustomer && (
          <div className="flex-1 min-w-0">
            <CustomerDetailPanel
              customer={activeCustomer}
              installationCount={getInstallationCount(activeCustomer.id)}
              onClose={() => setSelectedCustomer(null)}
              onEdit={() => handleEdit(activeCustomer)}
              onDelete={() => handleDelete(activeCustomer.id)}
              canDelete={hasRole(['admin'])}
              showBackButton={!!selectedCustomer}
            />
          </div>
        )}
      </div>

      {/* Klant modal */}
      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCustomer(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

/** Customer List Item */
function CustomerListItem({
  customer,
  isSelected,
  installationCount,
  onSelect,
}: {
  customer: Customer
  isSelected: boolean
  installationCount: number
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-500'
          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
        isSelected ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'
      }`}>
        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
          {customer.name}
        </p>
        <p className="text-sm text-slate-500 truncate">{customer.address}</p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={`tel:${customer.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Bellen"
        >
          <Phone className="h-4 w-4" />
        </a>
        <a
          href={`mailto:${customer.email}`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="E-mail"
        >
          <Mail className="h-4 w-4" />
        </a>
      </div>

      {/* Installation badge */}
      {installationCount > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0">
          {installationCount}
        </span>
      )}

      <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0 lg:hidden" />
    </div>
  )
}

/** Customer Detail Panel */
function CustomerDetailPanel({
  customer,
  installationCount,
  onClose,
  onEdit,
  onDelete,
  canDelete = false,
  showBackButton = false,
}: {
  customer: Customer
  installationCount: number
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canDelete?: boolean
  showBackButton?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const portalUrl = `/portal?token=${customer.portal_token}`
  const hasCoords = customer.latitude && customer.longitude

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.origin + portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header with Street View */}
      <div className="relative">
        {hasCoords ? (
          <div className="relative h-48">
            <img
              src={`https://maps.googleapis.com/maps/api/streetview?size=800x300&location=${customer.latitude},${customer.longitude}&fov=90&pitch=5&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              alt={`Straatbeeld ${customer.address}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Back button (mobile) */}
            {showBackButton && (
              <button
                onClick={onClose}
                className="lg:hidden absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            )}

            {/* Street View link */}
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${customer.latitude},${customer.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
              title="Open 360° weergave"
            >
              <Camera className="h-5 w-5 text-slate-600" />
            </a>

            {/* Customer info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-bold text-white">{customer.name}</h2>
              <p className="text-white/80 text-sm">{customer.address}, {customer.city}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-100">
            {showBackButton && (
              <button
                onClick={onClose}
                className="lg:hidden mb-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            )}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
                <p className="text-slate-500 text-sm">{customer.address}, {customer.city}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${customer.phone}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Phone className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-700">Bellen</span>
          </a>
          <a
            href={`mailto:${customer.email}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-slate-700">E-mail</span>
          </a>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-medium text-slate-700">Route</span>
            </a>
          )}
        </div>

        {/* Contact info */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Contactgegevens
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p>{customer.address}</p>
                <p>{customer.postal_code} {customer.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{installationCount}</p>
            <p className="text-xs text-slate-500">Installaties</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-500">Klant sinds</p>
            <p className="font-medium text-slate-900">{formatDate(customer.created_at)}</p>
          </div>
        </div>

        {/* Portal link */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-800">Klantportaal</h3>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-blue-200 text-slate-600 truncate">
              {typeof window !== 'undefined' ? window.location.origin + portalUrl : portalUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-lg transition-all ${
                copied
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-100'
              }`}
              title="Kopieer"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={() => window.open(portalUrl, '_blank')}
              className="p-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
              title="Open"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">Notities</h3>
            </div>
            <p className="text-sm text-amber-700">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-slate-100 flex gap-2">
        <button onClick={onEdit} className="btn btn-primary flex-1">
          <Pencil className="h-4 w-4" />
          Bewerken
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="btn p-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/** Klant formulier modal */
function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null
  onClose: () => void
  onSave: (customer: Partial<Customer>) => void
}) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: '',
      email: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      notes: '',
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    await onSave(formData)
    setIsSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {customer ? 'Klant bewerken' : 'Nieuwe klant'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Naam *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input"
              placeholder="Familie de Vries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input"
                placeholder="email@voorbeeld.nl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefoon *
              </label>
              <input
                type="tel"
                required
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="input"
                placeholder="06-12345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Adres *
            </label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="input"
              placeholder="Hoofdstraat 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Postcode *
              </label>
              <input
                type="text"
                required
                value={formData.postal_code || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
                className="input"
                placeholder="1234 AB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Plaats *
              </label>
              <input
                type="text"
                required
                value={formData.city || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="input"
                placeholder="Amsterdam"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notities
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="input resize-none"
              placeholder="Bijzonderheden over deze klant..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuleren
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary flex-1">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : customer ? (
                'Opslaan'
              ) : (
                'Toevoegen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
