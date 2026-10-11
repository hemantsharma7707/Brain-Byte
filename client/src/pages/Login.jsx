import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login({ email, password });
      toast.success('Welcome back!');
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — BrainByte Books</title>
        <meta name="description" content="Sign in to your BrainByte Books account to access your digital library." />
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="w-full max-w-md animate-scale-in">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-primary-500/30">
              BB
            </div>
            <h1 className="font-display text-3xl font-bold text-surface-100">Welcome Back</h1>
            <p className="text-surface-400 text-sm mt-2">Sign in to access your digital library and downloads</p>
          </div>

          <div className="glass rounded-3xl p-8 shadow-2xl border border-surface-700/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3.5 text-base font-semibold shadow-lg shadow-primary-600/30"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
                <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-800 text-center text-sm text-surface-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold underline underline-offset-4">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
