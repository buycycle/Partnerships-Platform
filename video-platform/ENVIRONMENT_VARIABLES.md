# Environment Variables Required

## Authentication & API
- `X_PROXY_AUTHORIZATION` - Buycycle API key for backend authentication
  - **Value**: `WmhamrdVBtXiMHoJLBwQxbJ2gsgjVMSl21TQFrniIEyEl7m0iZKp43HhOUh8IiJS`
- `DATABASE_URL` - MySQL database connection string

## OAuth (Already configured for sponsorship.buycycle.com)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `APPLE_CLIENT_ID` - Apple OAuth client ID

## AWS S3 (for video uploads)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., eu-central-1)
- `AWS_S3_BUCKET` - S3 bucket name

## Next.js
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Application URL (https://sponsorship.buycycle.com)

## Notes
- The `X_PROXY_AUTHORIZATION` variable is critical for backend proxy authentication with Buycycle API
- OAuth is configured for sponsorship.buycycle.com domain only
- All environment variables should be set in Vercel deployment settings 