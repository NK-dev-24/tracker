"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isConfigured =
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConfigured) {
            setError("Supabase is not configured yet. Fill in .env.local first.");
            return;
        }

        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence mode="wait">
            {sent ? (
                <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: "center" }}
                >
                    <div
                        className="mono"
                        style={{
                            fontSize: "11px",
                            color: "var(--success)",
                            letterSpacing: "0.15em",
                            marginBottom: "8px",
                        }}
                    >
                        CHECK YOUR INBOX
                    </div>
                    <div
                        style={{ fontSize: "13px", color: "var(--text-secondary)" }}
                    >
                        A login link has been sent to{" "}
                        <span style={{ color: "var(--text-primary)" }}>{email}</span>
                    </div>
                </motion.div>
            ) : (
                <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleLogin}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        style={{
                            background: "var(--bg-3)",
                            border: "1px solid var(--border-bright)",
                            borderRadius: "4px",
                            padding: "14px 16px",
                            color: "var(--text-primary)",
                            fontSize: "14px",
                            fontFamily: "'Space Grotesk', sans-serif",
                            outline: "none",
                            width: "100%",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={(e) =>
                            (e.target.style.borderColor = "var(--accent)")
                        }
                        onBlur={(e) =>
                            (e.target.style.borderColor = "var(--border-bright)")
                        }
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: "var(--text-primary)",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            padding: "14px",
                            fontSize: "13px",
                            fontWeight: "700",
                            fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.12em",
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.6 : 1,
                            transition: "opacity 0.15s",
                            textTransform: "uppercase",
                        }}
                    >
                        {loading ? "SENDING..." : "SEND MAGIC LINK →"}
                    </button>
                    {error && (
                        <p style={{ fontSize: "12px", color: "var(--danger)" }}>
                            {error}
                        </p>
                    )}
                </motion.form>
            )}
        </AnimatePresence>
    );
}
