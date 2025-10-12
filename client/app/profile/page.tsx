'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { EditIcon, SettingsIcon, LogoutIcon } from '@/components/Icons'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    })

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const handleSave = () => {
        // TODO: Implement profile update
        setIsEditing(false)
    }

    if (!user) {
        router.push('/login')
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="btn-secondary btn-sm"
                            >
                                <EditIcon className="h-4 w-4 mr-2" />
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Profile Picture & Basic Info */}
                            <div className="md:col-span-1">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white font-bold text-2xl">
                                            {getInitials(user.firstName, user.lastName)}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-gray-600 capitalize">{user.role}</p>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="md:col-span-2">
                                <div className="space-y-6">
                                    <div>
                                        <label className="label">First Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className="input"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">Last Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                                className="input"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.lastName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                                className="input"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">Role</label>
                                        <p className="text-gray-900 capitalize">{user.role}</p>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleSave}
                                                className="btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card">
                        <div className="card-body text-center">
                            <SettingsIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                            <p className="text-gray-600 text-sm mb-4">Manage your account preferences</p>
                            <button className="btn-secondary w-full">Go to Settings</button>
                        </div>
                    </div>

                    {user.role === 'seller' && (
                        <div className="card">
                            <div className="card-body text-center">
                                <svg className="h-8 w-8 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Listings</h3>
                                <p className="text-gray-600 text-sm mb-4">Manage your automotive parts</p>
                                <button
                                    onClick={() => router.push('/dashboard/listings')}
                                    className="btn-secondary w-full"
                                >
                                    View Listings
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-body text-center">
                            <LogoutIcon className="h-8 w-8 text-red-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                            <p className="text-gray-600 text-sm mb-4">End your current session</p>
                            <button
                                onClick={handleLogout}
                                className="btn-error w-full"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
