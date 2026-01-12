'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, Circle, Loader2, ClipboardCheck } from 'lucide-react'
import { Card } from '@/components/ui'
import type { ChecklistData, ChecklistItem } from '@/types/supabase'
import { DEFAULT_CHECKLIST_ITEMS } from '@/types/supabase'

type InstallationChecklistProps = {
  installationId: string
  checklistData: ChecklistData | null
  onUpdate: (data: ChecklistData) => Promise<void>
  readOnly?: boolean
}

// Merge saved items with defaults: keeps checked state from saved items, adds new items from defaults
function mergeChecklistItems(savedItems: ChecklistItem[] | undefined): ChecklistItem[] {
  if (!savedItems || savedItems.length === 0) {
    return DEFAULT_CHECKLIST_ITEMS
  }

  // Create a map of saved items by id for quick lookup
  const savedMap = new Map(savedItems.map(item => [item.id, item]))

  // Use default items as base, preserve checked state from saved items
  return DEFAULT_CHECKLIST_ITEMS.map(defaultItem => {
    const savedItem = savedMap.get(defaultItem.id)
    return savedItem
      ? { ...defaultItem, checked: savedItem.checked } // Keep saved checked state, use default label
      : defaultItem // New item, use default
  })
}

export function InstallationChecklist({
  installationId,
  checklistData,
  onUpdate,
  readOnly = false,
}: InstallationChecklistProps) {
  // Merge saved data with defaults to handle new/removed items
  const mergedItems = useMemo(
    () => mergeChecklistItems(checklistData?.items),
    [checklistData?.items]
  )

  const [items, setItems] = useState<ChecklistItem[]>(mergedItems)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update items when checklistData prop changes
  useEffect(() => {
    setItems(mergeChecklistItems(checklistData?.items))
  }, [checklistData])

  // Calculate progress
  const completedCount = items.filter((item) => item.checked).length
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount === totalCount

  // Toggle item
  const toggleItem = async (id: string) => {
    if (readOnly || isSaving) return

    const newItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    setItems(newItems)
    setHasChanges(true)

    // Auto-save after toggle
    setIsSaving(true)
    try {
      const newCompletedCount = newItems.filter((i) => i.checked).length
      const newIsComplete = newCompletedCount === totalCount

      await onUpdate({
        items: newItems,
        completed_at: newIsComplete ? new Date().toISOString() : null,
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save checklist:', error)
      // Revert on error
      setItems(items)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isComplete ? 'bg-emerald-100' : 'bg-blue-100'
          }`}>
            <ClipboardCheck className={`h-5 w-5 ${
              isComplete ? 'text-emerald-600' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Oplevering Checklist</h3>
            <p className="text-sm text-slate-500">
              {completedCount}/{totalCount} stappen voltooid
            </p>
          </div>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opslaan...
          </div>
        )}
        {isComplete && !isSaving && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            Compleet
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            disabled={readOnly || isSaving}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
              readOnly || isSaving
                ? 'cursor-default'
                : 'hover:bg-slate-50 cursor-pointer'
            } ${item.checked ? 'bg-emerald-50' : ''}`}
          >
            {item.checked ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                item.checked
                  ? 'text-emerald-700 line-through'
                  : 'text-slate-700'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Completion message */}
      {isComplete && checklistData?.completed_at && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Voltooid op{' '}
            {new Date(checklistData.completed_at).toLocaleString('nl-NL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </Card>
  )
}
