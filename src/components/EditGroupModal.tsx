/**
 * EditGroupModal Component
 * 
 * A modal dialog for editing group information (currently just the name).
 * Provides form validation, loading states, and error handling.
 */

'use client'

import { useState, useEffect } from 'react'
import { Group } from '@/types/database'

interface EditGroupModalProps {
  group: Group | null
  isOpen: boolean
  onClose: () => void
  onSave: (groupId: string, name: string) => Promise<void>
}

export default function EditGroupModal({ group, isOpen, onClose, onSave }: EditGroupModalProps) {
  const [name, setName] = useState(group?.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      setName(group.name)
      setError('')
    }
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!group || !name.trim()) return

    setIsLoading(true)
    setError('')

    try {
      await onSave(group.id, name.trim())
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to update group')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !group) return null

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Modal header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Group</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter group name"
              required
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 