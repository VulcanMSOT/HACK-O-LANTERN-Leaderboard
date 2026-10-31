import './globals.css';

export const metadata = {
  title: 'HACK-O-LANTERN 2026 - Leaderboard',
  description: 'Official Live Leaderboard for HACK-O-LANTERN 2026',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080808] text-neutral-100 antialiased selection:bg-[#ff7a1a]/30">
        {children}
      </body>
    </html>
  );
}

