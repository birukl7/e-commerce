"use client"
import type React from "react"
import { router } from "@inertiajs/react"
import { Clock, Search, TrendingUp, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface Suggestion {
  text: string
  type: "product" | "category" | "brand"
}

interface SearchBarProps {
  placeholder?: string
  className?: string
  initialQuery?: string
}

export default function SearchBarAdvanced({
  placeholder = "",
  className = "",
  initialQuery = "",
}: SearchBarProps) {
  const { t } = useTranslation()
  const translatedPlaceholder = t('search.searchPlaceholder', { defaultValue: 'Search for products...' })
  const effectivePlaceholder = placeholder || translatedPlaceholder
  // const { url } = usePage()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
   
    const saved = localStorage.getItem("recent_searches")
    if (saved) {
      try {
        const parsedSearches = JSON.parse(saved)
        
        setRecentSearches(parsedSearches)
      } catch (error) {
        console.error("❌ SearchBar: Error parsing recent searches:", error)
        localStorage.removeItem("recent_searches")
      }
    } else {
      
    }
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
       
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    
    if (debounceRef.current) {
     
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
     
      setIsLoading(true)
      debounceRef.current = setTimeout(async () => {
       
        const url = `/search/suggestions?q=${encodeURIComponent(query)}`
      

        try {
          const response = await fetch(url, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
         

          const receivedSuggestions = data.suggestions || []
         

          setSuggestions(receivedSuggestions)
          setIsLoading(false)
        
        } catch (error) {
          console.error("❌ SearchBar: Suggestions fetch failed")
          console.error("🚨 SearchBar: Error details:", error)
          setSuggestions([])
          setIsLoading(false)
       
        }
      }, 300)
    } else {
    
      setSuggestions([])
      setIsLoading(false)
    }

    return () => {
      if (debounceRef.current) {
      
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (query.trim()) {
      performSearch(query.trim())
    } 
  }

  const performSearch = (searchQuery: string) => {
   

    // Add to recent searches
    const updatedRecentSearches = [searchQuery, ...recentSearches.filter((item) => item !== searchQuery)].slice(0, 5)

  
    setRecentSearches(updatedRecentSearches)
    localStorage.setItem("recent_searches", JSON.stringify(updatedRecentSearches))
   

    // Close suggestions and blur input
    setIsOpen(false)
    inputRef.current?.blur()

    // Navigate using Inertia router
   
    router.visit(`/search?q=${encodeURIComponent(searchQuery)}`, {
      method: "get",
      preserveState: false,
      preserveScroll: false,
     
    
      onError: (errors) => {
        console.error("❌ SearchBar: Search navigation failed")
        console.error("🚨 SearchBar: Navigation error details:", errors)
      },
  
    })
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
   
    setQuery(suggestion.text)
    performSearch(suggestion.text)
  }

  const handleRecentSearchClick = (searchTerm: string) => {
   
    setQuery(searchTerm)
    performSearch(searchTerm)
  }

  const clearRecentSearches = () => {
  
    setRecentSearches([])
    localStorage.removeItem("recent_searches")
   
  }

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const updated = recentSearches.filter((item) => item !== searchTerm)
    setRecentSearches(updated)
    localStorage.setItem("recent_searches", JSON.stringify(updated))
 
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "category":
        return "📁"
      case "brand":
        return "🏷️"
      default:
        return "🔍"
    }
  }

  const handleInputFocus = () => {
   
    setIsOpen(true)
  }

  const clearQuery = () => {
 
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
   
  }



  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={effectivePlaceholder}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-12 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Clock className="h-4 w-4" />
                  {t('search.recentSearches', { defaultValue: 'Recent Searches' })}
                </h3>
                <button onClick={clearRecentSearches} className="text-xs text-gray-500 hover:text-gray-700">
                  {t('search.clearAll', { defaultValue: 'Clear all' })}
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((searchTerm, index) => (
                  <div
                    key={index}
                    className="group flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-50"
                    onClick={() => handleRecentSearchClick(searchTerm)}
                  >
                    <span className="text-sm text-gray-700">{searchTerm}</span>
                    <button
                      onClick={(e) => removeRecentSearch(searchTerm, e)}
                      className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && query && (
            <div className="p-4 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-600">{t('search.searching', { defaultValue: 'Searching...' })}</p>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="p-2">
              <div className="mb-2 px-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <TrendingUp className="h-4 w-4" />
                  {t('search.suggestions', { defaultValue: 'Suggestions' })} ({suggestions.length})
                </h3>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex w-full items-center gap-3 rounded p-2 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{suggestion.text}</span>
                      <span className="ml-2 text-xs text-gray-500 capitalize">
                        {t('search.inType', { type: suggestion.type, defaultValue: 'in {{type}}s' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">{t('search.noSuggestions', { query, defaultValue: 'No suggestions found for "{{query}}"' })}</p>
              <button onClick={() => performSearch(query)} className="mt-2 text-sm text-blue-600 hover:underline">
                {t('search.searchAnyway', { defaultValue: 'Search anyway' })}
              </button>
            </div>
          )}

          {/* Popular Searches */}
          {!query && recentSearches.length === 0 && (
            <div className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900">
                <TrendingUp className="h-4 w-4" />
                {t('search.popularSearches', { defaultValue: 'Popular Searches' })}
              </h3>
              <div className="space-y-1">
                {["Electronics", "Clothing", "Books", "Home & Garden", "Sports"].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(term)}
                    className="block w-full rounded p-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
