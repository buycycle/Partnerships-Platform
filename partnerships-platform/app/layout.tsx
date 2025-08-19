import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'
import { LoginModalProvider } from '@/contexts/login-modal-context'
import { LanguageProvider } from '@/contexts/language-context'
import { Toaster } from '@/components/ui/toaster'
import { Footer } from '@/components/footer'
import { LoginModalRenderer } from '@/components/auth/login-modal-renderer'

export const metadata: Metadata = {
  title: 'buycycle - Global Marketplace for Pre-owned Bikes',
  description: 'Buy and sell bikes, cycling equipment, and sports gear on the world\'s leading marketplace for pre-owned bicycles. Everide joins buycycle for a bigger community!',
  generator: 'buycycle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-F52X4829Y8"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F52X4829Y8');
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <UserProvider>
            <LoginModalProvider>
              {children}
              <Footer />
              <Toaster />
              <LoginModalRenderer />
            </LoginModalProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
