import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setErrorText('');

    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Simple implementation: assume no email verification required for demo, 
      // or if it's required, we can catch it. 
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/dashboard');
      } else if (result.status === 'missing_requirements') {
        // You might need an OTP input here if your Clerk is configured for Email Verification
        console.warn('Verification required', result);
        setErrorText('Please check your email for a verification link or configure Clerk to disable email verification during dev.');
      }
    } catch (err: any) {
      console.error('Error during sign-up:', err);
      setErrorText(err.errors?.[0]?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      setErrorText(err.errors?.[0]?.message || 'Google SSO failed.');
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col text-on-background">
      <header className="fixed top-0 w-full bg-slate-50 z-50 flex items-center justify-between px-6 h-16 shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <span className="font-inter tracking-tighter text-xl font-black text-slate-900">SalesForge AI</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md bg-surface rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-white/40">
          <div className="text-center mb-10">
            <h1 className="text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight mb-2">Join the Forge</h1>
            <p className="text-secondary font-medium">Precision outreach at scale starts here.</p>
          </div>

          {errorText && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm border border-error/50 font-medium mb-4">
              {errorText}
            </div>
          )}

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading || !isLoaded}
            className="w-full h-14 flex items-center justify-center gap-3 bg-surface border border-outline rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200 mb-8 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative mb-8 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="px-4 text-[12px] font-bold text-slate-400 tracking-widest uppercase">Or email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="text-[0.875rem] font-semibold text-on-surface px-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-14 bg-surface-container-low border border-outline rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface disabled:opacity-50" 
                  placeholder="John Doe" 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.875rem] font-semibold text-on-surface px-1">Work Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-surface-container-low border border-outline rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface disabled:opacity-50" 
                  placeholder="john@company.com" 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.875rem] font-semibold text-on-surface px-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-surface-container-low border border-outline rounded-xl px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface disabled:opacity-50" 
                  placeholder="••••••••" 
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !isLoaded}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center mt-8 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <span className="material-symbols-outlined ml-2">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 bg-primary-container/30 py-2.5 px-4 rounded-full">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-[12px] font-bold text-on-primary-container">14-day free trial, no credit card required</span>
          </div>

          <p className="mt-8 text-center text-on-surface-variant font-medium text-[0.875rem]">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline transition-all">Sign in</Link>
          </p>
        </div>

        <div className="mt-12 text-center max-w-[280px]">
          <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
            By creating an account, you agree to our terms of precision and velocity.
          </p>
        </div>
      </main>

      <footer className="w-full mt-auto border-t border-slate-200 bg-slate-50 flex flex-col items-center gap-4 py-8 px-6">
        <div className="flex gap-6">
          <a className="font-inter text-[12px] font-semibold text-slate-500 hover:text-blue-500 transition-colors duration-200" href="#">Terms of Service</a>
          <a className="font-inter text-[12px] font-semibold text-slate-500 hover:text-blue-500 transition-colors duration-200" href="#">Privacy Policy</a>
          <a className="font-inter text-[12px] font-semibold text-slate-500 hover:text-blue-500 transition-colors duration-200" href="#">Security</a>
        </div>
        <p className="font-inter text-[12px] font-semibold text-slate-500">© 2024 SalesForge AI. Precision Velocity.</p>
      </footer>
    </div>
  );
}
