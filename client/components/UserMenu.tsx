'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, DashboardIcon, MessageIcon } from '@/components/Icons'
import { getInitials } from '@/lib/utils'

interface UserMenuProps {
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        role: string
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        logout()
        setIsOpen(false)
    }

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: DashboardIcon,
        },
        {
            name: 'Messages',
            href: '/messages',
            icon: MessageIcon,
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: SettingsIcon,
        },
    ]

    // Add role-specific menu items
    if (user.role === 'seller' || user.role === 'admin') {
        menuItems.splice(1, 0, {
            name: 'My Listings',
            href: '/dashboard/listings',
            icon: SettingsIcon,
        })
    }

    if (user.role === 'admin') {
        menuItems.push({
            name: 'Admin Panel',
            href: '/admin',
            icon: SettingsIcon,
        })
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                        {getInitials(user.firstName, user.lastName)}
                    </span>
                </div>
                <span className="hidden lg:block text-gray-700 font-medium">
                    {user.firstName}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                            {item.name}
                        </Link>
                    ))}

                    <div className="border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <LogoutIcon className="h-4 w-4 mr-3 text-gray-400" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}





