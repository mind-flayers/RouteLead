import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AdminLayout from '../components/layout/adminLayout';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Show login page without layout
  const showFullLayout = router.pathname !== '/login';

  if (showFullLayout) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp;
