import { useAuthStore } from "../../../stores/authStore";
import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isLoading, error, setLoading, setError, reset } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError(null);

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                reset();
                navigate("/dashboard");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.errors[0]?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col">

            {/* Main */}
            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Brand — part of page, not navbar */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-6 shadow-lg shadow-primary/20">
                            <span
                                className="material-symbols-outlined text-white text-4xl"
                                style={{ fontVariationSettings: "'FILL' 1", fontSize: "36px" }}
                            >
                                bolt
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">
                            RevenOS
                        </h1>
                        <p className="text-on-surface-variant font-medium">
                            Elevate your outreach with AI precision
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-surface border border-outline rounded-xl shadow-xl p-8 md:p-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
                                        mail
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-on-surface-variant">
                                        Password
                                    </label>
                                    <a
                                        href="#"
                                        className="text-sm font-bold text-primary hover:underline"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
                                        lock
                                    </span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                                {!isLoading && (
                                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                                        arrow_forward
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-outline"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-surface text-secondary font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface border border-outline rounded-lg text-on-surface font-semibold hover:bg-surface-container-low active:scale-[0.98] transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        {/* Signup link */}
                        <p className="mt-8 text-center text-on-surface-variant font-medium text-sm">
                            New to RevenOS?{" "}
                            <Link
                                to="/signup"
                                className="text-primary font-bold hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer — left/right layout */}
            <footer className="bg-slate-50 border-t border-outline w-full mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
                    <p className="text-sm font-normal text-secondary mb-6 md:mb-0">
                        © 2025 RevenOS. All rights reserved.
                    </p>
                    <div className="flex gap-8">
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