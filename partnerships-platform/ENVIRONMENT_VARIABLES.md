# Environment Variables Required for Partnerships Platform

## 🔑 Critical Variables (Required for basic functionality)

### API Authentication
- `NEXT_PUBLIC_BUYCYCLE_API_KEY` - Public Buycycle API key
  - **Value**: `WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS`
- `X_PROXY_AUTHORIZATION` - Server-side Buycycle API authentication
  - **Value**: `WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS`
- `NEXT_PUBLIC_BUYCYCLE_API_URL` - Buycycle API base URL
  - **Value**: `https://api.buycycle.com`

### OAuth Configuration
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
  - **Value**: `428411144874-5onfg83tcii07qfh8cbtdjj4uuqanun9.apps.googleusercontent.com`
- `NEXT_PUBLIC_APPLE_CLIENT_ID` - Apple OAuth client ID
  - **Value**: `com.buycycle.client`

### Domain Configuration
- `NEXT_PUBLIC_PRODUCTION_DOMAIN` - Your production domain
- `NEXTAUTH_URL` - Full application URL for authentication
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate secure random string)

## 📊 Optional Variables (For extended functionality)

### Database (if using backend features)
- `DATABASE_URL` - MySQL database connection string
- `MYSQL_HOST` - Database host
- `MYSQL_USER` - Database user
- `MYSQL_PASSWORD` - Database password
- `MYSQL_DATABASE` - Database name
- `MYSQL_PORT` - Database port (default: 3306)

### Analytics
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Mixpanel tracking token
  - **Value**: `185200908af84f7c2208bef5ab52769e`

## 🚀 Deployment Notes

### For Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables for: **Production**, **Preview**, and **Development**
3. Variables with `NEXT_PUBLIC_` prefix are available in browser
4. Private variables are server-side only

### For Local Development:
Create `.env.local` file in project root:
```env
NEXT_PUBLIC_BUYCYCLE_API_KEY=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS
X_PROXY_AUTHORIZATION=WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS
NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
NEXTAUTH_SECRET=your-dev-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## ⚠️ Security Notes
- Never commit `.env.local` or any `.env` files to Git
- Use strong, unique secrets for production
- Rotate API keys periodically
- OAuth clients should be configured for your specific domain 