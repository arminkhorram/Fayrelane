'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from 'react-query'
import { api } from '@/lib/api'
import { formatPrice, getConditionLabel, getConditionColor } from '@/lib/utils'
import { StarFilledIcon, StarIcon, HeartIcon, HeartFilledIcon } from '@/components/Icons'
import { LoadingSpinner } from '@/components/LoadingSpinner'

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

export function FeaturedListings() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    const { data: listings, isLoading, error } = useQuery(
        'featured-listings',
        async () => {
            const response = await api.get('/listings?limit=6&sortBy=created_at&sortOrder=DESC')
            return response.data.listings
        },
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    )

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

    if (isLoading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600">Loading featured listings...</p>
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-red-600">Failed to load featured listings</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Featured Listings
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the latest automotive parts and accessories from trusted sellers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings?.map((listing: Listing) => (
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
                                <Link
                                    href={`/listings/${listing.id}`}
                                    className="btn-primary w-full text-center"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/listings"
                        className="btn-primary btn-lg"
                    >
                        View All Listings
                    </Link>
                </div>
            </div>
        </section>
    )
}





