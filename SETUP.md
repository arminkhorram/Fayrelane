# Fayrelane MVP Phase 1 - Setup Instructions

## Prerequisites

Before setting up Fayrelane, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## Quick Start

1. **Clone and Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install all dependencies (server + client)
   npm run install-all
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb fayrelane
   
   # Set up database tables and seed data
   cd server
   npm run migrate
   npm run seed
   ```

3. **Environment Configuration**
   
   **Server (.env)**
   ```bash
   # Copy the example file
   cp server/env.example server/.env
   
   # Edit server/.env with your configuration:
   DATABASE_URL=postgresql://username:password@localhost:5432/fayrelane
   JWT_SECRET=your-super-secret-jwt-key-here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET=your-s3-bucket-name
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **Client (.env.local)**
   ```bash
   # Copy the example file
   cp client/env.local.example client/.env.local
   
   # Edit client/.env.local:
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Start Development Servers**
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start individually:
   # Server: npm run server
   # Client: npm run client
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## Sample Accounts

After running the seed script, you can use these accounts:

- **Admin**: admin@fayrelane.com / admin123
- **Seller**: john@example.com / password123
- **Buyer**: alice@example.com / password123

## Features Overview

### ✅ Completed MVP Phase 1 Features

1. **User Authentication**
   - User registration and login
   - Password reset functionality
   - JWT-based authentication
   - Role-based access control

2. **Seller Dashboard**
   - Create and manage listings
   - Image upload to AWS S3
   - Listing categories and conditions
   - Automotive-specific fields (make, model, year)

3. **Buyer Interface**
   - Browse and search listings
   - Advanced filtering system
   - Category-based navigation
   - Responsive design

4. **Messaging System**
   - Real-time messaging with Socket.IO
   - Conversation management
   - Typing indicators
   - Message history

5. **Payment Processing**
   - Stripe integration
   - Secure payment intents
   - Order management
   - Webhook handling

6. **Shipping Calculator**
   - UPS, USPS, FedEx integration
   - Cost estimation
   - Shipping label generation
   - Tracking support

7. **Reviews & Ratings**
   - Seller rating system
   - Review management
   - Trust indicators

8. **Admin Dashboard**
   - User management
   - Listing moderation
   - Order oversight
   - Dispute resolution

9. **Responsive Design**
   - Mobile-first approach
   - TailwindCSS styling
   - Modern UI components
   - Accessibility features

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages/conversations/:id/messages` - Send message

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/orders` - Get user orders

### Shipping
- `POST /api/shipping/calculate` - Calculate shipping costs
- `GET /api/shipping/history` - Get shipping history
- `POST /api/shipping/create-label` - Create shipping label

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **listings** - Product listings
- **conversations** - Message conversations
- **messages** - Individual messages
- **orders** - Purchase orders
- **reviews** - Seller reviews
- **payment_intents** - Stripe payment intents
- **shipping_requests** - Shipping information

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

### Database (Railway/Neon)
1. Create PostgreSQL database
2. Run migration and seed scripts
3. Update DATABASE_URL in environment variables

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Performance Optimizations

- Database indexing
- Query optimization
- Image compression
- Lazy loading
- Caching strategies
- CDN integration

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Stripe Integration Issues**
   - Verify API keys are correct
   - Check webhook endpoints
   - Ensure test mode is enabled

3. **AWS S3 Upload Failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Ensure CORS is configured

4. **Socket.IO Connection Issues**
   - Check CORS settings
   - Verify authentication tokens
   - Ensure ports are accessible

### Support

For technical support or questions:
- Check the logs in the server console
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check database connectivity

## Next Steps

This MVP Phase 1 provides a solid foundation. Future phases could include:

- Mobile app development
- Advanced analytics
- AI-powered recommendations
- Multi-language support
- Advanced search with Elasticsearch
- Real-time notifications
- Advanced payment options
- Inventory management
- Bulk operations
- API rate limiting
- Advanced admin features

## License

MIT License - see LICENSE file for details
