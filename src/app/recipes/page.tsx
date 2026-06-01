'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Filter, Clock, Flame } from 'lucide-react'

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
      
      if (error) {
        console.error('Error fetching recipes:', error)
      } else {
        setRecipes(data || [])
      }
      setLoading(false)
    }

    fetchRecipes()
  }, [supabase])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProtein = selectedProtein === 'All' || 
                           recipe.metadata?.primary_protein === selectedProtein
    
    return matchesSearch && matchesProtein
  })

  const proteins = ['All', ...Array.from(new Set(recipes.map(r => r.metadata?.primary_protein).filter(Boolean)))]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cookbook</h1>
          <p className="text-slate-500">Discover your saved recipes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search recipes..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <Link 
              key={recipe.id} 
              href={`/recipes/${recipe.id}`}
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              {recipe.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-300">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{recipe.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{recipe.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{recipe.metadata?.prep_time_mins || '30'}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-slate-400" />
                    <span>{recipe.macros_normalized?.calories || 'Low'} cal</span>
                  </div>
                  {recipe.metadata?.primary_protein && (
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {recipe.metadata.primary_protein}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap gap-1">
                  {recipe.tags?.culinary_structure?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
          <p className="text-slate-500">No recipes found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
