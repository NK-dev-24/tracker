"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingData {
    name: string;
    days: 31 | 75 | 90;
    tasks: { id: string; label: string; description: string }[];
}

async function saveProfile(data: OnboardingData) {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.days - 1);
    const endStr = endDate.toISOString().split("T")[0];

    // Upsert profile
    await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        name: data.name || user.user_metadata?.full_name || user.email?.split("@")[0],
        onboarding_complete: true,
    }, { onConflict: "id" });

    // Upsert challenge
    await supabase.from("challenges").upsert({
        user_id: user.id,
        duration: data.days,
        start_date: today,
        end_date: endStr,
        current_day: 1,
        streak_active: true,
        custom_tasks: data.tasks,
    }, { onConflict: "user_id" });

    return true;
}

export default function OnboardingCompleteClient() {
    const router = useRouter();
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
    const [saving, setSaving] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";

    useEffect(() => {
        const raw = sessionStorage.getItem("75hard-onboarding");
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as OnboardingData;
                setOnboardingData(parsed);
                saveProfile(parsed)
                    .then((ok) => { if (!ok) setError("Could not save your profile. Please try again."); })
                    .finally(() => setSaving(false));
            } catch { setError("Session data lost. Please start onboarding again."); setSaving(false); }
        } else {
            // User may already have completed onboarding (returning user)
            setSaving(false);
        }
    }, []);

    if (saving) {
        return (
            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.14em" }}>SAVING YOUR CHALLENGE...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>
                <a href="/onboarding" style={{ color: "var(--accent)", fontSize: "13px" }}>Start again →</a>
            </div>
        );
    }

    const firstName = onboardingData?.name?.split(" ")[0] ?? "You";

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
                            {onboardingData?.days ?? 75}-day challenge saved. Now choose how seriously you want to track it.
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
                                "Visual progress grid for all " + (onboardingData?.days ?? 75) + " days",
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
