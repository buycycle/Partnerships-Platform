# Vercel Deployment Configuration

## 🚀 Quick Deploy Guide

This project is configured for seamless deployment on Vercel as a **frontend application** with serverless API routes.

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/partnerships-platform)

**OR** manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd partnerships-platform
vercel --prod
```

### 2. Environment Variables Setup

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these **REQUIRED** variables:

#### 🔑 **API Authentication (CRITICAL)**
```
NEXT_PUBLIC_BUYCYCLE_API_KEY=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS
X_PROXY_AUTHORIZATION=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
```

#### 🔐 **OAuth Configuration**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=428411144874-5onfg83tcii07qfh8cbtdjj4uuqanun9.apps.googleusercontent.com
NEXT_PUBLIC_APPLE_CLIENT_ID=com.buycycle.client
```

#### 🌐 **Domain Configuration**
```
NEXT_PUBLIC_PRODUCTION_DOMAIN=your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-secret-here
```

#### 📊 **Database (Optional - if using backend features)**
```
DATABASE_URL=mysql://user:password@host:port/database
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-database-name
MYSQL_PORT=3306
```

#### 📈 **Analytics (Optional)**
```
NEXT_PUBLIC_MIXPANEL_TOKEN=185200908af84f7c2208bef5ab52769e
```

### 3. Build Configuration

The project includes optimized build settings:

- **Framework**: Next.js 15 with App Router
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Node Version**: 20.x
- **Region**: Frankfurt (fra1) for EU optimization

### 4. Features Enabled for Vercel

✅ **Server-Side Rendering (SSR)**
✅ **Static Site Generation (SSG)**  
✅ **API Routes** (serverless functions)
✅ **Image Optimization**
✅ **Incremental Static Regeneration**
✅ **Edge Functions** ready
✅ **Multi-language support**
✅ **Authentication system**

### 5. Deployment Process

1. **Connect Repository**: Link your GitHub/GitLab repo to Vercel
2. **Auto-Detection**: Vercel automatically detects Next.js configuration
3. **Environment Variables**: Add the variables listed above
4. **Deploy**: Every push to main branch triggers automatic deployment
5. **Preview**: Pull requests get preview deployments

### 6. Performance Optimizations

- **CDN**: Global content delivery network
- **Edge Caching**: Static assets cached at edge locations
- **Serverless Functions**: API routes run on-demand
- **Image Optimization**: Automatic WebP conversion and sizing
- **Bundle Analysis**: Built-in bundle analyzer

### 7. Custom Domain Setup (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `NEXTAUTH_URL` environment variable

### 8. Monitoring & Analytics

Vercel provides built-in:
- **Performance Monitoring**
- **Error Tracking**  
- **Analytics Dashboard**
- **Function Logs**
- **Build Logs**

### 9. Troubleshooting

#### Build Failures
```bash
# Check build locally
npm run build

# Check TypeScript errors
npm run type-check
```

#### Environment Variables
- Ensure all required variables are set
- Variables starting with `NEXT_PUBLIC_` are available in browser
- Private variables are only available in server-side code

#### API Routes Issues
- Check function logs in Vercel dashboard
- Verify database connectivity
- Test API endpoints locally first

### 10. Production Checklist

- [ ] All environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Database migrations run
- [ ] OAuth providers configured for production domain
- [ ] Analytics tracking enabled
- [ ] Performance monitoring set up

## 🎯 Result

Your partnerships platform will be deployed as a **fast, scalable frontend application** with:

- ⚡ **Sub-second page loads**
- 🌍 **Global CDN distribution**
- 🔒 **Automatic HTTPS**
- 📱 **Mobile-optimized**
- 🔧 **Zero-configuration deployments**
- 📊 **Built-in analytics**

The application will handle authentication, multi-language support, and all interactive features seamlessly on Vercel's edge network.
