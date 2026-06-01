'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase'
import { ChevronLeft, Clock, Flame, ChefHat, Video, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching recipe:', error)
      } else {
        setRecipe(data)
      }
      setLoading(false)
    }

    fetchRecipe()
  }, [id, supabase])

  if (loading) {
    return <div className="animate-pulse space-y-8 pt-10">
      <div className="h-8 bg-slate-800 w-1/4 rounded"></div>
      <div className="h-96 bg-slate-800 rounded-2xl"></div>
    </div>
  }

  if (!recipe) {
    return <div className="text-center py-20 text-slate-400">Recipe not found.</div>
  }

  return (
    <div className="space-y-8 pb-20 pt-4">
      <Link href="/recipes" className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Cookbook</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {recipe.title}
            </h1>
            {recipe.image_url && (
              <div className="mt-6 rounded-3xl overflow-hidden aspect-video border border-slate-800">
                <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-lg md:text-xl text-slate-400 mt-6 leading-relaxed font-medium">
              {recipe.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 py-8 border-y border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
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
                <p className="font-bold text-slate-200">{recipe.macros_normalized?.protein_g ? `${recipe.macros_normalized.protein_g}g` : (recipe.metadata?.primary_protein || 'Balanced')}</p>
              </div>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Instructions
            </h2>
            <div className="space-y-8">
              {recipe.steps?.map((step: string, index: number) => (
                <div key={index} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-1 font-medium text-lg">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-white mb-6 flex items-center justify-between">
              Ingredients
              <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
                {recipe.ingredients?.length || 0} items
              </span>
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients?.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-slate-300 text-sm font-medium leading-relaxed group">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                  <span className="group-hover:text-white transition-colors">{ingredient}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-10 space-y-3">
              <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]">
                Add to Weekly Plan
              </button>
              
              {/* Optional: Placeholder for IG link since it's not in our current DB schema yet */}
              {recipe.metadata?.instagram_url && (
                <a 
                  href={recipe.metadata.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <Video className="w-4 h-4" />
                  View Original Video
                </a>
              )}
            </div>
          </section>

          {recipe.tags?.culinary_structure && (
            <div className="flex flex-wrap gap-2 pt-4">
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
