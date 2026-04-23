import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EarningsEdge — AI-Powered Earnings Intelligence',
  description:
    'Monitor quarterly earnings releases, get AI-powered analysis, and receive instant Telegram alerts for your stock watchlist.',
  keywords: ['earnings', 'stocks', 'AI analysis', 'investing', 'financial data'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
