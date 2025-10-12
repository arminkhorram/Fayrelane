'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { formatPrice, getConditionLabel, getConditionColor } from '@/lib/utils'
import { StarFilledIcon, HeartIcon, HeartFilledIcon, FilterIcon } from '@/components/Icons'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface Listing {
    id: string
    title: string
    price: number
    category: string
    condition: string
    make: string
    model: string
    year: number
    images: string[]
    seller: {
        id: string
        firstName: string
        lastName: string
        rating: number
        reviewCount: number
    }
    createdAt: string
}

export default function ListingsPage() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        make: '',
        model: '',
        year: '',
        minPrice: '',
        maxPrice: '',
        condition: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    })

    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize filters from URL params
    useEffect(() => {
        const urlFilters = {
            search: searchParams.get('search') || '',
            category: searchParams.get('category') || '',
            make: searchParams.get('make') || '',
            model: searchParams.get('model') || '',
            year: searchParams.get('year') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            condition: searchParams.get('condition') || '',
            sortBy: searchParams.get('sortBy') || 'created_at',
            sortOrder: searchParams.get('sortOrder') || 'DESC'
        }
        setFilters(urlFilters)
    }, [searchParams])

    const { data, isLoading, error } = useQuery(
        ['listings', filters],
        async () => {
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value)
            })

            const response = await api.get(`/listings?${params.toString()}`)
            return response.data
        },
        {
            keepPreviousData: true,
        }
    )

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)

        // Update URL
        const params = new URLSearchParams()
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.append(k, v)
        })

        router.push(`/listings?${params.toString()}`)
    }

    const toggleFavorite = (listingId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(listingId)) {
                newFavorites.delete(listingId)
            } else {
                newFavorites.add(listingId)
            }
            return newFavorites
        })
    }

    const categories = [
        'engine', 'transmission', 'brakes', 'suspension',
        'electrical', 'body', 'interior', 'tools', 'accessories'
    ]

    const conditions = ['new', 'like_new', 'good', 'fair', 'poor']

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                            </div>
                            <div className="card-body space-y-4">
                                {/* Search */}
                                <div>
                                    <label className="label">Search</label>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="input"
                                        placeholder="Search listings..."
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Make */}
                                <div>
                                    <label className="label">Make</label>
                                    <input
                                        type="text"
                                        value={filters.make}
                                        onChange={(e) => handleFilterChange('make', e.target.value)}
                                        className="input"
                                        placeholder="e.g., Honda, Toyota"
                                    />
                                </div>

                                {/* Model */}
                                <div>
                                    <label className="label">Model</label>
                                    <input
                                        type="text"
                                        value={filters.model}
                                        onChange={(e) => handleFilterChange('model', e.target.value)}
                                        className="input"
                                        placeholder="e.g., Civic, Camry"
                                    />
                                </div>

                                {/* Year */}
                                <div>
                                    <label className="label">Year</label>
                                    <input
                                        type="number"
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 2020"
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="label">Price Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="input"
                                            placeholder="Min"
                                        />
                                        <input
                                            type="number"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="input"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="label">Condition</label>
                                    <select
                                        value={filters.condition}
                                        onChange={(e) => handleFilterChange('condition', e.target.value)}
                                        className="input"
                                    >
                                        <option value="">All Conditions</option>
                                        {conditions.map(condition => (
                                            <option key={condition} value={condition}>
                                                {getConditionLabel(condition)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="label">Sort By</label>
                                    <select
                                        value={`${filters.sortBy}-${filters.sortOrder}`}
                                        onChange={(e) => {
                                            const [sortBy, sortOrder] = e.target.value.split('-')
                                            handleFilterChange('sortBy', sortBy)
                                            handleFilterChange('sortOrder', sortOrder)
                                        }}
                                        className="input"
                                    >
                                        <option value="created_at-DESC">Newest First</option>
                                        <option value="created_at-ASC">Oldest First</option>
                                        <option value="price-ASC">Price: Low to High</option>
                                        <option value="price-DESC">Price: High to Low</option>
                                        <option value="title-ASC">Title: A to Z</option>
                                        <option value="title-DESC">Title: Z to A</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                <button
                                    onClick={() => {
                                        setFilters({
                                            search: '', category: '', make: '', model: '', year: '',
                                            minPrice: '', maxPrice: '', condition: '', sortBy: 'created_at', sortOrder: 'DESC'
                                        })
                                        router.push('/listings')
                                    }}
                                    className="btn-secondary w-full"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Automotive Parts
                                </h1>
                                <p className="text-gray-600">
                                    {data?.pagination?.total || 0} listings found
                                </p>
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden btn-secondary"
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Filters
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <LoadingSpinner size="lg" />
                                <p className="mt-4 text-gray-600">Loading listings...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-600">Failed to load listings</p>
                            </div>
                        ) : !data?.listings?.length ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No listings found</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Try adjusting your filters or search terms
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.listings.map((listing: Listing) => (
                                    <div key={listing.id} className="card hover:shadow-lg transition-shadow duration-300">
                                        <div className="relative">
                                            <img
                                                src={listing.images[0] || '/placeholder-image.jpg'}
                                                alt={listing.title}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                            <button
                                                onClick={() => toggleFavorite(listing.id)}
                                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                            >
                                                {favorites.has(listing.id) ? (
                                                    <HeartFilledIcon className="h-5 w-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            <div className="absolute top-3 left-3">
                                                <span className={`badge ${getConditionColor(listing.condition)}`}>
                                                    {getConditionLabel(listing.condition)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                                    {listing.title}
                                                </h3>
                                                <span className="text-2xl font-bold text-primary-600 ml-2">
                                                    {formatPrice(listing.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                                <span>{listing.make} {listing.model}</span>
                                                {listing.year && <span className="mx-2">•</span>}
                                                {listing.year && <span>{listing.year}</span>}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarFilledIcon
                                                                key={i}
                                                                className={`h-4 w-4 ${i < Math.floor(listing.seller.rating)
                                                                        ? 'text-yellow-400'
                                                                        : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {listing.seller.rating.toFixed(1)} ({listing.seller.reviewCount})
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    by {listing.seller.firstName} {listing.seller.lastName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-footer">
                                            <a
                                                href={`/listings/${listing.id}`}
                                                className="btn-primary w-full text-center"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {data?.pagination && data.pagination.pages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="flex space-x-2">
                                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams)
                                                params.set('page', page.toString())
                                                router.push(`/listings?${params.toString()}`)
                                            }}
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${page === data.pagination.page
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}





