'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Filter, Clock, Flame, BookOpen } from 'lucide-react'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProtein, setSelectedProtein] = useState('All')

  const supabase = createClient()

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('title', { ascending: true })

      if (error) console.error('Error fetching recipes:', error)
      else setRecipes(data || [])
      setLoading(false)
    }
    fetchRecipes()
  }, [supabase])

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
                      {recipe.metadata?.primary_protein && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded border border-white/20 text-white">
                          {recipe.metadata.primary_protein}
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/90 px-2 py-0.5 rounded text-white">
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
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    {recipe.metadata?.primary_protein && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                        {recipe.metadata.primary_protein}
                      </span>
                    )}
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
    </div>
  )
}
