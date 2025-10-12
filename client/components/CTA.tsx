'use client'

import Link from 'next/link'

export function CTA() {
    return (
        <section className="py-16 bg-primary-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Find Your Perfect Auto Parts?
                </h2>
                <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of automotive enthusiasts and professionals who trust Fayrelane for their parts needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/register"
                        className="btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/listings"
                        className="btn-secondary btn-lg border-white text-white hover:bg-white hover:text-primary-600"
                    >
                        Browse Parts
                    </Link>
                </div>
            </div>
        </section>
    )
}





