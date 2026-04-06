import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from '@clerk/clerk-react';
import { useAuthStore } from "../../../stores/authStore";

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();
    const { isLoading, pendingVerification, setLoading, setError, setPendingVerification, reset } = useAuthStore();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


    // Handle OTP input changes and auto-focus
    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };


    // Handle Backspace auto-focus
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };


    // Step 1: Submit Credentials
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);


        try {
            await signUp.create({
                emailAddress: email,
                password: password,
                username: fullName
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
            // await setActive({ session: signUp.createdSessionId });
        } catch (error: any) {
            console.log(error);
            setError(error.errors[0]?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code: otp.join("") });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                reset();
                navigate("/dashboard");
            } else {
                console.log('Verification needs more steps', completeSignUp);
            }
        } catch (err: any) {
            setError(err.errors[0]?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    }


    //     // Resend OTP
    //   const resendOtp = async () => {
    //     if (!isLoaded) return;
    //     setLoading(true);
    //     setError(null);

    //     try {
    //       await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    //       setPendingVerification(true);
    //     } catch (err) {
    //       setError(err.errors[0]?.message || 'Failed to resend code');
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    if (pendingVerification) {
        return (
            <div className="bg-background text-on-background min-h-screen flex flex-col font-sans relative overflow-hidden">

                {/* Decorative Concentric Rings Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15] z-0">
                    <div className="w-[450px] h-[450px] rounded-full border border-secondary absolute"></div>
                    <div className="w-[600px] h-[600px] rounded-full border border-secondary absolute"></div>
                    <div className="w-[750px] h-[750px] rounded-full border border-secondary absolute"></div>
                    <div className="w-[900px] h-[900px] rounded-full border border-secondary absolute"></div>
                    <div className="w-[1050px] h-[1050px] rounded-full border border-secondary absolute"></div>
                    <div className="w-[1200px] h-[1200px] rounded-full border border-secondary absolute"></div>
                </div>

                {/* Abstract Gradient Blobs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                {/* Header */}
                <header className="flex items-center justify-between px-6 md:px-10 h-20 w-full z-10">
                    <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary">
                        RevenOs
                    </Link>
                    <button className="w-8 h-8 rounded-full bg-surface-container border border-outline flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">help</span>
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex items-center justify-center px-4 py-8 z-10">

                    {/* Verification Card */}
                    <div className="w-full max-w-[460px] bg-surface p-8 md:p-12 rounded-2xl shadow-2xl shadow-slate-200/50 border border-outline/60 relative">

                        {/* Icon & Titles */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/25 mb-6">
                                <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    fingerprint
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface text-center mb-3">
                                Verify your email
                            </h1>
                            <p className="text-secondary text-sm font-medium text-center leading-relaxed max-w-[280px]">
                                Enter the 6-digit code sent to your email address
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleVerify} className="flex flex-col">

                            {/* OTP Inputs - Responsive & Flexible */}
                            <div className="flex justify-between gap-2 sm:gap-3 w-full mb-8">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full aspect-[4/5] sm:aspect-square text-center text-xl sm:text-2xl font-bold rounded-xl border border-outline bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-surface outline-none transition-all shadow-sm"
                                        required
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-primary text-white text-base font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
                            >
                                Verify
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>

                            {/* Resend Code Section */}
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="text-secondary text-sm font-medium">Didn't receive the code?</p>
                                <button
                                    type="button"
                                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1.5 active:scale-95 transition-transform"
                                >
                                    Resend Code
                                    <span className="text-secondary font-medium">(00:59)</span>
                                </button>
                            </div>
                        </form>

                        {/* Footer of Card / Security Indicator */}
                        <div className="mt-10 pt-6 border-t border-outline flex items-center justify-center gap-2.5">
                            <span className="material-symbols-outlined text-outline-variant text-[18px]">shield_person</span>
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary">
                                Secure 256-bit Encryption
                            </span>
                        </div>
                    </div>

                </main>

                {/* Page Footer */}
                <footer className="h-16 flex items-center justify-center px-6 z-10 pb-4">
                    <p className="text-[12px] text-secondary font-medium tracking-tight">
                        © 2024 RevenOs. All rights reserved.
                    </p>
                </footer>

            </div>
        );
    }


    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 shadow-md shadow-primary/20">
                        <span
                            className="material-symbols-outlined text-white"
                            style={{ fontVariationSettings: "'FILL' 1", fontSize: "28px" }}
                        >
                            bolt
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2">
                        SalesForge AI
                    </h1>
                    <p className="text-on-surface-variant text-sm font-medium">
                        Start your 14-day free trial
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-surface border border-outline rounded-xl shadow-sm p-8 w-full max-w-md">

                    {/* Google Sign Up Button */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-surface border border-outline rounded-lg text-on-surface text-sm font-medium hover:bg-surface-container-low active:scale-[0.98] transition-all mb-6 shadow-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-outline"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-surface text-outline-variant font-semibold tracking-wider uppercase">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full px-3 py-2.5 bg-surface border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm placeholder:text-outline-variant"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">
                                Work Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@company.com"
                                required
                                className="w-full px-3 py-2.5 bg-surface border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm placeholder:text-outline-variant"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-3 py-2.5 bg-surface border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm placeholder:text-outline-variant tracking-widest"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 mt-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Info Banner */}
                    <div className="mt-6 flex items-center justify-center gap-2 py-3 bg-surface-container-low rounded-lg text-xs font-medium text-on-primary-container">
                        <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                        </span>
                        14-day free trial, no credit card required
                    </div>

                </div>

                {/* Login Link */}
                <p className="mt-8 text-center text-on-surface-variant text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-primary font-semibold hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </main>

            {/* Footer */}
            <footer className="w-full mt-auto border-t border-outline bg-transparent">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 w-full max-w-6xl mx-auto">
                    <p className="text-sm text-secondary mb-4 md:mb-0">
                        © 2024 SalesForge AI. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-secondary hover:text-on-surface transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-sm text-secondary hover:text-on-surface transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="text-sm text-secondary hover:text-on-surface transition-colors">
                            Help Center
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}