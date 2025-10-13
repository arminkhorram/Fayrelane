'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Hero() {
    const { user } = useAuth()

    return (
        <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Find Your Perfect
                        <span className="block text-yellow-300">Auto Parts</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
                        Buy and sell automotive parts, tools, and accessories on Fayrelane -
                        the trusted marketplace for car enthusiasts and professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="btn-primary btn-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    href="/listings"
                                    className="btn-secondary btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 transition-all duration-200"
                                >
                                    Browse Parts
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}





