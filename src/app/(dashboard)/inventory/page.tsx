'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Modal, Input, Select } from '@/components/ui'
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Loader2,
  Search,
  Edit,
  Archive,
  TrendingDown,
  TrendingUp,
  History,
  X,
} from 'lucide-react'
import type { Product, ProductCategory, InventoryTransaction, TransactionType } from '@/types/database'

const categoryLabels: Record<ProductCategory, string> = {
  meter: 'Meters',
  adapter: 'Adapters',
  cable: 'Kabels',
  accessory: 'Accessoires',
  other: 'Overig',
}

const categoryColors: Record<ProductCategory, string> = {
  meter: 'bg-blue-100 text-blue-700',
  adapter: 'bg-purple-100 text-purple-700',
  cable: 'bg-emerald-100 text-emerald-700',
  accessory: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700',
}

const transactionTypeLabels: Record<TransactionType, string> = {
  purchase: 'Inkoop',
  usage: 'Gebruikt',
  return: 'Retour',
  adjustment: 'Correctie',
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProductForTransaction, setSelectedProductForTransaction] = useState<Product | null>(null)
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null)

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'other' as ProductCategory,
    description: '',
    unit_price: '',
    stock_quantity: '0',
    min_stock_level: '5',
  })

  const [transactionForm, setTransactionForm] = useState({
    type: 'purchase' as TransactionType,
    quantity: '1',
    notes: '',
  })

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Fetch recent transactions
  const fetchTransactions = async (productId?: string) => {
    try {
      const url = productId
        ? `/api/inventory/transactions?productId=${productId}&limit=20`
        : '/api/inventory/transactions?limit=20'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([fetchProducts(), fetchTransactions()])
      setIsLoading(false)
    }
    init()
  }, [])

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (!product.active) return false
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.sku.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false
    }
    if (showLowStockOnly && product.stock_quantity > product.min_stock_level) {
      return false
    }
    return true
  })

  // Low stock count
  const lowStockCount = products.filter(
    (p) => p.active && p.stock_quantity <= p.min_stock_level
  ).length

  // Open product modal for create/edit
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description || '',
        unit_price: product.unit_price?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
        min_stock_level: product.min_stock_level.toString(),
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        name: '',
        sku: '',
        category: 'other',
        description: '',
        unit_price: '',
        stock_quantity: '0',
        min_stock_level: '5',
      })
    }
    setIsProductModalOpen(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    try {
      const payload = {
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        description: productForm.description || null,
        unit_price: productForm.unit_price ? parseFloat(productForm.unit_price) : null,
        stock_quantity: parseInt(productForm.stock_quantity),
        min_stock_level: parseInt(productForm.min_stock_level),
      }

      const url = editingProduct
        ? `/api/inventory/products/${editingProduct.id}`
        : '/api/inventory/products'

      const response = await fetch(url, {
        method: editingProduct ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchProducts()
        setIsProductModalOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Er ging iets mis')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Er ging iets mis')
    }
  }

  // Archive product
  const handleArchiveProduct = async (product: Product) => {
    if (!confirm(`Weet je zeker dat je "${product.name}" wilt archiveren?`)) return

    try {
      const response = await fetch(`/api/inventory/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error archiving product:', error)
    }
  }

  // Open transaction modal
  const openTransactionModal = (product: Product) => {
    setSelectedProductForTransaction(product)
    setTransactionForm({
      type: 'purchase',
      quantity: '1',
      notes: '',
    })
    setIsTransactionModalOpen(true)
  }

  // Save transaction
  const handleSaveTransaction = async () => {
    if (!selectedProductForTransaction) return

    try {
      const response = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProductForTransaction.id,
          type: transactionForm.type,
          quantity: parseInt(transactionForm.quantity),
          notes: transactionForm.notes || null,
        }),
      })

      if (response.ok) {
        await Promise.all([fetchProducts(), fetchTransactions()])
        setIsTransactionModalOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Er ging iets mis')
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Er ging iets mis')
    }
  }

  // Open history modal
  const openHistoryModal = async (product: Product) => {
    setSelectedProductForHistory(product)
    await fetchTransactions(product.id)
    setIsHistoryModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Voorraad beheer</h1>
          <p className="text-slate-500">Beheer producten en voorraadniveaus</p>
        </div>
        <Button onClick={() => openProductModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuw product
        </Button>
      </div>

      {/* Low Stock Warning */}
      {lowStockCount > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {lowStockCount} product{lowStockCount > 1 ? 'en' : ''} met lage voorraad
              </p>
              <p className="text-sm text-amber-600">
                Controleer de voorraadniveaus en bestel indien nodig bij.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {showLowStockOnly ? 'Toon alles' : 'Toon alleen'}
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Zoek op naam of SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
            className="w-full sm:w-48"
            options={[
              { value: 'all', label: 'Alle categorieën' },
              ...Object.entries(categoryLabels).map(([key, label]) => ({
                value: key,
                label: label,
              })),
            ]}
          />
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isLowStock = product.stock_quantity <= product.min_stock_level

          return (
            <Card key={product.id} className={isLowStock ? 'border-amber-200' : ''}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className={`h-5 w-5 ${isLowStock ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[product.category]}`}>
                      {categoryLabels[product.category]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{product.sku}</span>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-2xl font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                      {product.stock_quantity}
                    </p>
                    <p className="text-xs text-slate-400">
                      Min: {product.min_stock_level}
                    </p>
                  </div>
                  {isLowStock && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs font-medium">Laag</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openTransactionModal(product)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Mutatie
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openHistoryModal(product)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openProductModal(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchiveProduct(product)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Geen producten gevonden</p>
        </Card>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Product bewerken' : 'Nieuw product'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Naam *</label>
            <Input
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Product naam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
              <Input
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="P1M-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categorie</label>
              <Select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                options={Object.entries(categoryLabels).map(([key, label]) => ({
                  value: key,
                  label: label,
                }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beschrijving</label>
            <Input
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Optionele beschrijving"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prijs</label>
              <Input
                type="number"
                step="0.01"
                value={productForm.unit_price}
                onChange={(e) => setProductForm({ ...productForm, unit_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voorraad</label>
              <Input
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min. voorraad</label>
              <Input
                type="number"
                value={productForm.min_stock_level}
                onChange={(e) => setProductForm({ ...productForm, min_stock_level: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsProductModalOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title={`Voorraad mutatie: ${selectedProductForTransaction?.name || ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type mutatie</label>
            <Select
              value={transactionForm.type}
              onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as TransactionType })}
              options={[
                { value: 'purchase', label: 'Inkoop (+)' },
                { value: 'usage', label: 'Gebruikt (-)' },
                { value: 'return', label: 'Retour (+)' },
                { value: 'adjustment', label: 'Correctie (+/-)' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Aantal {transactionForm.type === 'adjustment' ? '(positief of negatief)' : ''}
            </label>
            <Input
              type="number"
              value={transactionForm.quantity}
              onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
              min={transactionForm.type === 'adjustment' ? undefined : '1'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notitie</label>
            <Input
              value={transactionForm.notes}
              onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
              placeholder="Optionele notitie"
            />
          </div>
          {selectedProductForTransaction && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">
                Huidige voorraad: <span className="font-semibold">{selectedProductForTransaction.stock_quantity}</span>
              </p>
              <p className="text-sm text-slate-600">
                Na mutatie:{' '}
                <span className="font-semibold">
                  {transactionForm.type === 'usage'
                    ? selectedProductForTransaction.stock_quantity - parseInt(transactionForm.quantity || '0')
                    : transactionForm.type === 'adjustment'
                    ? selectedProductForTransaction.stock_quantity + parseInt(transactionForm.quantity || '0')
                    : selectedProductForTransaction.stock_quantity + parseInt(transactionForm.quantity || '0')}
                </span>
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsTransactionModalOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveTransaction}>
              Opslaan
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Geschiedenis: ${selectedProductForHistory?.name || ''}`}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Geen transacties gevonden</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'purchase' || transaction.type === 'return' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transactionTypeLabels[transaction.type]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(transaction.created_at).toLocaleString('nl-NL')}
                    </p>
                    {transaction.notes && (
                      <p className="text-xs text-slate-400 mt-1">{transaction.notes}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'purchase' || transaction.type === 'return'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'usage' ? '-' : '+'}
                  {transaction.quantity}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
            Sluiten
          </Button>
        </div>
      </Modal>
    </div>
  )
}
