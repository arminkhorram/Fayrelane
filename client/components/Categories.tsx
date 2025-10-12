'use client'

import Link from 'next/link'
import { getCategoryIcon, getCategoryLabel } from '@/lib/utils'

const categories = [
    { id: 'engine', name: 'Engine', icon: '🔧', description: 'Engine blocks, heads, components' },
    { id: 'transmission', name: 'Transmission', icon: '⚙️', description: 'Transmissions, clutches, drivetrain' },
    { id: 'brakes', name: 'Brakes', icon: '🛑', description: 'Brake pads, rotors, calipers' },
    { id: 'suspension', name: 'Suspension', icon: '🚗', description: 'Shocks, struts, springs' },
    { id: 'electrical', name: 'Electrical', icon: '⚡', description: 'Wiring, sensors, electronics' },
    { id: 'body', name: 'Body', icon: '🚙', description: 'Panels, bumpers, trim' },
    { id: 'interior', name: 'Interior', icon: '🪑', description: 'Seats, dash, trim pieces' },
    { id: 'tools', name: 'Tools', icon: '🔨', description: 'Wrenches, sockets, specialty tools' },
    { id: 'accessories', name: 'Accessories', icon: '✨', description: 'Lights, mirrors, custom parts' },
]

export function Categories() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Find exactly what you need with our organized categories
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/listings?category=${category.id}`}
                            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <div className="card-body text-center">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {category.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/categories"
                        className="btn-primary btn-lg"
                    >
                        View All Categories
                    </Link>
                </div>
            </div>
        </section>
    )
}





