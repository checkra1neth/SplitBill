import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './appkit-retro.css';
import { OnchainProviders } from '@/lib/providers/OnchainProviders';
import { RetroFooter } from '@/components/RetroFooter';
import '@coinbase/onchainkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SplitBill - Split Bills Onchain',
  description: 'Split bills and pay instantly with crypto on Base',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <OnchainProviders>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>{children}</div>
            <RetroFooter
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
              }}
            />
          </div>
        </OnchainProviders>
      </body>
    </html>
  );
}
