/**
 * AuthForm Component
 * 
 * A comprehensive authentication form that handles both user registration and login
 * using Supabase Auth. This component provides a toggle between login and register
 * modes with proper form validation, loading states, and error handling.
 * 
 * Features:
 * - Email/password authentication
 * - User registration with username collection
 * - Form validation and error display
 * - Loading states during authentication
 * - Automatic redirect on successful login
 * - Toggle between login and register modes
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  // State management for form functionality
  const [isLoading, setIsLoading] = useState(false)          // Loading state during auth operations
  const [isLogin, setIsLogin] = useState(true)               // Toggle between login/register mode
  const [email, setEmail] = useState('')                     // User's email input
  const [password, setPassword] = useState('')               // User's password input
  const [username, setUsername] = useState('')               // Username (only for registration)
  const [error, setError] = useState('')                     // Error message display
  
  // Next.js router for navigation after successful auth
  const router = useRouter()
  
  // Initialize Supabase client for authentication
  const supabase = createClient()

  /**
   * Handle form submission for both login and registration
   * 
   * Authentication Flow:
   * 1. Prevent form default submission
   * 2. Set loading state and clear previous errors
   * 3. Determine if user is logging in or registering
   * 4. Call appropriate Supabase auth method
   * 5. Handle success/error responses
   * 6. Redirect on successful login or show confirmation message
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        // LOGIN FLOW: Authenticate existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Successful login - redirect to dashboard
        router.push('/dashboard')
      } else {
        // REGISTRATION FLOW: Create new user account
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username, // Store username in user metadata
            },
          },
        })
        if (error) throw error
        
        // Successful registration - show email confirmation message
        setError('Check your email for the confirmation link!')
      }
    } catch (error: unknown) {
      // Display authentication errors to user
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      // Reset loading state regardless of success/failure
      setIsLoading(false)
    }
  }

  return (
    // Main container with full-height centering
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Section */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {/* Authentication Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Input Fields Container */}
          <div className="rounded-md shadow-sm -space-y-px">
            
            {/* Email Input Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Username Input Field - Only shown during registration */}
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required={!isLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {/* Password Input Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isLogin ? 'rounded-b-md' : ''
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {/* Dynamic button text based on loading state and mode */}
              {isLoading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {/* Mode Toggle Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {/* Toggle text based on current mode */}
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 