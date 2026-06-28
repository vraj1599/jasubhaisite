import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL('https://jasubhaichappal.com'),
  title: { default: 'Jasubhai Chappal – Comfort Footwear', template: '%s | Jasubhai Chappal' },
  description: 'Premium Indian footwear — Chappals, Kolhapuri, Sandals & more. Comfort starts at ₹199.',
  keywords: ['chappal', 'footwear', 'kolhapuri', 'sandals', 'Indian shoes', 'Jasubhai'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Jasubhai Chappal',
    description: 'Comfort footwear for every step.',
    type: 'website',
    url: 'https://jasubhaichappal.com',
    siteName: 'Jasubhai Chappal',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                success: { iconTheme: { primary: '#f59e0b', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
