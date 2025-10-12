'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your automotive marketplace activities
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Quick Stats */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Listings</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Messages</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Orders</span>
                                    <span className="font-semibold">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <a
                                    href="/listings/new"
                                    className="btn-primary w-full text-center block"
                                >
                                    Create Listing
                                </a>
                                <a
                                    href="/listings"
                                    className="btn-secondary w-full text-center block"
                                >
                                    Browse Parts
                                </a>
                                <a
                                    href="/messages"
                                    className="btn-secondary w-full text-center block"
                                >
                                    View Messages
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="card">
                        <div className="card-body">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Account Info
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Role</span>
                                    <span className="font-semibold capitalize">{user.role}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email</span>
                                    <span className="font-semibold text-sm">{user.email}</span>
                                </div>
                                <a
                                    href="/settings"
                                    className="btn-secondary w-full text-center block mt-4"
                                >
                                    Settings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Activity
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="text-center py-8">
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Your activity will appear here
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}





