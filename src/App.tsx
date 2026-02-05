import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { BookOpen } from 'lucide-react';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import ProfileSetup from '@/pages/ProfileSetup';
import NotFound from '@/pages/NotFound';
import { Matches } from '@/components/ui/matches';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        if (window.location.pathname !== '/auth') {
          window.location.replace('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Detect Supabase password recovery links so we don't auto-redirect away from /auth
  useEffect(() => {
    console.log('🔍 Debug - Current URL:', window.location.href);
    console.log('🔍 Debug - Pathname:', window.location.pathname);
    console.log('🔍 Debug - Search:', window.location.search);
    console.log('🔍 Debug - Hash:', window.location.hash);
    
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const queryParams = new URLSearchParams(window.location.search);
    const recovery = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';
    console.log('🔍 Debug - Is recovery:', recovery);
    setIsRecovery(recovery);

    // If recovery token lands on wrong route (e.g., /auth), auto-redirect to /reset-password preserving tokens
    const hasAccessToken = window.location.hash.includes('access_token');
    const onAuthPath = window.location.pathname === '/auth';
    console.log('🔍 Debug - Has access token:', hasAccessToken);
    console.log('🔍 Debug - On auth path:', onAuthPath);
    
    if ((recovery || hasAccessToken) && onAuthPath) {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const target = `/reset-password${search}${hash}`;
      console.log('🔍 Debug - Redirecting to:', target);
      if (window.location.pathname + window.location.search + window.location.hash !== target) {
        window.location.replace(target);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-6 border border-white/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="h-4 w-32 bg-white/20 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading SkillSwap...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={(!session || isRecovery) ? <Auth /> : <Navigate to="/home" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={session ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/matches" element={session ? <Matches /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/profile-setup" element={session ? <ProfileSetup /> : <Navigate to="/auth" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App; 