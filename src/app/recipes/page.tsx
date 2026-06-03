'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Filter, Clock, Flame, BookOpen, Sparkles, Loader2, X } from 'lucide-react'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProtein, setSelectedProtein] = useState('All')

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportUrlError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching recipes:', error)
      else setRecipes(data || [])
      setLoading(false)
    }
    fetchRecipes()
  }, [supabase])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importUrl) return
    
    setIsImporting(true)
    setImportUrlError(null)
    
    try {
      const res = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl, caption })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import')
      
      // Success! Refresh list and close modal
      const { data: newRecipes } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      
      setRecipes(newRecipes || [])
      setIsImportModalOpen(false)
      setImportUrl('')
      setCaption('')
    } catch (err: any) {
      setImportUrlError(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProtein =
      selectedProtein === 'All' || recipe.metadata?.primary_protein === selectedProtein
    return matchesSearch && matchesProtein
  })

  const proteins = ['All', ...Array.from(new Set(recipes.map(r => r.metadata?.primary_protein).filter(Boolean)))]

  return (
    <div className="space-y-10 pb-20">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cookbook</h1>
          <p className="text-stone-500 font-medium mt-1">{recipes.length} recipes curated for your household.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search recipes..."
              className="pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 w-full sm:w-64 transition-all shadow-sm text-slate-700 placeholder:text-stone-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
            <select
              className="pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 w-full sm:w-auto transition-all shadow-sm font-medium text-slate-600"
              value={selectedProtein}
              onChange={(e) => setSelectedProtein(e.target.value)}
            >
              {proteins.map(p => (
                <option key={p as string} value={p as string}>{p as string}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-stone-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredRecipes.map(recipe => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group relative rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-stone-400/20 transition-all duration-300 hover:-translate-y-1"
            >
              {recipe.image_url ? (
                /* Image card — full-bleed photo with gradient overlay */
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-900">
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/90 px-2 py-0.5 rounded text-white">
                        {recipe.macros_normalized?.calories || '—'} cal
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/90 px-2 py-0.5 rounded text-white border border-white/10">
                        {recipe.macros_normalized?.protein_g ? `${recipe.macros_normalized.protein_g}g Pro` : '—'}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-white">
                        {recipe.metadata?.prep_time_mins || '30'}m
                      </span>
                    </div>
                    <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-2 text-white group-hover:text-amber-200 transition-colors">
                      {recipe.title}
                    </h3>
                  </div>
                </div>
              ) : (
                /* No-image fallback — clean warm card */
                <div className="aspect-[4/5] bg-white border border-stone-200 rounded-2xl flex flex-col justify-between p-4 group-hover:border-orange-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-tighter text-stone-400">Yield</span>
                      <span className="text-[10px] font-bold text-stone-600 leading-none">2 Servings</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                        {recipe.macros_normalized?.calories || '—'} cal
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                        {recipe.macros_normalized?.protein_g || '—'}g Pro
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-tight text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-3">
                      {recipe.title}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.metadata?.prep_time_mins || '30'} min
                    </p>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
          <div className="max-w-xs mx-auto space-y-3">
            <Search className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No recipes found</h3>
            <p className="text-stone-500 text-sm font-medium">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedProtein('All') }}
              className="text-orange-600 font-bold text-sm hover:underline pt-2"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Magic Import FAB */}
      <button
        onClick={() => setIsImportModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-600 transition-all active:scale-95 group z-40"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Magic Import</h2>
                </div>
                <button
                  onClick={() => { setIsImportModalOpen(false); setImportUrl(''); setCaption('') }}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-500 font-medium leading-relaxed">
                Paste an Instagram or TikTok URL below, then add the caption for best results.
              </p>

              <form onSubmit={handleImport} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400">Social Media URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full p-4 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-orange-400 outline-none transition-all font-medium text-slate-600"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-400">Recipe Caption <span className="normal-case font-medium tracking-normal text-stone-400">(optional but recommended)</span></label>
                  <textarea
                    rows={4}
                    placeholder="Paste the caption or recipe text from the post..."
                    className="w-full p-4 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-orange-400 outline-none transition-all font-medium text-slate-600 resize-none"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <p className="text-xs text-amber-600 font-medium">Adding the caption prevents AI hallucination</p>
                </div>

                {importError && (
                  <p className="text-sm font-bold text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
                    {importError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isImporting}
                  className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gemini is watching...
                    </>
                  ) : (
                    "Import into Cookbook"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
