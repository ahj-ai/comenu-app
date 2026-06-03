'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Clock, Flame, ChefHat, Video, Play, X, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from 'next/link'

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cookMode, setCookMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [myRating, setMyRating] = useState<1 | -1 | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single()
      if (error) console.error('Error fetching recipe:', error)
      else setRecipe(data)
      setLoading(false)
    }
    fetchRecipe()
  }, [id, supabase])

  useEffect(() => {
    if (!recipe) return
    fetch(`/api/rate-recipe?recipeId=${recipe.id}`)
      .then(r => r.json())
      .then(data => { if (data.rating) setMyRating(data.rating) })
      .catch(() => {})
  }, [recipe])

  // Wake Lock — keep screen on while cooking
  useEffect(() => {
    if (!cookMode) return
    let wakeLock: WakeLockSentinel | null = null
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(wl => { wakeLock = wl }).catch(() => {})
    }
    document.body.style.overflow = 'hidden'
    return () => {
      wakeLock?.release()
      document.body.style.overflow = ''
    }
  }, [cookMode])

  const exitCookMode = () => {
    setCookMode(false)
    setCurrentStep(0)
  }

  const handleRate = async (rating: 1 | -1) => {
    const newRating: 1 | -1 | null = myRating === rating ? null : rating
    const prev = myRating
    setMyRating(newRating)
    try {
      const res = await fetch('/api/rate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id, rating: newRating })
      })
      if (!res.ok) setMyRating(prev)
    } catch {
      setMyRating(prev)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 pt-4">
        <div className="h-5 bg-slate-800 w-32 rounded"></div>
        <div className="h-[420px] bg-slate-800 rounded-3xl"></div>
      </div>
    )
  }

  if (!recipe) {
    return <div className="text-center py-20 text-slate-400">Recipe not found.</div>
  }

  const steps: string[] = recipe.steps || []

  return (
    <div className="space-y-8 pb-20 pt-4">

      {/* ── Cook Mode Overlay ── */}
      {cookMode && steps.length > 0 && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col p-6 md:p-14">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-1">{recipe.title}</p>
              <p className="text-stone-400 text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={exitCookMode}
              className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold"
            >
              <X className="w-4 h-4" /> Exit
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full mb-12">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step text */}
          <div className="flex-1 flex items-center">
            <p className="text-2xl md:text-4xl lg:text-5xl text-white font-medium leading-relaxed">
              {steps[currentStep]}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-10">
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex-1 py-4 border border-slate-700 rounded-2xl font-bold text-stone-400 hover:text-white hover:border-slate-500 disabled:opacity-25 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={() => {
                if (currentStep === steps.length - 1) exitCookMode()
                else setCurrentStep(s => s + 1)
              }}
              className="flex-[3] py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-orange-900/30"
            >
              {currentStep === steps.length - 1
                ? <span>All done! 🎉</span>
                : <><span>Next Step</span><ChevronRight className="w-5 h-5" /></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Back link ── */}
      <Link href="/recipes" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" />
        Back to Cookbook
      </Link>

      {/* ── Full-bleed hero ── */}
      <div className="relative rounded-3xl overflow-hidden h-[320px] md:h-[460px] bg-slate-900 border border-slate-800">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <ChefHat className="w-20 h-20 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {recipe.title}
          </h1>
          <p className="text-slate-300 mt-3 text-base md:text-lg leading-relaxed max-w-2xl line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex flex-wrap gap-4 md:gap-8 py-6 border-y border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Prep Time</p>
            <p className="font-bold text-slate-200">{recipe.metadata?.prep_time_mins || '30'} mins</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Calories</p>
            <p className="font-bold text-slate-200">{recipe.macros_normalized?.calories || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Protein</p>
            <p className="font-bold text-slate-200">
              {recipe.macros_normalized?.protein_g
                ? `${recipe.macros_normalized.protein_g}g`
                : recipe.metadata?.primary_protein || 'Balanced'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Instructions */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Instructions
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-5 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
                  {index + 1}
                </div>
                <p className="text-slate-300 leading-relaxed pt-1 font-medium text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 lg:sticky lg:top-24 space-y-4">

            {/* Start Cooking */}
            {steps.length > 0 && (
              <button
                onClick={() => { setCurrentStep(0); setCookMode(true) }}
                className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Cooking
              </button>
            )}

            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-black text-white mb-4 flex items-center justify-between">
                Ingredients
                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
                  {recipe.ingredients?.length || 0} items
                </span>
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients?.map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300 text-sm font-medium leading-relaxed group">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                    <span className="group-hover:text-white transition-colors">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700 text-sm">
              Add to Weekly Plan
            </button>

            {recipe.metadata?.instagram_url && (
              <a
                href={recipe.metadata.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 text-sm"
              >
                <Video className="w-4 h-4" />
                View Original Video
              </a>
            )}

            {/* We Made This */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">We Made This?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRate(1)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    myRating === 1
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Loved it
                </button>
                <button
                  onClick={() => handleRate(-1)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    myRating === -1
                      ? 'bg-red-500/15 border-red-500/40 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500/40 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not for us
                </button>
              </div>
            </div>
          </section>

          {recipe.tags?.culinary_structure && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.culinary_structure.map((tag: string) => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-slate-800/50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-800">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
