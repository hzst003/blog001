import './globals.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/components/ThemeProvider'
import { siteConfig } from '@/config/content'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="relative h-screen">
            <div className="relative z-10 flex flex-col h-full">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 