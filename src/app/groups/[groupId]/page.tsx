'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Group, Expense } from '@/types/database'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: { groupId: string }
}

export default function GroupPage({ params }: Props) {
  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    getUser()
    getGroup()
    getExpenses()
  }, [params.groupId])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const getGroup = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', params.groupId)
      .single()

    if (error) {
      console.error('Error fetching group:', error)
      router.push('/dashboard')
    } else {
      setGroup(data)
    }
  }

  const getExpenses = async () => {
    const response = await fetch(`/api/expenses/${params.groupId}`)
    
    if (response.ok) {
      const data = await response.json()
      setExpenses(data)
    } else {
      console.error('Error fetching expenses')
    }
    setLoading(false)
  }

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    setCreating(true)
    const response = await fetch(`/api/expenses/${params.groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
      }),
    })

    if (response.ok) {
      setDescription('')
      setAmount('')
      getExpenses()
    } else {
      console.error('Error adding expense')
    }
    setCreating(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Group not found</h2>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {group.name}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
              <div className="text-lg font-semibold text-green-600">
                Total: ${totalAmount.toFixed(2)}
              </div>
            </div>
            
            <form onSubmit={addExpense} className="mb-6 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Expense</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    placeholder="Enter expense description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {creating ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No expenses yet. Add your first expense!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <li key={expense.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Added on {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 