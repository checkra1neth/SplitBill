import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnchainProviders } from '@/lib/providers/OnchainProviders';
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitBill - Split Bills Onchain',
  description: 'Split bills and pay instantly with crypto on Base',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnchainProviders>{children}</OnchainProviders>
      </body>
    </html>
  );
}
