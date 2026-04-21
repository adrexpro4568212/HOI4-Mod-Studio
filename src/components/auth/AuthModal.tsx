import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Mail, Lock, User, LogIn, UserPlus, 
  ArrowRight, Loader2, AlertCircle 
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword 
} from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name) throw new Error('Please enter your name');
        await registerWithEmail(email, password, name);
        onClose();
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent!');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-mod-primary/10"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-mod-primary to-transparent opacity-50" />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Join the Studio'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'login' && 'Login to access your cloud saves.'}
                {mode === 'register' && 'Start your HOI4 modding journey.'}
                {mode === 'reset' && 'We will send you a recovery link.'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-3 mb-8">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                Continue with Google
              </button>
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-gray-800" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Or with email</span>
                <div className="flex-1 h-[1px] bg-gray-800" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-mod-primary transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:border-mod-primary focus:bg-[#151515] outline-none transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-mod-primary transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:border-mod-primary focus:bg-[#151515] outline-none transition-all"
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-mod-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-700 focus:border-mod-primary focus:bg-[#151515] outline-none transition-all"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs">
                <ArrowRight size={14} />
                {success}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-mod-primary hover:bg-mod-accent text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-mod-primary/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' && <LogIn size={18} />}
                  {mode === 'register' && <UserPlus size={18} />}
                  {mode === 'reset' && <Mail size={18} />}
                  <span className="uppercase tracking-widest text-xs">
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Link'}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            {mode === 'login' ? (
              <>
                <button 
                  onClick={() => setMode('reset')}
                  className="text-gray-500 hover:text-white text-xs transition-colors"
                >
                  Forgot your password?
                </button>
                <div className="text-gray-600 text-xs">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="text-mod-primary hover:underline font-bold">
                    Join now
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-600 text-xs">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-mod-primary hover:underline font-bold">
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
