# Fayrelane MVP Phase 1 - Live Deployment Guide

## 🚀 **Production Deployment for Fayrelane.com**

This guide will help you deploy Fayrelane to production with real-time database and authentication.

## 📋 **Prerequisites**

1. **Domain**: You already own fayrelane.com
2. **Database**: PostgreSQL (Neon, Railway, or AWS RDS)
3. **File Storage**: AWS S3 bucket
4. **Payment**: Stripe account with live keys
5. **Email**: Gmail or SMTP service

## 🗄️ **Step 1: Set Up Production Database**

### **Option A: Neon (Recommended - Free tier)**
1. Go to https://neon.tech/
2. Sign up and create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in production environment

### **Option B: Railway**
1. Go to https://railway.app/
2. Create a new project
3. Add PostgreSQL database
4. Copy the connection string

### **Option C: AWS RDS**
1. Create PostgreSQL instance on AWS RDS
2. Configure security groups
3. Get connection details

## 🔧 **Step 2: Configure Production Environment**

### **Backend Environment Variables**
Create these environment variables in your backend hosting service:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=7d

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_production_aws_access_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret_key
AWS_S3_BUCKET=your-production-s3-bucket-name
AWS_REGION=us-east-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fayrelane.com
```

### **Frontend Environment Variables**
Create these in Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.fayrelane.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
NEXT_PUBLIC_SOCKET_URL=https://api.fayrelane.com
```

## 🚀 **Step 3: Deploy Backend (Railway)**

1. **Connect Repository**
   - Go to https://railway.app/
   - Connect your GitHub repository
   - Select the project

2. **Configure Service**
   - Set root directory to `server`
   - Add environment variables from above
   - Deploy

3. **Get Backend URL**
   - Railway will provide a URL like `https://your-app.railway.app`
   - This becomes your `NEXT_PUBLIC_API_URL`

## 🌐 **Step 4: Deploy Frontend (Vercel)**

1. **Connect Repository**
   - Go to https://vercel.com/
   - Import your GitHub repository
   - Set root directory to `client`

2. **Configure Build Settings**
   - Framework: Next.js
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Add all frontend environment variables
   - Set `NEXT_PUBLIC_API_URL` to your Railway backend URL

4. **Custom Domain**
   - Add fayrelane.com as custom domain
   - Configure DNS records

## 🗄️ **Step 5: Set Up Database**

1. **Run Migrations**
   ```bash
   # Connect to production database
   npm run migrate
   npm run seed
   ```

2. **Verify Tables**
   - Check that all tables are created
   - Verify sample data is loaded

## 🔐 **Step 6: Configure Authentication**

### **Google OAuth (Optional)**
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Update auth configuration

### **Apple Sign-In (Optional)**
1. Go to Apple Developer Console
2. Create Sign in with Apple service
3. Configure redirect URLs
4. Update auth configuration

## 📧 **Step 7: Configure Email Service**

1. **Gmail Setup**
   - Enable 2-factor authentication
   - Generate app password
   - Use in EMAIL_PASS environment variable

2. **Alternative SMTP**
   - Use SendGrid, Mailgun, or similar
   - Update EMAIL_HOST and credentials

## 💳 **Step 8: Configure Stripe**

1. **Get Live Keys**
   - Switch to live mode in Stripe dashboard
   - Copy live secret and publishable keys
   - Update environment variables

2. **Configure Webhooks**
   - Add webhook endpoint: `https://api.fayrelane.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

## 🗂️ **Step 9: Configure AWS S3**

1. **Create S3 Bucket**
   - Create bucket with unique name
   - Configure CORS policy
   - Set up bucket permissions

2. **CORS Configuration**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://fayrelane.com"],
       "ExposeHeaders": []
     }
   ]
   ```

## 🧪 **Step 10: Test Production Deployment**

### **Test Checklist**
- [ ] Frontend loads at https://fayrelane.com
- [ ] Backend API responds at https://api.fayrelane.com/health
- [ ] User registration works
- [ ] User login works
- [ ] Database operations work
- [ ] File uploads work
- [ ] Payment processing works
- [ ] Email sending works
- [ ] All pages load without 404s

### **Test Commands**
```bash
# Test API health
curl https://api.fayrelane.com/health

# Test database connection
curl https://api.fayrelane.com/api/auth/me

# Test frontend
curl https://fayrelane.com
```

## 🔧 **Step 11: DNS Configuration**

1. **Point Domain to Vercel**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP

2. **Configure Subdomain**
   - Add CNAME: `api` → Railway backend URL
   - Or use Railway's custom domain feature

## 📊 **Step 12: Monitoring & Analytics**

1. **Add Monitoring**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Configure uptime monitoring

2. **Analytics**
   - Add Google Analytics
   - Set up conversion tracking
   - Monitor user behavior

## 🚨 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS settings

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check database permissions
   - Ensure database is accessible

3. **File Upload Issues**
   - Check AWS S3 permissions
   - Verify CORS configuration
   - Test with small files first

4. **Payment Issues**
   - Verify Stripe keys are correct
   - Check webhook configuration
   - Test with Stripe test mode first

## ✅ **Final Verification**

Once everything is deployed:

1. **Test User Flow**
   - Register new user
   - Login with existing user
   - Create listing
   - Browse listings
   - Send message
   - Complete purchase

2. **Performance Check**
   - Page load times
   - API response times
   - Database query performance

3. **Security Check**
   - HTTPS is enabled
   - Environment variables are secure
   - Database is protected
   - API endpoints are secured

## 🎉 **Production Ready!**

Your Fayrelane MVP Phase 1 is now live at https://fayrelane.com with:
- ✅ Real-time database
- ✅ User authentication
- ✅ Google/Apple sign-in (if configured)
- ✅ Live payment processing
- ✅ File uploads
- ✅ Messaging system
- ✅ All pages working
- ✅ Mobile responsive design

## 📞 **Support**

If you encounter issues:
1. Check the logs in Railway/Vercel
2. Verify all environment variables
3. Test database connectivity
4. Check API endpoints manually
5. Review error messages in browser console

Your Fayrelane marketplace is now ready for real users! 🚀
