import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Fayrelane - Automotive Marketplace',
    description: 'Buy and sell automotive parts, tools, and accessories on Fayrelane marketplace',
    keywords: 'automotive, car parts, marketplace, buy, sell, tools, accessories',
    authors: [{ name: 'Fayrelane Team' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#3b82f6',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full`}>
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 5000,
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    )
}





