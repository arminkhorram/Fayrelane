'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PlusIcon, CheckIcon } from '@/components/Icons'

const features = [
    'List unlimited automotive parts',
    'Set your own prices',
    'Connect with buyers directly',
    'Secure payment processing',
    'Built-in messaging system',
    'Professional seller tools'
]

export default function SellPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleGetStarted = () => {
        if (!user) {
            router.push('/register?role=seller')
        } else {
            router.push('/dashboard/listings/new')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Start Selling on Fayrelane
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Join thousands of automotive parts sellers who trust Fayrelane to reach buyers worldwide.
                        List your parts, set your prices, and start selling today.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        disabled={isLoading}
                        className="btn-primary btn-lg bg-primary-600 hover:bg-primary-700"
                    >
                        {isLoading ? 'Loading...' : 'Start Selling Now'}
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div key={index} className="card text-center">
                            <div className="card-body">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckIcon className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Create Your Listing
                            </h3>
                            <p className="text-gray-600">
                                Upload photos, add descriptions, and set your price. Our easy-to-use listing tool guides you through the process.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Connect with Buyers
                            </h3>
                            <p className="text-gray-600">
                                Interested buyers can message you directly. Answer questions and negotiate prices through our secure messaging system.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Get Paid Securely
                            </h3>
                            <p className="text-gray-600">
                                Once a buyer commits, we handle the secure payment processing. You get paid quickly and safely.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-primary-600 rounded-lg p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Start Selling?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Join our community of trusted automotive parts sellers and start reaching buyers today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => router.push('/listings')}
                            className="btn-secondary btn-lg border-white text-white hover:bg-white hover:text-primary-600"
                        >
                            Browse Parts
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
