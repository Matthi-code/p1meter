'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import {
  FileText,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
  Search,
  Copy,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  GripVertical,
  MessageSquare,
} from 'lucide-react'

type FAQItem = {
  id: string
  category: string
  question: string
  answer: string
  sort_order: number
  active: boolean
}

type CMSPage = {
  id: string
  slug: string
  title: string
  content: Record<string, unknown>
}

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'pages'>('faq')
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [pages, setPages] = useState<CMSPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null)
  const [isNewFaq, setIsNewFaq] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [faqRes, pagesRes] = await Promise.all([
        fetch('/api/cms/faq'),
        fetch('/api/cms/pages'),
      ])

      const faqData = await faqRes.json()
      const pagesData = await pagesRes.json()

      if (faqData.items) setFaqItems(faqData.items)
      if (pagesData.pages) setPages(pagesData.pages)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Content Beheer</h1>
        <p className="text-slate-500">Beheer FAQ en pagina-inhoud</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'faq'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pages'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Pagina&apos;s
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {activeTab === 'faq' && (
            <FAQManager
              items={faqItems}
              onUpdate={fetchData}
              editingItem={editingFaq}
              setEditingItem={setEditingFaq}
              isNew={isNewFaq}
              setIsNew={setIsNewFaq}
            />
          )}
          {activeTab === 'pages' && (
            <PagesManager
              pages={pages}
              onUpdate={fetchData}
              editingPage={editingPage}
              setEditingPage={setEditingPage}
            />
          )}
        </>
      )}
    </div>
  )
}

// FAQ Manager Component
function FAQManager({
  items,
  onUpdate,
  editingItem,
  setEditingItem,
  isNew,
  setIsNew,
}: {
  items: FAQItem[]
  onUpdate: () => void
  editingItem: FAQItem | null
  setEditingItem: (item: FAQItem | null) => void
  isNew: boolean
  setIsNew: (v: boolean) => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const categories = [...new Set(items.map((i) => i.category))].sort()

  // Filter items by selected category and search query
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  async function handleSave(item: FAQItem) {
    setIsSaving(true)
    try {
      const response = await fetch('/api/cms/faq', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      const data = await response.json()
      if (data.success) {
        setEditingItem(null)
        setIsNew(false)
        onUpdate()
      } else {
        alert(data.error || 'Opslaan mislukt')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Er is een fout opgetreden')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je deze vraag wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/cms/faq?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        onUpdate()
      } else {
        alert(data.error || 'Verwijderen mislukt')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  async function handleToggleActive(item: FAQItem) {
    try {
      const response = await fetch('/api/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      })
      const data = await response.json()
      if (data.success) {
        onUpdate()
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  function handleNew() {
    setEditingItem({
      id: '',
      category: categories[0] || 'Algemeen',
      question: '',
      answer: '',
      sort_order: items.length,
      active: true,
    })
    setIsNew(true)
  }

  function handleDuplicate(item: FAQItem) {
    setEditingItem({
      id: '',
      category: item.category,
      question: item.question + ' (kopie)',
      answer: item.answer,
      sort_order: items.length,
      active: true,
    })
    setIsNew(true)
  }

  async function handleMoveUp(item: FAQItem) {
    const currentIndex = items.findIndex(i => i.id === item.id)
    if (currentIndex <= 0) return

    const prevItem = items[currentIndex - 1]

    // Swap sort_order values
    await Promise.all([
      fetch('/api/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, sort_order: prevItem.sort_order }),
      }),
      fetch('/api/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prevItem.id, sort_order: item.sort_order }),
      }),
    ])
    onUpdate()
  }

  async function handleMoveDown(item: FAQItem) {
    const currentIndex = items.findIndex(i => i.id === item.id)
    if (currentIndex >= items.length - 1) return

    const nextItem = items[currentIndex + 1]

    // Swap sort_order values
    await Promise.all([
      fetch('/api/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, sort_order: nextItem.sort_order }),
      }),
      fetch('/api/cms/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nextItem.id, sort_order: item.sort_order }),
      }),
    ])
    onUpdate()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Veelgestelde vragen ({filteredItems.length}{selectedCategory !== 'all' || searchQuery ? ` van ${items.length}` : ''})
        </h2>
        <div className="flex items-center gap-2">
          <a
            href="/faq"
            target="_blank"
            className="btn btn-secondary"
            title="Bekijk publieke FAQ pagina"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </a>
          <button onClick={handleNew} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nieuwe vraag
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoeken in vragen en antwoorden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-sm text-slate-500 flex-shrink-0">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({items.filter(i => i.category === cat).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQ List */}
      <Card padding="none">
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {selectedCategory === 'all' ? 'Geen FAQ items gevonden' : `Geen items in categorie "${selectedCategory}"`}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSuggestion = item.category === 'Suggestie'
              return (
              <div
                key={item.id}
                className={`p-4 ${isSuggestion ? 'bg-amber-50 border-l-4 border-l-amber-400' : ''} ${!item.active && !isSuggestion ? 'bg-slate-50 opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Sort controls */}
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button
                      onClick={() => handleMoveUp(item)}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Omhoog"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(item)}
                      disabled={index === filteredItems.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Omlaag"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isSuggestion ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded">
                          <MessageSquare className="h-3 w-3" />
                          Ingezonden vraag
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {item.category}
                        </span>
                      )}
                      {!item.active && !isSuggestion && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-medium rounded">
                          Inactief
                        </span>
                      )}
                      {isSuggestion && (
                        <span className="text-xs text-amber-600">Te beantwoorden</span>
                      )}
                      {!isSuggestion && <span className="text-xs text-slate-400">#{item.sort_order}</span>}
                    </div>
                    <p className="font-medium text-slate-900 mb-1">{item.question}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.answer}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.active
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={item.active ? 'Verbergen' : 'Tonen'}
                    >
                      {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Dupliceren"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setIsNew(false)
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Bewerken"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {editingItem && (
        <FAQEditModal
          item={editingItem}
          categories={categories}
          isNew={isNew}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => {
            setEditingItem(null)
            setIsNew(false)
          }}
        />
      )}
    </div>
  )
}

// FAQ Edit Modal
function FAQEditModal({
  item,
  categories,
  isNew,
  isSaving,
  onSave,
  onClose,
}: {
  item: FAQItem
  categories: string[]
  isNew: boolean
  isSaving: boolean
  onSave: (item: FAQItem) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState(item)
  const [newCategory, setNewCategory] = useState('')
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)

  // Ensure we always have at least 'Algemeen' as an option
  const availableCategories = categories.length > 0 ? categories : ['Algemeen']

  function handleCategoryChange(value: string) {
    if (value === '__new__') {
      setIsAddingNewCategory(true)
      setNewCategory('')
      // Clear the category so validation works correctly
      setFormData((prev) => ({ ...prev, category: '' }))
    } else {
      setIsAddingNewCategory(false)
      setFormData((prev) => ({ ...prev, category: value }))
    }
  }

  function handleNewCategoryInput(value: string) {
    setNewCategory(value)
    setFormData((prev) => ({ ...prev, category: value }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {isNew ? 'Nieuwe vraag' : 'Vraag bewerken'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Categorie
            </label>
            <div className="flex gap-2">
              <select
                value={isAddingNewCategory ? '__new__' : formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input flex-1"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">+ Nieuwe categorie</option>
              </select>
              {isAddingNewCategory && (
                <input
                  type="text"
                  placeholder="Nieuwe categorie..."
                  value={newCategory}
                  onChange={(e) => handleNewCategoryInput(e.target.value)}
                  className="input flex-1"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Vraag
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
              className="input"
              placeholder="Hoe werkt...?"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Antwoord
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
              rows={6}
              className="input resize-none"
              placeholder="Het antwoord op de vraag..."
            />
          </div>

          {/* Sort order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Sorteervolgorde
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, active: e.target.value === 'active' }))
                }
                className="input"
              >
                <option value="active">Actief (zichtbaar)</option>
                <option value="inactive">Inactief (verborgen)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Annuleren
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.question || !formData.answer || !formData.category}
            className="btn btn-primary flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Opslaan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Pages Manager Component
function PagesManager({
  pages,
  onUpdate,
  editingPage,
  setEditingPage,
}: {
  pages: CMSPage[]
  onUpdate: () => void
  editingPage: CMSPage | null
  setEditingPage: (page: CMSPage | null) => void
}) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(page: CMSPage) {
    setIsSaving(true)
    try {
      const response = await fetch('/api/cms/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: page.slug,
          title: page.title,
          content: page.content,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setEditingPage(null)
        onUpdate()
      } else {
        alert(data.error || 'Opslaan mislukt')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Er is een fout opgetreden')
    } finally {
      setIsSaving(false)
    }
  }

  const pageNames: Record<string, string> = {
    over: 'Over ons',
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Pagina&apos;s</h2>

      <Card padding="none">
        <div className="divide-y divide-slate-100">
          {pages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Geen pagina&apos;s gevonden
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {pageNames[page.slug] || page.title}
                    </p>
                    <p className="text-sm text-slate-500">/{page.slug}</p>
                  </div>
                  <button
                    onClick={() => setEditingPage(page)}
                    className="btn btn-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    Bewerken
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit Modal for Over page */}
      {editingPage?.slug === 'over' && (
        <OverPageEditModal
          page={editingPage}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => setEditingPage(null)}
        />
      )}
    </div>
  )
}

// Over Page Edit Modal
function OverPageEditModal({
  page,
  isSaving,
  onSave,
  onClose,
}: {
  page: CMSPage
  isSaving: boolean
  onSave: (page: CMSPage) => void
  onClose: () => void
}) {
  const content = page.content as {
    subtitle?: string
    mission?: { title?: string; text?: string }
    values?: Array<{ icon?: string; title?: string; text?: string }>
    contact?: { address?: string; phone?: string; email?: string }
  }

  const [formData, setFormData] = useState({
    title: page.title,
    subtitle: content.subtitle || '',
    missionTitle: content.mission?.title || '',
    missionText: content.mission?.text || '',
    values: content.values || [],
    contactAddress: content.contact?.address || '',
    contactPhone: content.contact?.phone || '',
    contactEmail: content.contact?.email || '',
  })

  function handleSave() {
    const updatedPage: CMSPage = {
      ...page,
      title: formData.title,
      content: {
        subtitle: formData.subtitle,
        mission: {
          title: formData.missionTitle,
          text: formData.missionText,
        },
        values: formData.values,
        contact: {
          address: formData.contactAddress,
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
      },
    }
    onSave(updatedPage)
  }

  function updateValue(index: number, field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Over ons pagina bewerken</h3>
          <button onClick={onClose} className="btn btn-ghost p-2">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Header</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtitel</label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                rows={2}
                className="input resize-none"
              />
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Missie</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Titel</label>
              <input
                type="text"
                value={formData.missionTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, missionTitle: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tekst</label>
              <textarea
                value={formData.missionText}
                onChange={(e) => setFormData((prev) => ({ ...prev, missionText: e.target.value }))}
                rows={4}
                className="input resize-none"
              />
            </div>
          </div>

          {/* Values */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Kenmerken</h4>
            {formData.values.map((value, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  Kenmerk {index + 1}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Titel</label>
                  <input
                    type="text"
                    value={value.title || ''}
                    onChange={(e) => updateValue(index, 'title', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tekst</label>
                  <textarea
                    value={value.text || ''}
                    onChange={(e) => updateValue(index, 'text', e.target.value)}
                    rows={2}
                    className="input resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Contact</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
              <textarea
                value={formData.contactAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactAddress: e.target.value }))}
                rows={2}
                className="input resize-none"
                placeholder="Straatnaam 123&#10;1234 AB Plaats"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefoon</label>
              <textarea
                value={formData.contactPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                rows={2}
                className="input resize-none"
                placeholder="088 - 123 4567&#10;Ma-Vr 09:00 - 17:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Annuleren
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn btn-primary flex-1">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Opslaan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
