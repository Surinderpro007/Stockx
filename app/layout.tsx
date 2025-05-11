import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import AuthProvider from '../components/auth/AuthProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NextStocks - Stock Market Application',
  description: 'A modern stock market application for buying and selling stocks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Script id="remove-grammarly">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              // Remove Grammarly elements that cause hydration warnings
              const attr1 = 'data-new-gr-c-s-check-loaded';
              const attr2 = 'data-gr-ext-installed';
              
              if (document.body.hasAttribute(attr1)) {
                document.body.removeAttribute(attr1);
              }
              if (document.body.hasAttribute(attr2)) {
                document.body.removeAttribute(attr2);
              }
              if (document.documentElement.hasAttribute(attr1)) {
                document.documentElement.removeAttribute(attr1);
              }
              if (document.documentElement.hasAttribute(attr2)) {
                document.documentElement.removeAttribute(attr2);
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
} 