import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import ProfileSetup from '@/pages/ProfileSetup';
import NotFound from '@/pages/NotFound';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { error } = await supabase.from('skills').select('count');
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connected successfully');
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    };

    testConnection();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/home" />} />
        <Route path="/home" element={session ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/profile-setup" element={session ? <ProfileSetup /> : <Navigate to="/auth" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App; 