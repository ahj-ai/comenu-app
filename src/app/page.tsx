'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Sparkles, ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react'

export default function Home() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRecentRecipes() {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false })
      
      setRecipes(data || [])
      setLoading(false)
    }
    fetchRecentRecipes()
  }, [supabase])

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  return (
    <div className="space-y-12">
      {/* Hero / Welcome */}
      <section className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-400">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>AI-Powered Meal Planning</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            What's for dinner, <br /><span className="text-indigo-200">partner?</span>
          </h1>
          <p className="text-indigo-100 text-lg">
            CoMenu helps you and your household get ahead of the week with smart planning and a digital cookbook curated from your favorite inspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/planner" className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg">
              <Calendar className="w-5 h-5" />
              Plan Your Week
            </Link>
            <Link href="/recipes" className="bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-400 transition-colors border border-indigo-400">
              <BookOpen className="w-5 h-5" />
              Browse Cookbook
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-10 hidden lg:block">
          <UtensilsIcon size={200} />
        </div>
      </section>

      {/* Today's Feature */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Tonight's Menu ({today})
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-500 italic">No meal planned for tonight yet. Weekend is for planning!</p>
            <Link href="/planner" className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline group">
              Start the Fri-Sun planner 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
            Recently Added
          </h2>
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl"></div>)
            ) : (
              recipes.map(recipe => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md transition-shadow group">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors overflow-hidden">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold truncate text-slate-900">{recipe.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.metadata?.prep_time_mins || 30}m</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold text-[10px] border border-slate-200">{recipe.metadata?.primary_protein || 'Balanced'}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function UtensilsIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}
