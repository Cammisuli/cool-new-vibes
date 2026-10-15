import Link from 'next/link';
import './global.css';

export const metadata = {
  title: 'vibes admin',
  description: 'Back office for cool new vibes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <strong>vibes admin</strong>
          <Link href="/">Dashboard</Link>
          <Link href="/moderation">Moderation</Link>
          <Link href="/flags">Flags</Link>
          <Link href="/notifications">Notifications</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
