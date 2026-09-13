import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { setOfflineMode, getOfflineMode } from '../localStorage';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, WifiOff, Cloud, Download, UserPlus, LogIn, ShieldAlert, Sparkles, Store } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { cn } from '../lib/utils';

export default function AuthPage({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [offlineMode, setOfflineModeState] = useState(() => getOfflineMode());

    const toggleOfflineMode = () => {
        const newMode = !offlineMode;
        setOfflineModeState(newMode);
        setOfflineMode(newMode);
    };

    const handleOfflineLogin = (e) => {
        e.preventDefault();
        const mockSession = {
            user: { id: 'offline-user' },
            access_token: 'offline-mode',
            offline: true
        };
        onAuthSuccess(mockSession);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.session) onAuthSuccess(data.session);
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) {
                    onAuthSuccess(data.session);
                } else {
                    setSuccessMessage('Check your email for the login link!');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            if (Capacitor.isNativePlatform()) {
                const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                await GoogleAuth.initialize({
                    clientId: '29568527854-pcppseikmbos7lh2diummej1jj0i8tii.apps.googleusercontent.com',
                    scopes: ['profile', 'email'],
                    grantOfflineAccess: true
                });
                let result = await GoogleAuth.signIn();
                const idToken = result?.authentication?.idToken;
                if (idToken) {
                    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
                    if (error) throw error;
                    if (data.session) onAuthSuccess(data.session);
                }
            } else {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin }
                });
                if (error) throw error;
            }
        } catch (err) {
            if (err.message !== 'The user canceled the sign-in flow.') {
                setError('Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccessMessage('Password reset link sent! Check your email.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="p-10">
                        {/* Logo & Header */}
                        <div className="text-center mb-10">
                            <motion.div 
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 mb-6"
                            >
                                <Store size={40} strokeWidth={2.5} />
                            </motion.div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Finbook</h1>
                            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                {isForgotPassword ? 'Reset Access' : (isLogin ? 'Welcome Back' : 'Get Started')}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 flex items-start gap-3"
                                >
                                    <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6 flex items-start gap-3"
                                >
                                    <Sparkles size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-emerald-700 leading-relaxed">{successMessage}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mode Toggle */}
                        {!isForgotPassword && (
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                                <button 
                                    onClick={() => setIsLogin(true)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <LogIn size={14} strokeWidth={3} />
                                    Login
                                </button>
                                <button 
                                    onClick={() => setIsLogin(false)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <UserPlus size={14} strokeWidth={3} />
                                    Join
                                </button>
                            </div>
                        )}

                        {/* Forms */}
                        <form onSubmit={isForgotPassword ? handleForgotPassword : (offlineMode ? handleOfflineLogin : handleAuth)} className="space-y-5">
                            {!offlineMode && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border-2 border-slate-50 pl-14 pr-5 py-4 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                            placeholder="you@company.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {!isForgotPassword && !offlineMode && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                                        {isLogin && (
                                            <button 
                                                type="button" 
                                                onClick={() => setIsForgotPassword(true)}
                                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                                            >
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full bg-slate-50 border-2 border-slate-50 pl-14 pr-14 py-4 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {offlineMode && (
                                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-3 text-amber-600">
                                        <WifiOff size={20} />
                                        <span className="text-xs font-black uppercase tracking-widest">Local Mode Only</span>
                                    </div>
                                    <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                                        Data is stored only on this device. Switch to Cloud mode for secure backup and sync.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[1.25rem] font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    isForgotPassword ? 'Send Reset Link' : (offlineMode ? 'Enter Dashboard' : (isLogin ? 'Sign In' : 'Create Account'))
                                )}
                            </button>
                        </form>

                        {isForgotPassword && (
                            <button 
                                onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null); }}
                                className="w-full mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <ArrowLeft size={14} strokeWidth={3} />
                                Back to Login
                            </button>
                        )}

                        {/* Google Auth Divider */}
                        {!offlineMode && !isForgotPassword && (
                            <div className="mt-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Social Entry</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 group shadow-sm"
                                >
                                    <svg width="20" height="20" viewBox="0 0 48 48" className="group-hover:scale-110 transition-transform">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                    <span className="text-sm font-bold text-slate-700">Continue with Google</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Offline Toggle Footer */}
                    <div className="p-10 bg-slate-50 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all",
                                offlineMode ? "bg-amber-500 text-white" : "bg-white text-slate-400"
                            )}>
                                {offlineMode ? <WifiOff size={20} /> : <Cloud size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {offlineMode ? 'Offline Sync' : 'Cloud Backup'}
                                </p>
                                <button 
                                    onClick={toggleOfflineMode}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    Switch to {offlineMode ? 'Online' : 'Offline'} Mode
                                </button>
                            </div>
                        </div>

                        {!Capacitor.isNativePlatform() && (
                            <a
                                href="/finbook.apk"
                                download="Finbook.apk"
                                className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                                <Download size={14} strokeWidth={3} />
                                Get Android App
                            </a>
                        )}
                    </div>
                </div>
                
                <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Finbook v1.0.2 • Designed by Farhat Iqbal
                </p>
            </motion.div>
        </div>
    );
}
