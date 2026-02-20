"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, ChevronRight, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { TASKS } from "@/lib/tasks";
import LoginForm from "@/components/LoginForm";

/* ─────────────────────────────────────────────
   Testimonials data
───────────────────────────────────────────── */
const TESTIMONIALS = [
    {
        name: "Arjun S.",
        role: "Software engineer",
        avatar: "AS",
        text: "I've tried every habit tracker. This is the only one that actually scared me enough to stay consistent.",
        stars: 5,
    },
    {
        name: "Priya M.",
        role: "Fitness coach",
        avatar: "PM",
        text: "The midnight reset is brutal but that's exactly what I needed. Hit Day 34 today.",
        stars: 5,
    },
    {
        name: "Daniel K.",
        role: "Entrepreneur",
        avatar: "DK",
        text: "Simple, no fluff, no social garbage. Just you vs the clock. Love it.",
        stars: 5,
    },
    {
        name: "Sarah L.",
        role: "Marathon runner",
        avatar: "SL",
        text: "$7 was the easiest buy of my life. I've changed more in 30 days than in the last year.",
        stars: 5,
    },
    {
        name: "Ravi P.",
        role: "Student",
        avatar: "RP",
        text: "Reset at Day 12 — was devastated. Reset again at Day 8 — still came back. On Day 41 now.",
        stars: 5,
    },
    {
        name: "Emma T.",
        role: "Designer",
        avatar: "ET",
        text: "The design feels like premium hardware. Checking off tasks feels incredibly satisfying.",
        stars: 5,
    },
];

/* ─────────────────────────────────────────────
   Bug Report Modal
───────────────────────────────────────────── */
function BugModal({ onClose }: { onClose: () => void }) {
    const [msg, setMsg] = useState("");
    const [sent, setSent] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: "20px",
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                    borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "440px",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertCircle size={18} color="var(--accent)" />
                        <span className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em", color: "var(--text-primary)" }}>REPORT A BUG</span>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <X size={18} />
                    </button>
                </div>
                {sent ? (
                    <p style={{ fontSize: "14px", color: "var(--success)", textAlign: "center", padding: "20px 0" }}>
                        ✓ Got it. Thanks for helping make this better.
                    </p>
                ) : (
                    <>
                        <textarea
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            placeholder="Describe the bug — what happened, what you expected..."
                            rows={4}
                            style={{
                                width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)",
                                borderRadius: "4px", padding: "12px", color: "var(--text-primary)", fontSize: "13px",
                                fontFamily: "'Space Grotesk', sans-serif", resize: "none", outline: "none", marginBottom: "12px",
                            }}
                        />
                        <button
                            onClick={() => { if (msg.trim()) { setSent(true); } }}
                            style={{
                                width: "100%", padding: "12px", background: "var(--text-primary)", color: "#000",
                                border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
                                fontFamily: "'Space Mono', monospace", letterSpacing: "0.12em", cursor: "pointer",
                            }}
                        >
                            SEND REPORT →
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Testimonial Modal
───────────────────────────────────────────── */
function TestimonialModal({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState("");
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: "20px",
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                    borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "440px",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Star size={18} color="var(--accent)" fill="var(--accent)" />
                        <span className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em", color: "var(--text-primary)" }}>WRITE A TESTIMONIAL</span>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <X size={18} />
                    </button>
                </div>
                {sent ? (
                    <p style={{ fontSize: "14px", color: "var(--success)", textAlign: "center", padding: "20px 0" }}>
                        ✓ Thank you. Your story matters.
                    </p>
                ) : (
                    <>
                        <input
                            value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            style={{
                                width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)",
                                borderRadius: "4px", padding: "12px", color: "var(--text-primary)", fontSize: "13px",
                                fontFamily: "'Space Grotesk', sans-serif", outline: "none", marginBottom: "10px",
                            }}
                        />
                        <textarea
                            value={text} onChange={(e) => setText(e.target.value)}
                            placeholder="How has the 75-day challenge changed you?"
                            rows={4}
                            style={{
                                width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)",
                                borderRadius: "4px", padding: "12px", color: "var(--text-primary)", fontSize: "13px",
                                fontFamily: "'Space Grotesk', sans-serif", resize: "none", outline: "none", marginBottom: "12px",
                            }}
                        />
                        <button
                            onClick={() => { if (name.trim() && text.trim()) setSent(true); }}
                            style={{
                                width: "100%", padding: "12px", background: "var(--accent)", color: "#000",
                                border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
                                fontFamily: "'Space Mono', monospace", letterSpacing: "0.12em", cursor: "pointer",
                            }}
                        >
                            SUBMIT →
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Login + Payment Modal
───────────────────────────────────────────── */
function LoginModal({ onClose }: { onClose: () => void }) {
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: "20px",
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                    borderRadius: "8px", padding: "36px", width: "100%", maxWidth: "420px",
                }}
            >
                {/* Close */}
                <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <X size={18} />
                </button>

                {/* Heading */}
                <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--accent)", marginBottom: "8px" }}>
                    UNLOCK FULL TRACKING
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.1 }}>
                    Save your streak.<br />Own your 75 days.
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
                    Your progress is saved daily. Miss a task before midnight — it resets to Day 0. No mercy. That&apos;s the deal.
                </p>

                {/* Price callout */}
                <div style={{
                    background: "var(--accent-dim)", border: "1px solid var(--accent)",
                    borderRadius: "4px", padding: "14px 18px", marginBottom: "24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>ONE-TIME. FOREVER.</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent)", fontFamily: "'Space Mono', monospace" }}>$7</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>No subscription</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>No refunds. Commitment only.</div>
                    </div>
                </div>

                {/* Payment CTA */}
                <a
                    href={paymentLink}
                    style={{
                        display: "block", width: "100%", padding: "15px",
                        background: "var(--accent)", color: "#000", textDecoration: "none",
                        textAlign: "center", fontFamily: "'Space Mono', monospace",
                        fontSize: "13px", fontWeight: "700", letterSpacing: "0.12em",
                        borderRadius: "4px", marginBottom: "20px",
                    }}
                >
                    PAY $7 AND START →
                </a>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>ALREADY PAID? LOG IN</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                <LoginForm />
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Interactive Task Row (demo, no login required)
───────────────────────────────────────────── */
function DemoTaskRow({
    task, checked, onToggle, index,
}: {
    task: typeof TASKS[0]; checked: boolean; onToggle: () => void; index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, type: "spring", stiffness: 300, damping: 28 }}
            onClick={onToggle}
            style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: checked ? "rgba(59,255,138,0.04)" : "transparent",
                transition: "background 0.2s ease",
                borderRadius: "4px",
                userSelect: "none",
            }}
        >
            {/* Checkbox */}
            <motion.div
                animate={{
                    background: checked ? "var(--success)" : "transparent",
                    borderColor: checked ? "var(--success)" : "var(--border-bright)",
                    scale: checked ? [1, 1.18, 1] : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                style={{
                    width: "26px", height: "26px", flexShrink: 0,
                    border: "2px solid var(--border-bright)", borderRadius: "5px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >
                <AnimatePresence>
                    {checked && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 700, damping: 28 }}
                        >
                            <Check size={14} color="#000" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Label */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: "14px", fontWeight: "600", letterSpacing: "0.06em",
                    color: checked ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: checked ? "line-through" : "none",
                    textTransform: "uppercase",
                    transition: "all 0.2s ease",
                }}>
                    {task.label}
                </div>
                <div style={{ fontSize: "12px", color: checked ? "var(--text-muted)" : "var(--text-secondary)", marginTop: "2px", transition: "color 0.2s ease" }}>
                    {task.description}
                </div>
            </div>

            {/* Dot */}
            <motion.div
                animate={{ backgroundColor: checked ? "var(--success)" : "var(--border-bright)" }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 }}
            />
        </motion.div>
    );
}

/* ─────────────────────────────────────────────
   Main Landing Page Component
───────────────────────────────────────────── */
export default function LandingClient() {
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<"login" | "bug" | "testimonial" | null>(null);
    const [allDoneBefore, setAllDoneBefore] = useState(false);
    const confettiRef = useRef(false);

    const allDone = TASKS.every((t) => checkedTasks.has(t.id));
    const doneCount = checkedTasks.size;

    const fireConfetti = useCallback(() => {
        if (confettiRef.current) return;
        confettiRef.current = true;

        const colors = ["#e8ff47", "#ffffff", "#3bff8a", "#ff3b3b"];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { y: 0.55, x: 0.3 }, colors }), 250);
        setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { y: 0.55, x: 0.7 }, colors }), 400);
        setTimeout(() => { confettiRef.current = false; }, 3000);
    }, []);

    useEffect(() => {
        if (allDone && !allDoneBefore) {
            setAllDoneBefore(true);
            fireConfetti();
        }
        if (!allDone) {
            setAllDoneBefore(false);
        }
    }, [allDone, allDoneBefore, fireConfetti]);

    const toggleTask = (id: string) => {
        setCheckedTasks((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <>
            {/* ── MODALS ── */}
            <AnimatePresence>
                {modal === "bug" && <BugModal onClose={() => setModal(null)} />}
                {modal === "testimonial" && <TestimonialModal onClose={() => setModal(null)} />}
                {modal === "login" && <LoginModal onClose={() => setModal(null)} />}
            </AnimatePresence>

            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

                {/* ── STICKY NAV ── */}
                <nav style={{
                    position: "sticky", top: 0, zIndex: 50,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 28px",
                    background: "rgba(10,10,10,0.92)", backdropFilter: "blur(14px)",
                    borderBottom: "1px solid var(--border)",
                }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="mono" style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "0.15em", color: "var(--text-primary)" }}>75</span>
                        <span style={{
                            fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em",
                            color: "#000", background: "var(--accent)", padding: "2px 6px", borderRadius: "2px", marginTop: "1px",
                        }}>BETA</span>
                    </div>

                    {/* Nav actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                            onClick={() => setModal("bug")}
                            style={{
                                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                                fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", padding: "6px 10px",
                                borderRadius: "4px", transition: "color 0.15s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                            Report bug
                        </button>
                        <button
                            onClick={() => setModal("testimonial")}
                            style={{
                                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                                fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", padding: "6px 10px",
                                borderRadius: "4px", transition: "color 0.15s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                            Write testimonial
                        </button>
                        <button
                            onClick={() => setModal("login")}
                            style={{
                                border: "1px solid var(--border-bright)", borderRadius: "4px",
                                background: "none", color: "var(--text-primary)", cursor: "pointer",
                                fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: "600", padding: "7px 16px", transition: "all 0.15s",
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "var(--text-primary)"; e.currentTarget.style.color = "#000"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                            Login
                        </button>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "60px 24px 40px", maxWidth: "640px", margin: "0 auto", width: "100%",
                }}>
                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "5px 14px", background: "var(--accent-dim)",
                            border: "1px solid var(--accent)", borderRadius: "2px", marginBottom: "28px",
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)" }}
                        />
                        <span className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em" }}>75 DAYS. NO EXCUSES.</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        style={{
                            fontSize: "clamp(16px, 4vw, 20px)", fontWeight: "400",
                            color: "var(--text-secondary)", textAlign: "center",
                            letterSpacing: "0.01em", marginBottom: "8px",
                        }}
                    >
                        What are your tasks for today?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginBottom: "36px" }}
                    >
                        Check them all off before midnight — or start over from Day 0.
                    </motion.p>

                    {/* ── INTERACTIVE CHECKLIST ── */}
                    <div style={{
                        width: "100%",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "20px",
                    }}>
                        {/* Checklist header */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "14px 20px", borderBottom: "1px solid var(--border)",
                            background: "var(--bg-2)",
                        }}>
                            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em" }}>THE 6 DAILY TASKS</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="mono" style={{ fontSize: "11px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>
                                    {doneCount}/{TASKS.length}
                                </span>
                                {/* Mini progress bar */}
                                <div style={{ width: "60px", height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                                    <motion.div
                                        animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                                        style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "2px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tasks */}
                        {TASKS.map((task, i) => (
                            <DemoTaskRow
                                key={task.id}
                                task={task}
                                checked={checkedTasks.has(task.id)}
                                onToggle={() => toggleTask(task.id)}
                                index={i}
                            />
                        ))}
                    </div>

                    {/* ── ALL DONE STATE ── */}
                    <AnimatePresence>
                        {allDone && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                style={{
                                    width: "100%", padding: "20px 24px",
                                    background: "var(--success-dim)", border: "1px solid var(--success)",
                                    borderRadius: "8px", marginBottom: "20px", textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: "22px", marginBottom: "6px" }}>🏆</div>
                                <div className="mono" style={{ fontSize: "13px", color: "var(--success)", letterSpacing: "0.12em", marginBottom: "4px" }}>
                                    YOU DID IT — ALL 6 TASKS DONE
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    Now imagine doing this every day for 75 days straight.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        style={{ width: "100%" }}
                    >
                        <button
                            onClick={() => setModal("login")}
                            style={{
                                width: "100%", padding: "17px",
                                background: allDone ? "var(--success)" : "var(--accent)",
                                color: "#000", border: "none", borderRadius: "6px",
                                fontSize: "14px", fontWeight: "700", fontFamily: "'Space Mono', monospace",
                                letterSpacing: "0.12em", cursor: "pointer", transition: "background 0.3s ease",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            {allDone ? "START TRACKING YOUR REAL STREAK" : "TRACK YOUR 75-DAY STREAK"}
                            <ChevronRight size={16} />
                        </button>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
                            One-time unlock · $7 · No subscription ever
                        </p>
                    </motion.div>
                </section>

                {/* ── WHY 75 HARD ── */}
                <section style={{
                    borderTop: "1px solid var(--border)", padding: "80px 24px",
                    maxWidth: "640px", margin: "0 auto", width: "100%",
                }}>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: "16px" }}>
                        THE PHILOSOPHY
                    </div>
                    <h2 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "24px" }}>
                        Why 75 days<br />of hard?
                    </h2>
                    <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "40px" }}>
                        Most people start a habit and quit when life gets inconvenient. The 75 Hard protocol removes that option. Miss a single task — even one glass of water — and you reset to Day 0. No exceptions. No rest days. No half-measures.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                        {[
                            { icon: "⚡", title: "Mental toughness", desc: "75 consecutive days builds a different kind of discipline." },
                            { icon: "🔄", title: "Zero tolerance", desc: "One miss resets everything. It's the rule that makes it real." },
                            { icon: "📸", title: "Visual proof", desc: "Daily progress photos show you the person you're becoming." },
                            { icon: "📖", title: "Feed your mind", desc: "10 pages daily. How much non-fiction have you read this year?" },
                        ].map((card) => (
                            <motion.div
                                key={card.title}
                                whileHover={{ y: -3, borderColor: "var(--border-bright)" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                style={{
                                    padding: "20px", background: "var(--bg-2)",
                                    border: "1px solid var(--border)", borderRadius: "6px",
                                }}
                            >
                                <div style={{ fontSize: "22px", marginBottom: "10px" }}>{card.icon}</div>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>{card.title}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{card.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section style={{
                    borderTop: "1px solid var(--border)", padding: "80px 0",
                    overflow: "hidden",
                }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto 32px", padding: "0 24px" }}>
                        <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: "12px" }}>
                            FROM THE COMMUNITY
                        </div>
                        <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                            Real people.<br />Real streaks.
                        </h2>
                    </div>

                    {/* Scrolling row */}
                    <div style={{ position: "relative" }}>
                        <motion.div
                            animate={{ x: [0, -1200] }}
                            transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                            style={{ display: "flex", gap: "16px", width: "max-content", paddingLeft: "24px" }}
                        >
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "280px", flexShrink: 0,
                                        padding: "20px", background: "var(--bg-2)",
                                        border: "1px solid var(--border)", borderRadius: "8px",
                                    }}
                                >
                                    {/* Stars */}
                                    <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
                                        {Array.from({ length: t.stars }).map((_, si) => (
                                            <Star key={si} size={12} color="var(--accent)" fill="var(--accent)" />
                                        ))}
                                    </div>
                                    {/* Quote */}
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
                                        &ldquo;{t.text}&rdquo;
                                    </p>
                                    {/* Author */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "50%",
                                            background: "var(--border-bright)", display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "10px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "'Space Mono', monospace",
                                        }}>
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{t.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section style={{
                    borderTop: "1px solid var(--border)", padding: "80px 24px",
                    maxWidth: "640px", margin: "0 auto", width: "100%", textAlign: "center",
                }}>
                    <h2 style={{ fontSize: "clamp(32px, 8vw, 64px)", fontWeight: "700", lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: "24px" }}>
                        75 DAYS.<br />
                        <span style={{ color: "var(--text-muted)" }}>ARE YOU</span><br />
                        READY?
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.7 }}>
                        Stop planning to start. The only way to know if you can do it is to start today — right now.
                    </p>
                    <button
                        onClick={() => setModal("login")}
                        style={{
                            padding: "17px 40px", background: "var(--accent)",
                            color: "#000", border: "none", borderRadius: "6px",
                            fontSize: "14px", fontWeight: "700", fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.12em", cursor: "pointer",
                        }}
                    >
                        START THE CHALLENGE →
                    </button>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
                        One-time payment · $7 · No subscription · No refunds
                    </p>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{
                    borderTop: "1px solid var(--border)", padding: "20px 28px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px",
                }}>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        75 HARD TRACKER © 2025
                    </span>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {["Benefits", "Testimonials", "Changelog"].map((link) => (
                            <button
                                key={link}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", fontFamily: "'Space Grotesk', sans-serif" }}
                                onClick={link === "Testimonials" ? () => setModal("testimonial") : undefined}
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>NO EXCUSES.</span>
                </footer>
            </div>
        </>
    );
}
