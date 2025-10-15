'use client'

import Link from 'next/link'
import { LogoutIcon, DashboardIcon, MessageIcon, SettingsIcon } from '@/components/Icons'
import { getInitials } from '@/lib/utils'

interface MobileMenuProps {
    user: any
    navigation: Array<{ name: string; href: string }>
    currentPath: string
    onClose: () => void
}

const getLinkClasses = (href: string, currentPath: string) => {
    const isActive = href === '/' ? currentPath === '/' : currentPath.startsWith(href)

    return [
        'block px-3 py-2 rounded-md text-base font-medium transition-colors',
        isActive
            ? 'text-primary-600'
            : 'text-gray-700 hover:text-primary-600'
    ].join(' ')
}

export function MobileMenu({ user, navigation, currentPath, onClose }: MobileMenuProps) {
    const handleLogout = () => {
        // Logout logic would be handled by parent component
        onClose()
    }

    return (
        <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                {/* Navigation Links */}
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={getLinkClasses(item.href, currentPath)}
                    >
                        {item.name}
                    </Link>
                ))}

                {/* User Section */}
                {user ? (
                    <>
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center px-3">
                                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {getInitials(user.firstName, user.lastName)}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-base font-medium text-gray-800">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <Link
                                    href="/dashboard"
                                    onClick={onClose}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                >
                                    <DashboardIcon className="h-5 w-5 mr-3" />
                                    Dashboard
                                </Link>

                                <Link
                                    href="/messages"
                                    onClick={onClose}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                >
                                    <MessageIcon className="h-5 w-5 mr-3" />
                                    Messages
                                </Link>

                                {(user.role === 'seller' || user.role === 'admin') && (
                                    <Link
                                        href="/dashboard/listings"
                                        onClick={onClose}
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                    >
                                        <SettingsIcon className="h-5 w-5 mr-3" />
                                        My Listings
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                    >
                                        <SettingsIcon className="h-5 w-5 mr-3" />
                                        Admin Panel
                                    </Link>
                                )}

                                <Link
                                    href="/settings"
                                    onClick={onClose}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                >
                                    <SettingsIcon className="h-5 w-5 mr-3" />
                                    Settings
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                            >
                                <LogoutIcon className="h-5 w-5 mr-3" />
                                Sign out
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="border-t border-gray-200 pt-4 space-y-1">
                        <Link
                            href="/login"
                            onClick={onClose}
                            className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            onClick={onClose}
                            className="bg-primary-600 text-white hover:bg-primary-700 block px-3 py-2 rounded-md text-base font-medium text-center"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}





