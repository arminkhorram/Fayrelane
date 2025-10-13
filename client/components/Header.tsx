'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'
import { CartIcon, MenuIcon, UserIcon } from '@/components/Icons'

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, loading } = useAuth()
    const router = useRouter()

    const navigation = [
        { name: 'Browse', href: '/listings' },
        { name: 'Categories', href: '/categories' },
        { name: 'Sell', href: '/sell' },
    ]

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-900">Fayrelane</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-lg mx-8 hidden md:block">
                        <SearchBar />
                    </div>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                        ) : user ? (
                            <UserMenu user={user} />
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-primary btn-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-primary-600 p-2"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden border-t border-gray-200 px-4 py-3">
                <SearchBar />
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <MobileMenu
                    user={user}
                    navigation={navigation}
                    onClose={() => setMobileMenuOpen(false)}
                />
            )}
        </header>
    )
}





