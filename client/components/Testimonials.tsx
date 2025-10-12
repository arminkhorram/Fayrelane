'use client'

import { StarFilledIcon } from '@/components/Icons'

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Auto Mechanic',
        location: 'Chicago, IL',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'Fayrelane has been a game-changer for my shop. I can find quality parts at great prices and the sellers are always responsive.',
    },
    {
        name: 'Mike Chen',
        role: 'Car Enthusiast',
        location: 'Los Angeles, CA',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'The search functionality is amazing. I found the exact transmission I needed for my project car in just a few minutes.',
    },
    {
        name: 'Emily Rodriguez',
        role: 'DIY Mechanic',
        location: 'Austin, TX',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'As someone who works on my own cars, Fayrelane has saved me thousands of dollars. The community is helpful and trustworthy.',
    },
    {
        name: 'David Thompson',
        role: 'Parts Dealer',
        location: 'Phoenix, AZ',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'Selling on Fayrelane is so easy. The platform handles payments securely and I can focus on what I do best - finding quality parts.',
    },
    {
        name: 'Lisa Wang',
        role: 'Restoration Specialist',
        location: 'Seattle, WA',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'I specialize in classic car restoration and Fayrelane has been invaluable for finding rare and vintage parts.',
    },
    {
        name: 'James Wilson',
        role: 'Fleet Manager',
        location: 'Miami, FL',
        image: '/placeholder-avatar.jpg',
        rating: 5,
        text: 'Managing a fleet of vehicles requires reliable parts sourcing. Fayrelane delivers every time with quality and speed.',
    },
]

export function Testimonials() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what real users have to say about their Fayrelane experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="card">
                            <div className="card-body">
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <StarFilledIcon
                                                key={i}
                                                className={`h-5 w-5 ${i < testimonial.rating
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <blockquote className="text-gray-700 mb-6">
                                    "{testimonial.text}"
                                </blockquote>

                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-gray-600 font-semibold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {testimonial.role}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {testimonial.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Join Our Community
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Over 5,000 satisfied customers trust Fayrelane for their automotive needs
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/register"
                                className="btn-primary btn-lg"
                            >
                                Start Shopping
                            </a>
                            <a
                                href="/sell"
                                className="btn-secondary btn-lg"
                            >
                                Start Selling
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}





