'use client'

import { useState, useEffect, useRef } from 'react'
import { nominatim, type NominatimResult } from '@/lib/supabase/database'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (location: { lat: number; lng: number; display: string }) => void
  placeholder?: string
  className?: string
  error?: string
  id?: string
}

export function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = "e.g. Auckland, Wellington",
  className = "",
  error,
  id
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim() && value.length >= 2) {
        searchLocations(value)
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  // Handle clicks outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = async (query: string) => {
    setIsLoading(true)
    try {
      const results = await nominatim.searchNZAddresses(query)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Location search failed:', error)
      setSuggestions([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleSuggestionClick = (result: NominatimResult) => {
    const displayName = nominatim.formatDisplayName(result)
    onChange(displayName)

    if (onLocationSelect) {
      onLocationSelect({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display: displayName
      })
    }

    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={placeholder}
          className={`${className} ${isLoading ? 'pr-8' : ''}`}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
          {suggestions.map((result, index) => {
            const displayName = nominatim.formatDisplayName(result)
            return (
              <button
                key={`${result.lat}-${result.lon}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(result)}
                className={`w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-purple-50' : ''
                }`}
              >
                <div className="text-sm text-gray-900">{displayName}</div>
                {result.address.city && (
                  <div className="text-xs text-gray-500">{result.address.city}</div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}