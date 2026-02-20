"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConfigured =
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url";

    const handleGoogleLogin = async () => {
        if (!isConfigured) {
            setError("Supabase is not configured yet — fill in .env.local first.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) setError(error.message);
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <motion.button
                onClick={handleGoogleLogin}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "13px",
                    background: "var(--bg-3)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-bright)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: "var(--font-body)",
                    cursor: loading ? "wait" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    transition: "opacity 0.15s",
                }}
            >
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                </svg>
                {loading ? "Redirecting..." : "Continue with Google"}
            </motion.button>
            {error && (
                <p style={{ fontSize: "12px", color: "var(--danger)", textAlign: "center" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
