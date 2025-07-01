'use client'

import { useState } from 'react'

interface ApiEndpoint {
  method: string
  path: string
  description: string
  requestBody?: Record<string, unknown>
  responseExample: Record<string, unknown> | Record<string, unknown>[]
  requiresAuth: boolean
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'Check if the API is running properly',
    responseExample: {
      status: 'healthy',
      timestamp: '2025-06-30T23:54:47.757Z',
      service: 'group-expense-tracker'
    },
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/groups',
    description: 'Get all groups for the authenticated user',
    responseExample: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Trip to Bali',
        created_by: 'user-id',
        created_at: '2025-01-01T00:00:00Z'
      }
    ],
    requiresAuth: true
  },
  {
    method: 'POST',
    path: '/api/groups',
    description: 'Create a new group',
    requestBody: {
      name: 'Weekend Trip'
    },
    responseExample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Weekend Trip',
      created_by: 'user-id',
      created_at: '2025-01-01T00:00:00Z'
    },
    requiresAuth: true
  },
  {
    method: 'PUT',
    path: '/api/groups/{groupId}',
    description: 'Update a group\'s information',
    requestBody: {
      name: 'Updated Group Name'
    },
    responseExample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Updated Group Name',
      created_by: 'user-id',
      created_at: '2025-01-01T00:00:00Z'
    },
    requiresAuth: true
  },
  {
    method: 'DELETE',
    path: '/api/groups/{groupId}',
    description: 'Delete a group and all its expenses',
    responseExample: {
      success: true
    },
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/expenses/{groupId}',
    description: 'Get all expenses for a specific group',
    responseExample: [
      {
        id: 'expense-id-1',
        description: 'Restaurant dinner',
        amount: 150.50,
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        created_by: 'user-id',
        created_at: '2025-01-01T00:00:00Z'
      }
    ],
    requiresAuth: true
  },
  {
    method: 'POST',
    path: '/api/expenses/{groupId}',
    description: 'Add a new expense to a group',
    requestBody: {
      description: 'Grocery shopping',
      amount: 85.20
    },
    responseExample: {
      id: 'expense-id-2',
      description: 'Grocery shopping',
      amount: 85.20,
      group_id: '123e4567-e89b-12d3-a456-426614174000',
      created_by: 'user-id',
      created_at: '2025-01-01T00:00:00Z'
    },
    requiresAuth: true
  },
  {
    method: 'PUT',
    path: '/api/expense/{expenseId}',
    description: 'Update an individual expense',
    requestBody: {
      description: 'Updated description',
      amount: 200.00
    },
    responseExample: {
      id: 'expense-id-1',
      description: 'Updated description',
      amount: 200.00,
      group_id: '123e4567-e89b-12d3-a456-426614174000',
      created_by: 'user-id',
      created_at: '2025-01-01T00:00:00Z'
    },
    requiresAuth: true
  },
  {
    method: 'DELETE',
    path: '/api/expense/{expenseId}',
    description: 'Delete an individual expense',
    responseExample: {
      success: true
    },
    requiresAuth: true
  }
]

export default function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [customGroupId, setCustomGroupId] = useState<string>('')
  const [customExpenseId, setCustomExpenseId] = useState<string>('')
  const [availableGroups, setAvailableGroups] = useState<Array<{id: string, name: string}>>([])
  const [availableExpenses, setAvailableExpenses] = useState<Array<{id: string, description: string}>>([])
  const [lastCreatedType, setLastCreatedType] = useState<string>('')

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setIsLoading(true)
    setTestResult('Testing...')

    try {
      let url = `${window.location.origin}${endpoint.path}`
      
      // Replace path parameters with custom IDs
      if (endpoint.path.includes('{groupId}')) {
        const groupId = customGroupId || 'test-id'
        url = url.replace('{groupId}', groupId)
      }
      if (endpoint.path.includes('{expenseId}')) {
        const expenseId = customExpenseId || 'test-id'
        url = url.replace('{expenseId}', expenseId)
      }
      
      console.log('Testing URL:', url) // Debug log
      
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      }

      if (endpoint.requestBody && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
        options.body = JSON.stringify(endpoint.requestBody)
      }

      console.log('Request options:', options) // Debug log
      
      const response = await fetch(url, options)
      console.log('Response:', response) // Debug log
      
      if (!response.ok) {
        const errorText = await response.text()
        setTestResult(`❌ ${response.status} ${response.statusText}\n\nError: ${errorText}`)
        return
      }
      
      const data = await response.json()
      
      // Auto-capture IDs from successful responses
      if (response.ok && data) {
        // Check if this was a group creation
        if (endpoint.method === 'POST' && endpoint.path === '/api/groups' && (data as Record<string, unknown>).id) {
          setCustomGroupId(String((data as Record<string, unknown>).id))
          setLastCreatedType('group')
          setTestResult(`✅ ${response.status} ${response.statusText} - Group ID auto-captured!\n\n${JSON.stringify(data, null, 2)}`)
        }
        // Check if this was an expense creation
        else if (endpoint.method === 'POST' && endpoint.path.includes('/api/expenses/') && (data as Record<string, unknown>).id) {
          setCustomExpenseId(String((data as Record<string, unknown>).id))
          setLastCreatedType('expense')
          setTestResult(`✅ ${response.status} ${response.statusText} - Expense ID auto-captured!\n\n${JSON.stringify(data, null, 2)}`)
        }
        // Check if this was getting groups (update available groups)
        else if (endpoint.method === 'GET' && endpoint.path === '/api/groups' && Array.isArray(data)) {
          setAvailableGroups(data.map((group: Record<string, unknown>) => ({ id: String(group.id), name: String(group.name) })))
          setTestResult(`✅ ${response.status} ${response.statusText} - ${data.length} groups loaded!\n\n${JSON.stringify(data, null, 2)}`)
        }
        // Check if this was getting expenses (update available expenses)
        else if (endpoint.method === 'GET' && endpoint.path.includes('/api/expenses/') && Array.isArray(data)) {
          setAvailableExpenses(data.map((expense: Record<string, unknown>) => ({ id: String(expense.id), description: String(expense.description) })))
          setTestResult(`✅ ${response.status} ${response.statusText} - ${data.length} expenses loaded!\n\n${JSON.stringify(data, null, 2)}`)
        }
        else {
          setTestResult(`✅ ${response.status} ${response.statusText}\n\n${JSON.stringify(data, null, 2)}`)
        }
      } else {
        setTestResult(`✅ ${response.status} ${response.statusText}\n\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      console.error('Fetch error:', error) // Debug log
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : String(error)}\n\nCheck browser console for details.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-gray-600">Group Expense Tracker API</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Base URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Custom IDs Input */}
        <div className="mb-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Custom IDs</h2>
            <p className="text-sm text-gray-600">Enter real IDs to test endpoints with path parameters</p>
          </div>
          <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Group ID (for {'{groupId}'} endpoints)
                   {lastCreatedType === 'group' && (
                     <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                       ✨ Auto-captured!
                     </span>
                   )}
                 </label>
                 <input
                   type="text"
                   value={customGroupId}
                   onChange={(e) => setCustomGroupId(e.target.value)}
                   placeholder="Auto-filled when you create a group"
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                 />
                 {availableGroups.length > 0 && (
                   <div className="mt-2">
                     <label className="block text-xs text-gray-500 mb-1">Or select from existing groups:</label>
                     <select 
                       value={customGroupId}
                       onChange={(e) => setCustomGroupId(e.target.value)}
                       className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                     >
                       <option value="">Select a group...</option>
                       {availableGroups.map((group) => (
                         <option key={group.id} value={group.id}>
                           {group.name} ({group.id.slice(0, 8)}...)
                         </option>
                       ))}
                     </select>
                   </div>
                 )}
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Expense ID (for {'{expenseId}'} endpoints)
                   {lastCreatedType === 'expense' && (
                     <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                       ✨ Auto-captured!
                     </span>
                   )}
                 </label>
                 <input
                   type="text"
                   value={customExpenseId}
                   onChange={(e) => setCustomExpenseId(e.target.value)}
                   placeholder="Auto-filled when you add an expense"
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                 />
                 {availableExpenses.length > 0 && (
                   <div className="mt-2">
                     <label className="block text-xs text-gray-500 mb-1">Or select from existing expenses:</label>
                     <select 
                       value={customExpenseId}
                       onChange={(e) => setCustomExpenseId(e.target.value)}
                       className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                     >
                       <option value="">Select an expense...</option>
                       {availableExpenses.map((expense) => (
                         <option key={expense.id} value={expense.id}>
                           {expense.description} ({expense.id.slice(0, 8)}...)
                         </option>
                       ))}
                     </select>
                   </div>
                 )}
               </div>
             </div>
             <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                <div className="text-sm text-blue-800">
                   <strong>🚀 Auto-Magic Testing:</strong>
                   <ol className="mt-2 text-xs space-y-1">
                     <li>1. Create a group with <strong>POST /api/groups</strong> - ID auto-captured! ✨</li>
                     <li>2. Add an expense with <strong>POST /api/expenses/{'{groupId}'}</strong> - ID auto-captured! ✨</li>
                     <li>3. Test other endpoints with the auto-filled IDs! 🎯</li>
                   </ol>
                   <div className="mt-3">
                     <button
                       onClick={() => testEndpoint({ method: 'GET', path: '/api/groups', description: 'Load available groups', responseExample: [], requiresAuth: true })}
                       className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                     >
                       🔄 Load My Groups
                     </button>
                   </div>
                 </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Endpoints List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">API Endpoints</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedEndpoint === endpoint ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                    {endpoint.requiresAuth && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        🔒 Auth Required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEndpoint ? 'Endpoint Details' : 'Select an Endpoint'}
              </h2>
            </div>
            
            {selectedEndpoint ? (
              <div className="p-6 space-y-6">
                {/* Method and Path */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 text-sm font-medium text-white rounded ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-700">{selectedEndpoint.path}</code>
                  </div>
                  <p className="text-gray-600">{selectedEndpoint.description}</p>
                </div>

                {/* Authentication */}
                {selectedEndpoint.requiresAuth && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>This endpoint requires a valid session. Sign in through the main application first.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Request Body</h3>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Example */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Response Example</h3>
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                  </pre>
                </div>

                {/* Try It Out */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Try It Out</h3>
                    <button
                      onClick={() => testEndpoint(selectedEndpoint)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Testing...' : 'Test Endpoint'}
                    </button>
                  </div>
                  
                  {testResult && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {testResult}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Click on an endpoint from the list to view its details and test it.</p>
              </div>
            )}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Getting Started</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">🚀 Quick Start</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Make sure your Docker container is running</li>
                  <li>Test the health endpoint to verify connectivity</li>
                  <li>Sign in through the main app to get session cookies</li>
                  <li>Use authenticated endpoints to manage groups and expenses</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">📋 Available Collections</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Health Check:</strong> Verify API status</li>
                  <li>• <strong>Groups Management:</strong> CRUD operations for expense groups</li>
                  <li>• <strong>Group Expenses:</strong> Manage expenses within groups</li>
                  <li>• <strong>Individual Expenses:</strong> Update/delete specific expenses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 