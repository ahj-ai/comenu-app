'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Calendar as CalendarIcon, CheckCircle2, Heart, Clock, Utensils, Zap, Flame, Leaf, AlertCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const MOODS = [
  { id: 'busy', label: 'Busy & Quick', icon: <Zap className="w-4 h-4" /> },
  { id: 'cozy', label: 'Cozy & Comfort', icon: <Heart className="w-4 h-4" /> },
  { id: 'spicy', label: 'Spicy & Bold', icon: <Flame className="w-4 h-4" /> },
  { id: 'fresh', label: 'Fresh & Light', icon: <Leaf className="w-4 h-4" /> },
  { id: 'fancy', label: 'Fancy Dinner', icon: <Utensils className="w-4 h-4" /> },
  { id: 'lazy', label: 'Lazy Cleanup', icon: <Clock className="w-4 h-4" /> },
]

const PANTRY = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'salmon', label: 'Salmon' },
  { id: 'tofu', label: 'Tofu' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'rice', label: 'Rice' },
]

const OPTIMIZATIONS = [
  { id: 'high protein', label: 'High Protein' },
  { id: 'low calorie', label: 'Low Calorie' },
  { id: 'quick & easy', label: 'Quick & Easy' },
  { id: 'balanced', label: 'Balanced' },
]

export default function PlannerPage() {
  const [step, setStep] = useState<'questions' | 'loading' | 'results'>('questions')
  const [selections, setSelections] = useState({
    moods: [] as string[],
    ingredients: [] as string[],
    optimization: 'high protein'
  })
  const [plan, setPlan] = useState<any>(null)
  const [lockState, setLockState] = useState<'idle' | 'locking' | 'locked' | 'error'>('idle')

  const toggleSelection = (category: 'moods' | 'ingredients', id: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(i => i !== id)
        : [...prev[category], id]
    }))
  }

  const handleLockIn = async () => {
    setLockState('locking')
    try {
      const res = await fetch('/api/lock-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.plan, summary: plan.summary })
      })
      if (!res.ok) throw new Error('Failed to save')
      setLockState('locked')
    } catch {
      setLockState('error')
    }
  }

  const handleStartPlanning = async () => {
    setStep('loading')
    setPlan(null)
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: selections.moods.join(', '),
          ingredients: selections.ingredients.join(', '),
          optimization: selections.optimization
        })
      })
      const data = await res.json()
      setPlan(data)
      setStep('results')
    } catch (err) {
      console.error(err)
      setPlan({ error: "Failed to connect to the planning service." })
      setStep('results')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
          <Sparkles className="text-amber-500 w-8 h-8" />
          Weekly Planner
        </h1>
        <p className="text-stone-500">Tap what you're feeling and let Gemini do the rest.</p>
      </div>

      {step === 'questions' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm space-y-10">
          <div className="space-y-4">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">How are you feeling?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => toggleSelection('moods', mood.label)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${
                    selections.moods.includes(mood.label)
                      ? 'border-orange-500 bg-amber-50 text-orange-700 ring-2 ring-orange-500/10'
                      : 'border-stone-100 hover:border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  {mood.icon}
                  <span className="text-xs font-bold">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">What's in the pantry?</label>
            <div className="flex flex-wrap gap-2">
              {PANTRY.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleSelection('ingredients', item.label)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selections.ingredients.includes(item.label)
                      ? 'border-orange-600 bg-orange-600 text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Optimize for:</label>
            <div className="grid grid-cols-2 gap-3">
              {OPTIMIZATIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelections({ ...selections, optimization: opt.id })}
                  className={`p-4 rounded-xl border text-sm font-bold transition-all ${
                    selections.optimization === opt.id
                      ? 'border-orange-500 bg-amber-50 text-orange-700'
                      : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartPlanning}
            className="w-full bg-orange-600 text-white font-bold py-5 rounded-2xl hover:bg-orange-700 transition-colors shadow-xl shadow-orange-100 flex items-center justify-center gap-2 text-lg"
          >
            Build My Weekly Menu
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center py-24 space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <p className="text-xl font-bold text-slate-800">Gemini is picking your meals...</p>
          <p className="text-stone-500 max-w-xs mx-auto text-sm">Reviewing 47 recipes to find the perfect match for your mood.</p>
        </div>
      )}

      {step === 'results' && plan && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {plan.error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900">Planning Failed</h3>
                <p className="text-red-700 mt-2 font-medium">{plan.error}</p>
                {plan.raw && (
                  <pre className="mt-4 p-3 bg-red-100/50 rounded text-[10px] text-left overflow-auto max-h-32 text-red-800">
                    {plan.raw}
                  </pre>
                )}
              </div>
              <button
                onClick={() => setStep('questions')}
                className="bg-white border border-red-200 text-red-700 font-bold px-8 py-3 rounded-xl hover:bg-red-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Gemini's Recommendations:</h3>
                <p className="text-slate-700 italic leading-relaxed">"{plan.summary}"</p>
              </div>

              <div className="space-y-4">
                {plan?.plan?.map((item: any) => (
                  <div key={item.day} className="bg-white border border-stone-200 rounded-2xl p-6 flex items-start gap-5 shadow-sm hover:border-orange-300 transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors border border-stone-100">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{item.day?.slice(0, 3)}</span>
                      <CalendarIcon className="w-5 h-5 text-stone-300 group-hover:text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xl text-slate-800">{item.recipe_title}</h4>
                        <Link href={`/recipes/${item.recipe_id}`} className="text-xs text-orange-600 font-bold hover:underline bg-amber-50 px-2 py-1 rounded">View</Link>
                      </div>
                      <p className="text-sm text-stone-500 leading-snug">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => { setStep('questions'); setLockState('idle') }}
                  className="flex-1 py-4 border border-stone-200 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Start Over
                </button>

                {lockState === 'locked' ? (
                  <div className="flex-[2] bg-emerald-50 border border-emerald-200 rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-emerald-700">Week Locked In!</span>
                    <span className="text-emerald-500 text-sm font-medium">Grocery list saved.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleLockIn}
                    disabled={lockState === 'locking'}
                    className="flex-[2] bg-orange-600 text-white font-black py-4 rounded-2xl hover:bg-orange-700 disabled:opacity-70 transition-colors shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
                  >
                    {lockState === 'locking' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                    ) : lockState === 'error' ? (
                      <><AlertCircle className="w-5 h-5" /> Try Again</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Lock In This Week</>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
