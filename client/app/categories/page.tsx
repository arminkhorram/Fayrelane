'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getCategoryIcon, getCategoryLabel } from '@/lib/utils'

const categories = [
    { id: 'engine', name: 'Engine', icon: '🔧', description: 'Engine blocks, heads, components', count: 245 },
    { id: 'transmission', name: 'Transmission', icon: '⚙️', description: 'Transmissions, clutches, drivetrain', count: 189 },
    { id: 'brakes', name: 'Brakes', icon: '🛑', description: 'Brake pads, rotors, calipers', count: 156 },
    { id: 'suspension', name: 'Suspension', icon: '🚗', description: 'Shocks, struts, springs', count: 134 },
    { id: 'electrical', name: 'Electrical', icon: '⚡', description: 'Wiring, sensors, electronics', count: 98 },
    { id: 'body', name: 'Body', icon: '🚙', description: 'Panels, bumpers, trim', count: 167 },
    { id: 'interior', name: 'Interior', icon: '🪑', description: 'Seats, dash, trim pieces', count: 89 },
    { id: 'tools', name: 'Tools', icon: '🔨', description: 'Wrenches, sockets, specialty tools', count: 203 },
    { id: 'accessories', name: 'Accessories', icon: '✨', description: 'Lights, mirrors, custom parts', count: 145 },
]

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Browse Categories
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Find automotive parts organized by category. Each category contains thousands of quality parts from trusted sellers.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="max-w-md">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/listings?category=${category.id}`}
                            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <div className="card-body">
                                <div className="flex items-center mb-4">
                                    <div className="text-4xl mr-4 group-hover:scale-110 transition-transform duration-300">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-primary-600 font-medium">
                                            {category.count} listings
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {category.description}
                                </p>
                                <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                                    Browse Parts
                                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No categories found matching your search.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
