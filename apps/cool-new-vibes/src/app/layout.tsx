import Link from 'next/link';
import './global.css';

export const metadata = {
  title: 'cool new vibes',
  description: 'Share your vibe. Get a playlist.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Feed</Link>
          <Link href="/playlists/chill">Playlists</Link>
          <Link href="/search">Search</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
