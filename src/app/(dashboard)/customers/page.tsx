'use client'

import { useState, useMemo } from 'react'
import { useCustomers, useInstallations } from '@/hooks/useData'
import { useAuth } from '@/lib/auth'
import * as dataApi from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { geocodeCustomerAddress } from '@/lib/geocoding'
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Users,
  Calendar,
  Wrench,
  Copy,
  Check,
  User,
  Building,
  FileText,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react'
import type { Customer } from '@/types/supabase'

type ViewMode = 'grid' | 'list'

export default function CustomersPage() {
  const { data: customers, isLoading, refetch } = useCustomers()
  const { data: installations } = useInstallations()
  const { hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

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

  // Stats
  const totalCustomers = customers?.length ?? 0
  const customersWithInstallations = customers?.filter(
    (c) => getInstallationCount(c.id) > 0
  ).length ?? 0
  const totalInstallations = installations?.length ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Klanten</h1>
          <p className="text-sm sm:text-base text-slate-500">Beheer je klantenbestand</p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" />
          Nieuwe klant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <Users className="h-4 sm:h-6 w-4 sm:w-6 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{totalCustomers}</p>
              <p className="text-[10px] sm:text-sm text-slate-500">Klanten</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
              <Wrench className="h-4 sm:h-6 w-4 sm:w-6 text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{customersWithInstallations}</p>
              <p className="text-[10px] sm:text-sm text-slate-500">Met install.</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
              <Calendar className="h-4 sm:h-6 w-4 sm:w-6 text-violet-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{totalInstallations}</p>
              <p className="text-[10px] sm:text-sm text-slate-500">Installaties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zoekbalk en view toggle */}
      <div className="flex gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Zoeken..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 sm:pl-12 text-sm"
          />
        </div>
        {/* View toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 sm:p-2.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Blokweergave"
          >
            <LayoutGrid className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 sm:p-2.5 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Lijstweergave"
          >
            <List className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Klanten weergave */}
      {filteredCustomers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500">Geen klanten gevonden</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid weergave */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              installationCount={getInstallationCount(customer.id)}
              onSelect={() => setSelectedCustomer(customer)}
              onEdit={() => handleEdit(customer)}
            />
          ))}
        </div>
      ) : (
        /* Lijst weergave */
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Klant
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                  Adres
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Installaties
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  installationCount={getInstallationCount(customer.id)}
                  onSelect={() => setSelectedCustomer(customer)}
                  onEdit={() => handleEdit(customer)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Klant detail sidebar */}
      {selectedCustomer && (
        <CustomerDetailSidebar
          customer={selectedCustomer}
          installationCount={getInstallationCount(selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => handleEdit(selectedCustomer)}
          onDelete={() => handleDelete(selectedCustomer.id)}
          canDelete={hasRole(['admin'])}
        />
      )}

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

/** Klant kaart */
function CustomerCard({
  customer,
  installationCount,
  onSelect,
  onEdit,
}: {
  customer: Customer
  installationCount: number
  onSelect: () => void
  onEdit: () => void
}) {
  return (
    <div
      className="card p-4 sm:p-5 hover:shadow-lg sm:hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
              {customer.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">{customer.address}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="sm:opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-all"
        >
          <Pencil className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-500" />
        </button>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Mail className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Phone className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-400 flex-shrink-0" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <MapPin className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{customer.address}</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs text-slate-500">
          Sinds {formatDate(customer.created_at)}
        </span>
        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${
          installationCount > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {installationCount} install.
        </span>
      </div>
    </div>
  )
}

/** Klant rij voor lijstweergave */
function CustomerRow({
  customer,
  installationCount,
  onSelect,
  onEdit,
}: {
  customer: Customer
  installationCount: number
  onSelect: () => void
  onEdit: () => void
}) {
  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      {/* Klant */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{customer.name}</p>
            <p className="text-xs text-slate-500 md:hidden truncate">{customer.email}</p>
          </div>
        </div>
      </td>

      {/* Contact - hidden op mobile */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="space-y-0.5">
          <p className="text-sm text-slate-600 truncate">{customer.email}</p>
          <p className="text-xs text-slate-400">{customer.phone}</p>
        </div>
      </td>

      {/* Adres - hidden op tablet */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <p className="text-sm text-slate-600 truncate">
          {customer.address}
        </p>
      </td>

      {/* Installaties */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 text-xs font-medium rounded-full ${
          installationCount > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {installationCount}
        </span>
      </td>

      {/* Acties */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Pencil className="h-4 w-4 text-slate-400" />
        </button>
      </td>
    </tr>
  )
}

/** Klant detail sidebar */
function CustomerDetailSidebar({
  customer,
  installationCount,
  onClose,
  onEdit,
  onDelete,
  canDelete = false,
}: {
  customer: Customer
  installationCount: number
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  canDelete?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const portalUrl = `/portal?token=${customer.portal_token}`

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.origin + portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Klantdetails</h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-160px)]">
          {/* Klant header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
              <p className="text-sm text-slate-500">
                Klant sinds {formatDate(customer.created_at)}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contactgegevens
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 text-sm text-slate-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4 text-slate-400" />
                {customer.email}
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-3 text-sm text-slate-700 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4 text-slate-400" />
                {customer.phone}
              </a>
            </div>
          </div>

          {/* Adres */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Adres
            </h4>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p>{customer.address}</p>
                  <p>{customer.postal_code} {customer.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistieken */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Statistieken
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{installationCount}</p>
                <p className="text-xs text-slate-500">Installaties</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {installationCount > 0 ? '100%' : '0%'}
                </p>
                <p className="text-xs text-slate-500">Voltooid</p>
              </div>
            </div>
          </div>

          {/* Portal link */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Klantportaal
            </h4>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700 mb-3">
                Deel deze link met de klant voor toegang tot hun portaal:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-blue-200 text-slate-700 truncate">
                  {typeof window !== 'undefined' ? window.location.origin + portalUrl : portalUrl}
                </code>
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-all ${
                    copied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-100'
                  }`}
                  title="Kopieer link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => window.open(portalUrl, '_blank')}
                  className="p-2 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all"
                  title="Bekijk portal"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notities */}
          {customer.notes && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notities
              </h4>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-white">
          <div className="flex gap-3">
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
      </div>
    </>
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
