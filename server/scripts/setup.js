const { createTables } = require('./migrate')
const { seedDatabase } = require('./seed')

const setupDatabase = async () => {
    try {
        console.log('🚀 Setting up Fayrelane database...')

        // Create tables
        await createTables()

        // Seed with sample data
        await seedDatabase()

        console.log('✅ Database setup completed successfully!')
        console.log('\n📋 Next steps:')
        console.log('1. Start the server: npm run server')
        console.log('2. Start the client: npm run client')
        console.log('3. Visit http://localhost:3000')
        console.log('\n🔑 Sample accounts:')
        console.log('Admin: admin@fayrelane.com / admin123')
        console.log('Seller: john@example.com / password123')
        console.log('Buyer: alice@example.com / password123')

    } catch (error) {
        console.error('❌ Database setup failed:', error)
        process.exit(1)
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup completed')
            process.exit(0)
        })
        .catch((error) => {
            console.error('Setup failed:', error)
            process.exit(1)
        })
}

module.exports = { setupDatabase }





