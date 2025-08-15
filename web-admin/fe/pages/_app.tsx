import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AdminLayout from '../components/layout/adminLayout';
import { useRouter } from 'next/router';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
