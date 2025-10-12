'use client'

const steps = [
    {
        number: '01',
        title: 'Browse & Search',
        description: 'Find the perfect automotive parts using our advanced search and filtering system.',
        icon: '🔍',
    },
    {
        number: '02',
        title: 'Connect with Sellers',
        description: 'Message sellers directly to ask questions and negotiate prices.',
        icon: '💬',
    },
    {
        number: '03',
        title: 'Secure Payment',
        description: 'Complete your purchase with our secure payment system powered by Stripe.',
        icon: '💳',
    },
    {
        number: '04',
        title: 'Fast Shipping',
        description: 'Get your parts delivered quickly with our integrated shipping calculator.',
        icon: '📦',
    },
]

export function HowItWorks() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Getting started on Fayrelane is simple. Follow these four easy steps to find and purchase the automotive parts you need.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="text-center">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">{step.icon}</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {step.number}
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-gray-600">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="bg-primary-50 rounded-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Get Started?
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">
                            Join thousands of automotive enthusiasts and professionals on Fayrelane
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/register"
                                className="btn-primary btn-lg"
                            >
                                Sign Up Free
                            </a>
                            <a
                                href="/listings"
                                className="btn-secondary btn-lg"
                            >
                                Browse Parts
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}





