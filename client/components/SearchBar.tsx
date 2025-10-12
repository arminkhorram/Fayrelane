'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, XIcon } from '@/components/Icons'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
    placeholder?: string
    className?: string
}

export function SearchBar({ placeholder = 'Search automotive parts...', className = '' }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const router = useRouter()

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
            setShowSuggestions(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(query)
        }
    }

    const debouncedSearch = debounce((searchQuery: string) => {
        if (searchQuery.length > 2) {
            // In a real app, this would fetch suggestions from the API
            const mockSuggestions = [
                'Honda Civic engine',
                'Toyota Camry transmission',
                'BMW brake pads',
                'Ford F-150 suspension',
                'Chevrolet Silverado headlights',
            ].filter(suggestion =>
                suggestion.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setSuggestions(mockSuggestions)
            setShowSuggestions(true)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, 300)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        debouncedSearch(value)
    }

    const clearSearch = () => {
        setQuery('')
        setSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {query && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            onClick={clearSearch}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setQuery(suggestion)
                                handleSearch(suggestion)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}





