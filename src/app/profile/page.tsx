'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, LogOut, Home } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="animate-pulse h-20 bg-slate-200 rounded-xl"></div>

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-lg">{user.email}</p>
            <p className="text-sm text-slate-500">Household Member</p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              <span>Household Settings</span>
            </div>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors text-red-600 font-medium"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
