import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowForge - Visual Data Pipeline Builder',
  description: 'A real-time collaborative visual data pipeline builder for data engineers and analysts',
  keywords: ['data pipeline', 'ETL', 'visual programming', 'collaboration', 'data engineering'],
  authors: [{ name: 'FlowForge Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div id="root" className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}