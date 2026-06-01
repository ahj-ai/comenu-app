'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Utensils } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setError(error.message)
    } else {
      alert('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-4">
          <Utensils className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-500 text-sm">Sign in to CoMenu to manage your household meals.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <input 
            type="password" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-300">New to CoMenu?</span></div>
      </div>

      <button 
        onClick={handleSignUp}
        disabled={loading}
        className="w-full border border-slate-200 text-slate-600 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Create an Account
      </button>
    </div>
  )
}
