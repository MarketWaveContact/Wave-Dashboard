import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wave Dashboard — Market Wave Agency',
  description: 'Tableau de bord de performance marketing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
