import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guess the Conversion',
  description: 'A game to guess conversion funnel percentages',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container mx-auto px-4 py-8 sm:max-w-xl md:max-w-2xl">
          {children}
          <KeyboardShortcuts />
        </main>
      </body>
    </html>
  );
}