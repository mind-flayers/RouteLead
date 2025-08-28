import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AdminLayout from '../components/layout/adminLayout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Protect admin pages: redirect to /login if no ADMIN session
  useEffect(() => {
    (async () => {
      const publicPaths = ['/login', '/'];
      if (publicPaths.includes(router.pathname)) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.replace('/login');
        return;
      }
      // Optional role verification via profile endpoint
      try {
        const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) router.replace('/login');
      } catch {
        router.replace('/login');
      }
    })();
  }, [router.pathname]);

  // Show login page without layout
  const showFullLayout = router.pathname !== '/login';

  if (showFullLayout) {
    return (
      <div className={outfit.className}>
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      </div>
    );
  }

  return (
    <div className={outfit.className}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
