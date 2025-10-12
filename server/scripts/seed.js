const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 12);
        const adminResult = await query(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['admin@fayrelane.com', adminPassword, 'Admin', 'User', 'admin', true]);

        let adminId;
        if (adminResult.rows.length > 0) {
            adminId = adminResult.rows[0].id;
            console.log('✅ Admin user created');
        } else {
            const existingAdmin = await query('SELECT id FROM users WHERE email = $1', ['admin@fayrelane.com']);
            adminId = existingAdmin.rows[0].id;
            console.log('✅ Admin user already exists');
        }

        // Create sample sellers
        const sellers = [
            {
                email: 'john@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Smith',
                role: 'seller'
            },
            {
                email: 'sarah@example.com',
                password: 'password123',
                firstName: 'Sarah',
                lastName: 'Johnson',
                role: 'seller'
            },
            {
                email: 'mike@example.com',
                password: 'password123',
                firstName: 'Mike',
                lastName: 'Wilson',
                role: 'seller'
            }
        ];

        const sellerIds = [];
        for (const seller of sellers) {
            const hashedPassword = await bcrypt.hash(seller.password, 12);
            const result = await query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [seller.email, hashedPassword, seller.firstName, seller.lastName, seller.role, true]);

            if (result.rows.length > 0) {
                sellerIds.push(result.rows[0].id);
                console.log(`✅ Seller ${seller.firstName} ${seller.lastName} created`);
            } else {
                const existingSeller = await query('SELECT id FROM users WHERE email = $1', [seller.email]);
                sellerIds.push(existingSeller.rows[0].id);
                console.log(`✅ Seller ${seller.firstName} ${seller.lastName} already exists`);
            }
        }

        // Create sample buyers
        const buyers = [
            {
                email: 'alice@example.com',
                password: 'password123',
                firstName: 'Alice',
                lastName: 'Brown',
                role: 'buyer'
            },
            {
                email: 'bob@example.com',
                password: 'password123',
                firstName: 'Bob',
                lastName: 'Davis',
                role: 'buyer'
            }
        ];

        const buyerIds = [];
        for (const buyer of buyers) {
            const hashedPassword = await bcrypt.hash(buyer.password, 12);
            const result = await query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [buyer.email, hashedPassword, buyer.firstName, buyer.lastName, buyer.role, true]);

            if (result.rows.length > 0) {
                buyerIds.push(result.rows[0].id);
                console.log(`✅ Buyer ${buyer.firstName} ${buyer.lastName} created`);
            } else {
                const existingBuyer = await query('SELECT id FROM users WHERE email = $1', [buyer.email]);
                buyerIds.push(existingBuyer.rows[0].id);
                console.log(`✅ Buyer ${buyer.firstName} ${buyer.lastName} already exists`);
            }
        }

        // Create sample listings
        const listings = [
            {
                sellerId: sellerIds[0],
                title: 'Honda Civic Engine Block - 2018',
                description: 'Low mileage engine block from 2018 Honda Civic. Perfect condition, no issues. Great for rebuild or replacement.',
                price: 1200.00,
                category: 'engine',
                condition: 'good',
                make: 'Honda',
                model: 'Civic',
                year: 2018,
                images: ['https://example.com/engine1.jpg', 'https://example.com/engine2.jpg']
            },
            {
                sellerId: sellerIds[0],
                title: 'Toyota Camry Transmission - 2019',
                description: 'Automatic transmission from 2019 Toyota Camry. 50k miles, shifts smoothly. Includes torque converter.',
                price: 1800.00,
                category: 'transmission',
                condition: 'like_new',
                make: 'Toyota',
                model: 'Camry',
                year: 2019,
                images: ['https://example.com/transmission1.jpg']
            },
            {
                sellerId: sellerIds[1],
                title: 'BMW 3 Series Brake Rotors - Set of 4',
                description: 'High-quality brake rotors for BMW 3 Series. Cross-drilled and slotted for better performance.',
                price: 450.00,
                category: 'brakes',
                condition: 'new',
                make: 'BMW',
                model: '3 Series',
                year: 2020,
                images: ['https://example.com/brakes1.jpg', 'https://example.com/brakes2.jpg']
            },
            {
                sellerId: sellerIds[1],
                title: 'Ford F-150 Suspension Kit',
                description: 'Complete suspension kit for Ford F-150. Includes shocks, struts, and springs. Perfect for off-road upgrades.',
                price: 750.00,
                category: 'suspension',
                condition: 'new',
                make: 'Ford',
                model: 'F-150',
                year: 2021,
                images: ['https://example.com/suspension1.jpg']
            },
            {
                sellerId: sellerIds[2],
                title: 'Chevrolet Silverado Headlights - LED',
                description: 'LED headlight assembly for Chevrolet Silverado. Bright white light, easy installation.',
                price: 320.00,
                category: 'electrical',
                condition: 'like_new',
                make: 'Chevrolet',
                model: 'Silverado',
                year: 2019,
                images: ['https://example.com/headlights1.jpg']
            },
            {
                sellerId: sellerIds[2],
                title: 'Nissan Altima Bumper Cover',
                description: 'Front bumper cover for Nissan Altima. Minor scratches, but structurally sound. Ready to paint.',
                price: 180.00,
                category: 'body',
                condition: 'fair',
                make: 'Nissan',
                model: 'Altima',
                year: 2017,
                images: ['https://example.com/bumper1.jpg']
            }
        ];

        const listingIds = [];
        for (const listing of listings) {
            const result = await query(`
        INSERT INTO listings (seller_id, title, description, price, category, condition, make, model, year, images, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
                listing.sellerId,
                listing.title,
                listing.description,
                listing.price,
                listing.category,
                listing.condition,
                listing.make,
                listing.model,
                listing.year,
                JSON.stringify(listing.images),
                true
            ]);

            listingIds.push(result.rows[0].id);
            console.log(`✅ Listing "${listing.title}" created`);
        }

        // Create sample conversations
        const conversations = [
            {
                listingId: listingIds[0],
                user1Id: buyerIds[0],
                user2Id: sellerIds[0]
            },
            {
                listingId: listingIds[1],
                user1Id: buyerIds[1],
                user2Id: sellerIds[0]
            }
        ];

        for (const conversation of conversations) {
            await query(`
        INSERT INTO conversations (listing_id, user1_id, user2_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (listing_id, user1_id, user2_id) DO NOTHING
      `, [conversation.listingId, conversation.user1Id, conversation.user2Id]);
        }
        console.log('✅ Sample conversations created');

        // Create sample messages
        const conversationResult = await query('SELECT id FROM conversations LIMIT 2');
        if (conversationResult.rows.length > 0) {
            const convId = conversationResult.rows[0].id;
            await query(`
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [convId, buyerIds[0], 'Hi, is this engine still available?']);

            await query(`
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [convId, sellerIds[0], 'Yes, it is! Are you interested in purchasing?']);
        }
        console.log('✅ Sample messages created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample accounts created:');
        console.log('Admin: admin@fayrelane.com / admin123');
        console.log('Sellers: john@example.com, sarah@example.com, mike@example.com / password123');
        console.log('Buyers: alice@example.com, bob@example.com / password123');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

// Run seeding if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };





