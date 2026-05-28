import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Finance PWA',
  description: 'Gestione finanziaria personale',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Finance',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-apple.png" />
      </head>
      <body className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
