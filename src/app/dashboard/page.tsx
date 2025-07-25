'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Group } from '@/types/database'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EditGroupModal from '@/components/EditGroupModal'

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }, [supabase.auth])

  const getGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
    } else {
      setGroups(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    getUser()
    getGroups()
  }, [getUser, getGroups])

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    setCreating(true)
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName }),
    })

    if (response.ok) {
      setGroupName('')
      getGroups()
    } else {
      console.error('Error creating group')
    }
    setCreating(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setIsEditModalOpen(true)
  }

  const handleSaveGroup = async (groupId: string, name: string) => {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error('Failed to update group')
    }

    // Refresh groups list
    getGroups()
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? All expenses in this group will also be deleted.')) {
      return
    }

    const response = await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      console.error('Failed to delete group')
      return
    }

    // Refresh groups list
    getGroups()
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingGroup(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Group Expense Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.email}
              </span>
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Groups</h2>
            
            <form onSubmit={createGroup} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No groups yet. Create your first group!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Link
                    href={`/groups/${group.id}`}
                    className="block p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {group.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  
                  {/* Action buttons */}
                  <div className="px-6 pb-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleEditGroup(group)
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteGroup(group.id)
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Group Modal */}
      <EditGroupModal
        group={editingGroup}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveGroup}
      />
    </div>
  )
} 