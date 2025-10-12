import { Suspense } from 'react'
import { Hero } from '@/components/Hero'
import { FeaturedListings } from '@/components/FeaturedListings'
import { Categories } from '@/components/Categories'
import { HowItWorks } from '@/components/HowItWorks'
import { Testimonials } from '@/components/Testimonials'
import { CTA } from '@/components/CTA'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                <Suspense fallback={<LoadingSpinner />}>
                    <Hero />
                    <FeaturedListings />
                    <Categories />
                    <HowItWorks />
                    <Testimonials />
                    <CTA />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}





