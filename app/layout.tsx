import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Myca Email Agent',
  description: 'AI-powered email drafting assistant for Emma Forman',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


