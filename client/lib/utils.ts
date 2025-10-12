import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price)
}

export function formatDate(date: string | Date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: string | Date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validatePassword(password: string) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
}

export function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getConditionColor(condition: string) {
    const colors = {
        new: 'bg-green-100 text-green-800',
        like_new: 'bg-blue-100 text-blue-800',
        good: 'bg-yellow-100 text-yellow-800',
        fair: 'bg-orange-100 text-orange-800',
        poor: 'bg-red-100 text-red-800',
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function getConditionLabel(condition: string) {
    const labels = {
        new: 'New',
        like_new: 'Like New',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
    }
    return labels[condition as keyof typeof labels] || condition
}

export function getCategoryIcon(category: string) {
    const icons = {
        engine: '🔧',
        transmission: '⚙️',
        brakes: '🛑',
        suspension: '🚗',
        electrical: '⚡',
        body: '🚙',
        interior: '🪑',
        tools: '🔨',
        accessories: '✨',
    }
    return icons[category as keyof typeof icons] || '🔧'
}

export function getCategoryLabel(category: string) {
    const labels = {
        engine: 'Engine',
        transmission: 'Transmission',
        brakes: 'Brakes',
        suspension: 'Suspension',
        electrical: 'Electrical',
        body: 'Body',
        interior: 'Interior',
        tools: 'Tools',
        accessories: 'Accessories',
    }
    return labels[category as keyof typeof labels] || category
}

export function calculateShippingCost(weight: number, distance: number) {
    // Simple shipping calculation - in real app, this would use carrier APIs
    const baseRate = 5.99
    const weightRate = weight * 0.5
    const distanceRate = distance * 0.1
    return Math.round((baseRate + weightRate + distanceRate) * 100) / 100
}

export function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateId() {
    return Math.random().toString(36).substr(2, 9)
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}





