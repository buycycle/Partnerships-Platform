# Buycycle Video Platform

A Next.js video platform with complete authentication system based on the contact-form implementation.

## 🔐 Authentication System

This platform includes a comprehensive authentication system with the following features:

### ✅ Implemented Features

#### Frontend Components
- **Login Modal** (`components/auth/login-modal.tsx`): Email/password login with Google & Apple OAuth
- **Auth Options** (`components/auth/auth-options.tsx`): Choice between login or continue without account
- **Login Button** (`components/login-button.tsx`): Smart button showing login or user dropdown
- **OAuth Callbacks**: Dedicated pages for Google and Apple OAuth redirects

#### Authentication Flow
- **Email/Password Login**: Direct authentication with Buycycle API
- **Google OAuth**: Complete OAuth 2.0 flow with state verification
- **Apple OAuth**: Apple Sign In with form_post response handling
- **Token Management**: Access token and refresh token handling
- **State Management**: React contexts for user and login modal state

#### Security Features
- **CSRF Protection**: State parameter validation for OAuth flows
- **Token Refresh**: Automatic token refresh when expired
- **Secure Storage**: localStorage with fallback mechanisms
- **Error Handling**: Comprehensive error states and user feedback

#### Backend API Routes
- `POST /api/auth/login`: Email/password authentication
- `POST /api/auth/logout`: Secure logout with token invalidation

### 📁 File Structure

```
lib/
├── api.ts                 # Main API client with auth methods
├── types.ts              # TypeScript interfaces for auth
└── oauth/
    ├── google.ts         # Google OAuth implementation
    └── apple.ts          # Apple OAuth implementation

contexts/
├── user-context.tsx     # User state management
└── login-modal-context.tsx # Login modal state

components/
├── auth/
│   ├── login-modal.tsx  # Main login component
│   └── auth-options.tsx # Login vs guest options
└── login-button.tsx     # Header login/user button

app/
├── auth/
│   ├── google/callback/ # Google OAuth callback
│   └── apple/callback/  # Apple OAuth callback
└── api/auth/           # Backend authentication routes
```

### 🚀 Quick Setup

1. **Install Dependencies**:
   ```bash
   npm install lucide-react next
   ```

2. **Environment Variables**:
   Create `.env.local` with:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
   NEXT_PUBLIC_BUYCYCLE_API_URL=https://api.buycycle.com
   NEXT_PUBLIC_BUYCYCLE_API_KEY=your_api_key
   ```

3. **OAuth Configuration**:
   - **Google**: Add redirect URI: `https://yourdomain.com/auth/google/callback`
   - **Apple**: Add redirect URI: `https://yourdomain.com/auth/apple/callback`

### 🔧 Usage Examples

#### Check Authentication Status
```tsx
import { useUser } from '@/contexts/user-context';

function MyComponent() {
  const { isUserLoggedIn, user, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (isUserLoggedIn) return <div>Welcome {user.first_name}!</div>;
  return <div>Please log in</div>;
}
```

#### Open Login Modal
```tsx
import { useLoginModal } from '@/contexts/login-modal-context';

function MyComponent() {
  const { openLoginModal } = useLoginModal();
  
  return (
    <button onClick={() => openLoginModal('/protected-page')}>
      Sign In
    </button>
  );
}
```

#### API Calls with Authentication
```tsx
import { auth } from '@/lib/api';

// Login
const userData = await auth.login('email@example.com', 'password');

// Social login
const userData = await auth.socialLogin('google', accessToken);

// Get current user
const user = await auth.getCurrentUser();

// Logout
await auth.logout();
```

### 🎨 Customization

The authentication system is built with shadcn/ui components and can be easily customized:

1. **Styling**: Modify Tailwind classes in components
2. **Branding**: Update logos and text in login modal
3. **OAuth Providers**: Add more providers by extending the OAuth system
4. **API Integration**: Swap Buycycle API for your own backend

### 🔄 OAuth Flow Details

#### Google OAuth
1. User clicks Google login → redirects to Google
2. Google redirects to `/auth/google/callback` with access token
3. Frontend extracts token and calls `auth.socialLogin()`
4. User is logged in and redirected to original page

#### Apple OAuth
1. User clicks Apple login → redirects to Apple
2. Apple POSTs to `/auth/apple/callback` with id_token
3. Frontend handles multiple fallback mechanisms for token extraction
4. User is logged in and redirected to original page

### 🛡️ Security Considerations

- **HTTPS Required**: OAuth requires HTTPS in production
- **State Validation**: Prevents CSRF attacks
- **Token Storage**: Consider using httpOnly cookies for production
- **Rate Limiting**: Add rate limiting to login endpoints
- **Session Management**: Implement proper session invalidation

### 📱 Mobile Considerations

- **Apple Touch Icon**: Add to public folder
- **Deep Linking**: Handle OAuth redirects in mobile webviews
- **Touch Optimization**: Login modal is touch-friendly

---

Based on the contact-form authentication implementation, this system provides enterprise-grade authentication suitable for production use.
