<<<<<<< HEAD
# Fayrelane
=======
# Fayrelane MVP Phase 1 – Live Deployment

A modern marketplace platform for automotive parts, tools, and accessories. Production-ready for https://fayrelane.com

## Features

- **User Authentication**: Secure signup, login, and password recovery
- **Seller Dashboard**: Complete listing management with image uploads
- **Buyer Interface**: Advanced search and filtering for automotive parts
- **Messaging System**: Real-time communication between buyers and sellers
- **Payment Processing**: Stripe integration for secure transactions
- **Shipping Calculator**: UPS, USPS, and FedEx integration
- **Reviews & Ratings**: Trust system for sellers
- **Admin Dashboard**: Platform management and dispute resolution

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Hosting**: Vercel (frontend), Railway (backend)

## Quick Start

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
# Copy and configure environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

3. Start development servers:
```bash
npm run dev
```

## Project Structure

```
fayrelane-mvp/
├── client/                 # Next.js frontend
├── server/                 # Express.js backend
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/fayrelane
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Listings
- `GET /api/listings` - Get all listings with filters
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
"# Fayrelane" 
>>>>>>> 57224ab2 (first commit)
