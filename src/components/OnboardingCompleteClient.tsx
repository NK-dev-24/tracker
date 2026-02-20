"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowUpRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingData {
    name: string;
    days: 31 | 75 | 90;
    tasks: { id: string; label: string; description: string }[];
}

export default function OnboardingCompleteClient() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("You");
    const [days, setDays] = useState(75);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";

    useEffect(() => {
        // Read onboarding data from localStorage for display purposes
        const raw = localStorage.getItem("75hard-onboarding");
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as OnboardingData;
                setFirstName(parsed.name?.split(" ")[0] || "You");
                setDays(parsed.days || 75);

                // The auth/callback already saved the profile server-side.
                // But if for some reason it didn't (localStorage still present AND
                // profile shows not complete), try saving via API as fallback.
                setSaving(true);
                fetch("/api/save-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: parsed.name, days: parsed.days, tasks: parsed.tasks }),
                })
                    .then(async (res) => {
                        const json = await res.json();
                        if (res.ok || json.error?.includes("already")) {
                            localStorage.removeItem("75hard-onboarding");
                        } else if (res.status !== 401) {
                            // Only show non-auth errors (401 = callback already saved, all good)
                            setError(json.error ?? "Could not save profile.");
                        } else {
                            // 401 is fine — callback already saved the profile
                            localStorage.removeItem("75hard-onboarding");
                        }
                    })
                    .catch(() => {
                        // Network error — ignore, callback may have already saved
                    })
                    .finally(() => setSaving(false));
            } catch {
                setSaving(false);
            }
        }
    }, []);

    if (saving) {
        return (
            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <Loader2 size={20} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.14em" }}>LOCKING IN YOUR CHALLENGE...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "16px" }}>
                <p style={{ color: "var(--danger)", textAlign: "center", maxWidth: "360px", fontSize: "14px", lineHeight: 1.6 }}>{error}</p>
                <a href="/onboarding" style={{ color: "var(--accent)", fontSize: "13px" }}>Start again →</a>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{ width: "100%", maxWidth: "480px" }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36, ease: "easeOut" }}>

                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
                            style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--success-dim)", border: "1px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <Check size={22} color="var(--success)" strokeWidth={2.5} />
                        </motion.div>
                        <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "10px" }}>
                            You&apos;re committed,<br />{firstName}.
                        </h1>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                            {days}-day challenge locked in. Now choose how seriously you want to track it.
                        </p>
                    </div>

                    {/* Option A — Paid */}
                    <div style={{ padding: "22px", background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                            <div>
                                <span className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.14em", display: "block", marginBottom: "4px" }}>FULL TRACKING · ONE-TIME</span>
                                <span className="mono" style={{ fontSize: "38px", fontWeight: "700", color: "var(--accent)", lineHeight: 1 }}>$4</span>
                            </div>
                            <div style={{ textAlign: "right", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.9 }}>Beta price<br />No subscription<br />No refunds</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
                            {[
                                "Daily progress saved forever",
                                "Streak resets at midnight if you miss a task",
                                `Visual progress grid for all ${days} days`,
                                "Custom tasks locked in from your onboarding",
                                "Motivational messages at key milestone days",
                            ].map((f) => (
                                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                    <Check size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: "3px" }} />
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{f}</span>
                                </div>
                            ))}
                        </div>
                        <a href={paymentLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px", background: "var(--accent)", color: "#000", textDecoration: "none", fontWeight: "700", fontSize: "14px", fontFamily: "var(--font-body)", borderRadius: "7px" }}>
                            Pay $4 and start tracking <ArrowUpRight size={15} />
                        </a>
                    </div>

                    {/* Option B — Free */}
                    <div style={{ padding: "18px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.14em", display: "block", marginBottom: "6px" }}>USE FOR FREE</span>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
                            Track daily tasks without saving. Progress resets every day — nothing is stored between sessions.
                        </p>
                        <button onClick={() => router.push("/tracker")}
                            style={{ width: "100%", padding: "12px", background: "var(--bg-3)", border: "1px solid var(--border-bright)", borderRadius: "6px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "13px", fontFamily: "var(--font-body)", cursor: "pointer" }}>
                            Use without saving
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
