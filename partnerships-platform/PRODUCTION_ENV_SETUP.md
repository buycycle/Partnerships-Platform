# Production Environment Variables for Video-Platform

## 🚨 CRITICAL UPDATES NEEDED IN VERCEL

### 1. **API Configuration (HIGHEST PRIORITY)**
```
# Current (WORKING in contact-form)
NEXT_PUBLIC_BUYCYCLE_API_KEY=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS
X_PROXY_AUTHORIZATION=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS

# MUST ADD (Missing in your Vercel)
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
NEXT_PUBLIC_API_BASE_URL=https://sponsorship.buycycle.com
```

### 2. **OAuth Configuration** 
```
# Google OAuth (Update these)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=428411144874-5onfg83tcii07qfh8cbtdjj4uuqanun9.apps.googleusercontent.com

# Apple OAuth  
NEXT_PUBLIC_APPLE_CLIENT_ID=com.buycycle.client
```

### 3. **Domain Configuration**
```
NEXT_PUBLIC_PRODUCTION_DOMAIN=sponsorship.buycycle.com
NEXTAUTH_URL=https://sponsorship.buycycle.com
```

### 4. **Database Configuration (Add these)**
```
# MySQL (Production Database)
DATABASE_URL=mysql://admin:-b7QV-b7b>`zX6~_@buycycle-prod-aurora-cluster.cluster-chtuzspuyr3t.eu-central-1.rds.amazonaws.com:3306/buycycle

# Individual MySQL vars (if needed)
MYSQL_HOST=buycycle-prod-aurora-cluster.cluster-chtuzspuyr3t.eu-central-1.rds.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=-b7QV-b7b>`zX6~_
MYSQL_DATABASE=buycycle
MYSQL_PORT=3306
```

### 5. **AWS S3 Configuration (Add these)**
```
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY  
AWS_REGION=eu-central-1
AWS_S3_BUCKET=buycycle-videos
```

### 6. **Security & Auth**
```
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
NODE_ENV=production
```

### 7. **Optional: Analytics & Monitoring**
```
# Mixpanel (from contact-form)
NEXT_PUBLIC_MIXPANEL_TOKEN=185200908af84f7c2208bef5ab52769e
MIXPANEL_TOKEN=cec35e760266db465ccf0f186ef9b71f

# Set to false for production
NEXT_PUBLIC_MIXPANEL_DEV=false
```

## 🔍 **DEBUGGING: Why Contact-Form Works vs Video-Platform**

### Contact-Form Environment (WORKING):
- ✅ Uses `VITE_BUYCYCLE_API_KEY` for frontend
- ✅ Uses `process.env.X_PROXY_AUTHORIZATION` for backend  
- ✅ Has proper base URL configuration
- ✅ Database connection properly configured

### Video-Platform Issues (FAILING):
- ❌ Missing `NEXT_PUBLIC_API_BASE_URL` 
- ❌ Incorrect environment variable mapping
- ❌ Missing production domain configuration
- ❌ Database connection issues

## 🚀 **IMMEDIATE ACTION REQUIRED**

### Step 1: Update Vercel Environment Variables
1. Go to your Vercel project settings
2. Add ALL the missing variables above
3. Update existing variables to match the working contact-form values

### Step 2: Critical Variables to Add RIGHT NOW:
```
NEXT_PUBLIC_API_BASE_URL=https://sponsorship.buycycle.com
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
DATABASE_URL=mysql://admin:-b7QV-b7b>`zX6~_@buycycle-prod-aurora-cluster.cluster-chtuzspuyr3t.eu-central-1.rds.amazonaws.com:3306/buycycle
```

### Step 3: Environment Variable Mapping Fix
The issue is that your video-platform expects different environment variable names than what's configured in Vercel.

## 🔧 **Code Changes Required**

Update your `lib/env.ts` to match production environment:

```typescript
export const env = {
  // API Configuration  
  BUYCYCLE_API_URL: process.env.NEXT_PUBLIC_BUYCYCLE_API_URL || 'https://api.buycycle.com',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sponsorship.buycycle.com',
  BUYCYCLE_API_KEY: process.env.NEXT_PUBLIC_BUYCYCLE_API_KEY || process.env.X_PROXY_AUTHORIZATION || '',
  
  // Add missing AWS configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'eu-central-1',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET || 'buycycle-videos',
};
```

## ⚠️ **CRITICAL SECURITY NOTE**

The database credentials shown above are from your contact-form .env file. Make sure these are:
1. ✅ Properly secured in Vercel environment variables
2. ✅ Not exposed in client-side code
3. ✅ Using the correct production database

## 🎯 **Expected Result After Fix**

Once you update these environment variables in Vercel:
- ✅ Vote functionality will work (404 error resolved)
- ✅ User authentication will persist correctly
- ✅ API calls will succeed like in contact-form
- ✅ Production-ready configuration

## 📊 **Verification Steps**

After updating Vercel environment variables:
1. Redeploy your application
2. Test login functionality
3. Test vote button functionality
4. Check browser dev tools for any remaining 404 errors 