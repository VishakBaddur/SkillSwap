import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { BookOpen, Eye, EyeOff, Loader2, Sparkles, Zap, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Detect Supabase recovery link (type=recovery) and show reset form
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const queryParams = new URLSearchParams(window.location.search);
    const isRecovery = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

    if (isRecovery) {
      setShowResetPassword(true);
      setIsLogin(true);

      // If Supabase provided a token/token_hash via query, verify it to ensure session is set
      const tokenHash = queryParams.get('token_hash') || queryParams.get('token');
      if (tokenHash) {
        (async () => {
          try {
            const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
            if (error) {
              console.error('verifyOtp error', error);
            }
          } catch (e) {
            console.error('verifyOtp exception', e);
          }
        })();
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Welcome back!",
        });
        navigate('/home');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Account created! Please check your email to verify your account.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Sent",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      setShowResetPassword(false);

      // Clean URL of recovery params
      const url = new URL(window.location.href);
      url.hash = '';
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.toString());

      navigate('/auth');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            variants={itemVariants}
          >
            Welcome to SkillSwap
          </motion.h1>
          <motion.p 
            className="text-gray-300"
            variants={itemVariants}
          >
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </motion.p>
        </motion.div>

        {/* Auth Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {isLogin 
                  ? 'Access your skill exchange dashboard' 
                  : 'Start your skill trading journey'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="password" className="text-white text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </motion.div>

                {isLogin && (
                  <motion.div 
                    className="flex justify-end"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      Forgot password?
                    </motion.button>
                  </motion.div>
                )}

                                 <motion.div variants={itemVariants}>
                   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                     <Button
                       type="submit"
                       disabled={loading}
                       className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                     >
                       {loading ? (
                         <Loader2 className="w-5 h-5 animate-spin mr-2" />
                       ) : (
                         <Zap className="w-5 h-5 mr-2" />
                       )}
                       {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                     </Button>
                   </motion.div>
                 </motion.div>
              </form>

              {/* Toggle Auth Mode */}
              <motion.div 
                className="text-center pt-4 border-t border-white/10"
                variants={itemVariants}
              >
                <p className="text-gray-300">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <motion.button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </motion.button>
                </p>
              </motion.div>

              {/* Back to Home */}
              <motion.div 
                className="text-center"
                variants={itemVariants}
              >
                <Link to="/">
                  <motion.button
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                    whileHover={{ x: -2 }}
                  >
                    ← Back to Home
                  </motion.button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          className="mt-8 text-center"
          variants={itemVariants}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Community", color: "from-blue-500 to-cyan-500" },
              { icon: Shield, label: "Secure", color: "from-green-500 to-emerald-500" },
              { icon: Sparkles, label: "Innovative", color: "from-purple-500 to-pink-500" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Reset Password</h3>
              <p className="text-gray-300 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Reset Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal (for recovery links) */}
      <AnimatePresence>
        {showResetPassword && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Set a New Password</h3>
              <p className="text-gray-300 mb-6">Enter and confirm your new password.</p>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-3">
                  <Button onClick={handleResetPassword} disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowResetPassword(false)} className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 