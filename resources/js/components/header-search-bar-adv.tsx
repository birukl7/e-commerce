"use client"

import type React from "react"
import { router, usePage } from "@inertiajs/react"
import { Clock, Search, TrendingUp, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Suggestion {
  text: string
  type: "product" | "category" | "brand"
}

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBarAdvanced({ placeholder = "Search for products...", className = "" }: SearchBarProps) {
  const { url } = usePage()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    console.log("🔄 SearchBar: Loading recent searches from localStorage")
    const saved = localStorage.getItem("recent_searches")
    if (saved) {
      const parsedSearches = JSON.parse(saved)
      console.log("✅ SearchBar: Loaded recent searches:", parsedSearches)
      setRecentSearches(parsedSearches)
    } else {
      console.log("ℹ️ SearchBar: No recent searches found in localStorage")
    }
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        console.log("👆 SearchBar: Clicked outside, closing suggestions")
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search suggestions using standard fetch
  useEffect(() => {
    console.log("🔍 SearchBar: Query changed to:", query)

    if (debounceRef.current) {
      console.log("⏰ SearchBar: Clearing previous debounce timeout")
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      console.log("📝 SearchBar: Query length >= 2, setting up debounced search")
      setIsLoading(true)

      debounceRef.current = setTimeout(async () => {
        console.log("🚀 SearchBar: Executing debounced search for:", query)
        const url = `/search/suggestions?q=${encodeURIComponent(query)}`
        console.log("📡 SearchBar: Making fetch request to:", url)

        try {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          console.log("✅ SearchBar: Suggestions fetch successful")
          console.log("📦 SearchBar: Received data:", data)

          const receivedSuggestions = data.suggestions || []

          console.log("💡 SearchBar: Received suggestions:", receivedSuggestions)
          console.log("📊 SearchBar: Suggestions count:", receivedSuggestions.length)

          setSuggestions(receivedSuggestions)
          setIsLoading(false)
          console.log("🔄 SearchBar: Updated suggestions state and stopped loading")
        } catch (error) {
          console.error("❌ SearchBar: Suggestions fetch failed")
          console.error("🚨 SearchBar: Error details:", error)
          setSuggestions([])
          setIsLoading(false)
          console.log("🔄 SearchBar: Cleared suggestions and stopped loading due to error")
        }
      }, 300)
    } else {
      console.log("📝 SearchBar: Query too short, clearing suggestions")
      setSuggestions([])
      setIsLoading(false)
    }

    return () => {
      if (debounceRef.current) {
        console.log("🧹 SearchBar: Cleanup - clearing debounce timeout")
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📝 SearchBar: Form submitted with query:", query)
    if (query.trim()) {
      performSearch(query.trim())
    } else {
      console.log("⚠️ SearchBar: Empty query, not performing search")
    }
  }

  const performSearch = (searchQuery: string) => {
    console.log("🔍 SearchBar: Performing search for:", searchQuery)

    // Add to recent searches
    const updatedRecentSearches = [searchQuery, ...recentSearches.filter((item) => item !== searchQuery)].slice(0, 5)
    console.log("💾 SearchBar: Updated recent searches:", updatedRecentSearches)

    setRecentSearches(updatedRecentSearches)
    localStorage.setItem("recent_searches", JSON.stringify(updatedRecentSearches))
    console.log("✅ SearchBar: Saved recent searches to localStorage")

    // Navigate using Inertia router
    console.log("🚀 SearchBar: Navigating to search results page")
    router.get(
      "/search",
      { q: searchQuery },
      {
        preserveState: false,
        preserveScroll: false,
        onStart: () => {
          console.log("🏁 SearchBar: Search navigation started")
        },
        onSuccess: () => {
          console.log("✅ SearchBar: Search navigation successful")
          setIsOpen(false)
          inputRef.current?.blur()
          console.log("🔄 SearchBar: Closed suggestions and blurred input")
        },
        onError: (errors) => {
          console.error("❌ SearchBar: Search navigation failed")
          console.error("🚨 SearchBar: Navigation error details:", errors)
        },
        onFinish: () => {
          console.log("🏁 SearchBar: Search navigation finished")
        },
      },
    )
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log("👆 SearchBar: Suggestion clicked:", suggestion)
    setQuery(suggestion.text)
    performSearch(suggestion.text)
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    console.log("👆 SearchBar: Recent search clicked:", searchTerm)
    setQuery(searchTerm)
    performSearch(searchTerm)
  }

  const clearRecentSearches = () => {
    console.log("🗑️ SearchBar: Clearing all recent searches")
    setRecentSearches([])
    localStorage.removeItem("recent_searches")
    console.log("✅ SearchBar: Recent searches cleared")
  }

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("🗑️ SearchBar: Removing recent search:", searchTerm)
    const updated = recentSearches.filter((item) => item !== searchTerm)
    setRecentSearches(updated)
    localStorage.setItem("recent_searches", JSON.stringify(updated))
    console.log("✅ SearchBar: Recent search removed, updated list:", updated)
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
    console.log("👆 SearchBar: Input focused, opening suggestions")
    setIsOpen(true)
  }

  const clearQuery = () => {
    console.log("🗑️ SearchBar: Clearing query")
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
    console.log("✅ SearchBar: Query cleared and input focused")
  }

  // Debug current state
  console.log(
    "🔄 SearchBar: Current state - query:",
    query,
    "isLoading:",
    isLoading,
    "suggestions:",
    suggestions.length,
    "isOpen:",
    isOpen,
  )

  return (
    <div ref={searchRef} className={`relative w-full`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-12 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
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
                  Recent Searches
                </h3>
                <button onClick={clearRecentSearches} className="text-xs text-gray-500 hover:text-gray-700">
                  Clear all
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
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-600">Searching...</p>
              <p className="mt-1 text-xs text-gray-400">Debug: Loading suggestions for "{query}"</p>
              <p className="mt-1 text-xs text-red-400">If this persists, check Network tab for errors</p>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="p-2">
              <div className="mb-2 px-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <TrendingUp className="h-4 w-4" />
                  Suggestions ({suggestions.length})
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
                      <span className="ml-2 text-xs text-gray-500 capitalize">in {suggestion.type}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">No suggestions found for "{query}"</p>
              <p className="mt-1 text-xs text-gray-400">
                Debug: Query length: {query.length}, Suggestions: {suggestions.length}
              </p>
              <button onClick={() => performSearch(query)} className="mt-2 text-sm text-primary hover:underline">
                Search anyway
              </button>
            </div>
          )}

          {/* Popular Searches */}
          {!query && recentSearches.length === 0 && (
            <div className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900">
                <TrendingUp className="h-4 w-4" />
                Popular Searches
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
              <p className="mt-2 text-xs text-gray-400">Debug: No query, no recent searches</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
