import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace('/login');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#1A237E', marginBottom: 12 }}>
          Redirecting to login...
        </div>
        <div style={{ fontSize: 14, color: '#7B7B93' }}>
          If you're not redirected automatically, <a href="/login" style={{ color: '#FF8C00' }}>click here</a>
        </div>
      </div>
    </div>
  );
} 