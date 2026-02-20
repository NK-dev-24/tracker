"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Check, ChevronRight, Star, AlertCircle, ArrowRight, X, Pencil, ArrowUpRight } from "lucide-react";
import confetti from "canvas-confetti";
import { TASKS } from "@/lib/tasks";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────
   Constants
───────────────────────────────── */
const LS_KEY_CHECKED = "75hard-demo-checked";
const LS_KEY_DRAFT = "75hard-custom-tasks-draft";

const TESTIMONIALS = [
    { name: "Arjun S.", role: "Software engineer", avatar: "AS", text: "I've tried every habit tracker. This is the only one that actually scared me enough to stay consistent.", stars: 5 },
    { name: "Priya M.", role: "Fitness coach", avatar: "PM", text: "The midnight reset is brutal but that's exactly what I needed. Hit Day 34 today.", stars: 5 },
    { name: "Daniel K.", role: "Entrepreneur", avatar: "DK", text: "Simple, no fluff, no social garbage. Just you vs the clock. Love it.", stars: 5 },
    { name: "Sarah L.", role: "Marathon runner", avatar: "SL", text: "The custom tasks changed everything. I set my own rules and finally kept them.", stars: 5 },
    { name: "Ravi P.", role: "Student", avatar: "RP", text: "Reset at Day 12, was devastated. Reset at Day 8, still came back. On Day 41 now.", stars: 5 },
    { name: "Emma T.", role: "Designer", avatar: "ET", text: "Checking off tasks at 11pm when everything hurts — that's when it matters most.", stars: 5 },
];

const CHANGELOG = [
    { date: "Feb 2025", version: "0.4", note: "Customizable hero checklist. Build your protocol before you even sign up." },
    { date: "Feb 2025", version: "0.3", note: "Interactive demo checklist on landing. Confetti on completion." },
    { date: "Feb 2025", version: "0.2", note: "Google OAuth login. Removed email-based magic links." },
    { date: "Feb 2025", version: "0.1", note: "Initial build. Streak tracker, task checklist, midnight reset cron." },
];

const WHY_CARDS = [
    { icon: "⚡", title: "Mental toughness", desc: "75 consecutive days builds a different kind of discipline." },
    { icon: "↺", title: "Zero tolerance", desc: "One miss resets everything. That's the rule that makes it real." },
    { icon: "◎", title: "Visual proof", desc: "Daily progress photos show you the person you're becoming." },
    { icon: "◫", title: "Feed your mind", desc: "10 pages daily. How much have you actually read this year?" },
];

/* ─────────────────────────────────
   Helpers
───────────────────────────────── */
function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-body)", color: "var(--text-secondary)", padding: "6px 10px", borderRadius: "4px", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
            {label}
        </button>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="mono" style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
            {children}
        </span>
    );
}

/* ─────────────────────────────────
   Google sign-in helper
───────────────────────────────── */
async function signInWithGoogle() {
    const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url";
    if (!isConfigured) { alert("Supabase not configured — fill in .env.local first."); return; }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
}

/* ─────────────────────────────────
   Modals
───────────────────────────────── */
function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", h);
        return () => document.removeEventListener("keydown", h);
    }, [onClose]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px", backdropFilter: "blur(6px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                style={{ background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: "10px", padding: "32px", width: "100%", maxWidth: "420px", position: "relative" }}>
                <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                    <X size={17} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

function SimpleForm({ fields, submitLabel, successMsg, accentBg = "var(--text-primary)" }: { fields: any[]; submitLabel: string; successMsg: string; accentBg?: string }) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [sent, setSent] = useState(false);
    const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)", borderRadius: "6px", padding: "11px 14px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body)", outline: "none", marginBottom: "8px" };
    if (sent) return <p style={{ fontSize: "13px", color: "var(--success)", textAlign: "center", padding: "24px 0" }}>{successMsg}</p>;
    return (
        <>
            {fields.map((f) => f.multiline
                ? <textarea key={f.key} placeholder={f.placeholder} rows={4} value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} style={{ ...inputStyle, resize: "none" }} />
                : <input key={f.key} placeholder={f.placeholder} value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} style={inputStyle} />
            )}
            <button onClick={() => { if (fields.every((f) => values[f.key]?.trim())) setSent(true); }}
                style={{ width: "100%", marginTop: "4px", padding: "12px", background: accentBg, color: "#000", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: "pointer" }}>
                {submitLabel}
            </button>
        </>
    );
}

function BugModal({ onClose }: { onClose: () => void }) {
    return <ModalShell onClose={onClose}><div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><AlertCircle size={16} color="var(--accent)" /><span style={{ fontSize: "14px", fontWeight: "600" }}>Report a bug</span></div><SimpleForm fields={[{ key: "msg", placeholder: "What happened? What did you expect?", multiline: true }]} submitLabel="Send report" successMsg="Got it — thanks for helping." /></ModalShell>;
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
    return <ModalShell onClose={onClose}><div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}><Star size={16} color="var(--accent)" fill="var(--accent)" /><span style={{ fontSize: "14px", fontWeight: "600" }}>Write a testimonial</span></div><p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Your story might give someone else the push they need.</p><SimpleForm fields={[{ key: "name", placeholder: "Your name" }, { key: "text", placeholder: "How has the challenge changed you?", multiline: true }]} submitLabel="Submit" successMsg="Thank you — your story matters." accentBg="var(--accent)" /></ModalShell>;
}

function ChangelogModal({ onClose }: { onClose: () => void }) {
    return <ModalShell onClose={onClose}><div style={{ marginBottom: "24px" }}><Tag>Changelog</Tag><h2 style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" }}>What&apos;s new</h2></div>{CHANGELOG.map((entry, i) => (<div key={i} style={{ padding: "14px 0", borderBottom: i < CHANGELOG.length - 1 ? "1px solid var(--border)" : "none", display: "flex", gap: "16px" }}><span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", width: "40px", flexShrink: 0, paddingTop: "2px" }}>v{entry.version}</span><div><span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>{entry.date}</span><span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{entry.note}</span></div></div>))}</ModalShell>;
}


/* ─────────────────────────────────
   Main component
───────────────────────────────── */
type ModalType = "bug" | "testimonial" | "changelog" | null;

interface Task { id: string; label: string; description: string; }

export default function LandingClient() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>(TASKS);
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<ModalType>(null);
    const [hydrated, setHydrated] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const confettiFired = useRef(false);

    // Track editing state
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedDraft = sessionStorage.getItem(LS_KEY_DRAFT);
            if (savedDraft) setTasks(JSON.parse(savedDraft));

            const savedChecked = localStorage.getItem(LS_KEY_CHECKED);
            if (savedChecked) setCheckedTasks(new Set(JSON.parse(savedChecked)));
        } catch { /* ignore */ }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (hydrated) {
            localStorage.setItem(LS_KEY_CHECKED, JSON.stringify([...checkedTasks]));
            sessionStorage.setItem(LS_KEY_DRAFT, JSON.stringify(tasks));
        }
    }, [checkedTasks, tasks, hydrated]);

    const allDone = tasks.every((t) => checkedTasks.has(t.id));
    const doneCount = checkedTasks.size;

    const fireConfetti = useCallback(() => {
        if (confettiFired.current) return;
        confettiFired.current = true;
        const colors = ["#d4f23d", "#ffffff", "#2dcc70", "#cccccc"];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 55, spread: 100, origin: { y: 0.55, x: 0.2 }, colors }), 220);
        setTimeout(() => confetti({ particleCount: 55, spread: 100, origin: { y: 0.55, x: 0.8 }, colors }), 400);
        setTimeout(() => { confettiFired.current = false; }, 6000);
    }, []);

    useEffect(() => { if (allDone && hydrated && tasks.length > 0) fireConfetti(); }, [allDone, hydrated, fireConfetti, tasks]);

    const toggleTask = useCallback((id: string) => {
        setCheckedTasks((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    }, []);

    const handleLogin = useCallback(async () => {
        setLoginLoading(true);
        await signInWithGoogle();
        setLoginLoading(false);
    }, []);

    const updateTask = (id: string, field: "label" | "description", value: string) => {
        setTasks((ts) => ts.map((t) => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTask = (id: string) => {
        if (tasks.length <= 1) return;
        setTasks((ts) => ts.filter((t) => t.id !== id));
        setCheckedTasks((prev) => { const next = new Set(prev); next.delete(id); return next; });
        if (editingId === id) setEditingId(null);
    };

    const addTask = () => {
        if (tasks.length >= 6) return;
        const newTask: Task = { id: `custom-${Date.now()}`, label: "NEW TASK", description: "Define what this means for you" };
        setTasks((ts) => [...ts, newTask]);
        setEditingId(newTask.id);
    };

    const closeModal = useCallback(() => setModal(null), []);

    const proceedToOnboarding = useCallback(() => {
        // Save the current tasks as the draft before navigating
        sessionStorage.setItem(LS_KEY_DRAFT, JSON.stringify(tasks));
        router.push("/onboarding");
    }, [tasks, router]);

    return (
        <>
            <AnimatePresence>
                {modal === "bug" && <BugModal key="bug" onClose={closeModal} />}
                {modal === "testimonial" && <TestimonialModal key="testimonial" onClose={closeModal} />}
                {modal === "changelog" && <ChangelogModal key="changelog" onClose={closeModal} />}
            </AnimatePresence>

            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

                {/* ── NAV ── */}
                <nav style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="mono" style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "0.16em", color: "var(--text-primary)" }}>75</span>
                        <span className="mono" style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#000", background: "var(--accent)", padding: "2px 7px", borderRadius: "3px" }}>BETA</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <NavBtn label="Benefits" onClick={() => scrollTo("benefits")} />
                        <NavBtn label="Testimonials" onClick={() => scrollTo("testimonials")} />
                        <button
                            onClick={handleLogin} disabled={loginLoading}
                            style={{ marginLeft: "14px", padding: "8px 20px", border: "1px solid var(--border-bright)", borderRadius: "6px", background: "none", color: "var(--text-primary)", cursor: loginLoading ? "wait" : "pointer", fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: "600", transition: "background 0.15s, color 0.15s", opacity: loginLoading ? 0.6 : 1 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--text-primary)"; e.currentTarget.style.color = "#000"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                            {loginLoading ? "Loading..." : "Log in"}
                        </button>
                    </div>
                </nav>

                {/* ── ALIEN/PREMIUM AMBIENT BACKGROUND ── */}
                <div style={{ position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "1200px", height: "600px", background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%)", pointerEvents: "none", zIndex: 0 }} />

                {/* ── HERO ── */}
                <section style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 24px 80px", maxWidth: "720px", margin: "0 auto", width: "100%" }}>

                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "30px", marginBottom: "36px", backdropFilter: "blur(10px)" }}>
                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "block", boxShadow: "0 0 10px var(--success)" }} />
                        <span className="mono" style={{ fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.2em", fontWeight: "600" }}>THE BRUTAL ACCOUNTABILITY PROTOCOL</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
                        style={{ fontSize: "clamp(46px, 9vw, 84px)", fontWeight: "800", color: "var(--text-primary)", textAlign: "center", fontFamily: "var(--font-heading)", letterSpacing: "-0.045em", lineHeight: 0.95, marginBottom: "24px", textShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                        Stop negotiating<br />
                        <span style={{ background: "linear-gradient(180deg, var(--text-muted) 0%, #333 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>with yourself.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        style={{ fontSize: "16px", color: "var(--text-secondary)", textAlign: "center", marginBottom: "56px", lineHeight: 1.6, maxWidth: "520px", fontWeight: "400" }}>
                        Build your daily non-negotiable tasks. Complete them before midnight. Miss one, and the system resets you to Day 0. <strong>It&apos;s not supposed to be easy.</strong>
                    </motion.p>

                    {/* Interactive Editable Demo Checklist */}
                    <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 35 }}
                        style={{ width: "100%", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", overflow: "hidden", marginBottom: "28px", background: "rgba(15,15,15,0.6)", backdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.2em", fontWeight: "600" }}>YOUR PROTOCOL</span>
                                {tasks.length < 6 && (
                                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontStyle: "italic", opacity: 0.6 }}>(Click tasks to edit)</span>
                                )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span className="mono" style={{ fontSize: "12px", color: allDone && tasks.length ? "var(--success)" : "var(--text-secondary)", fontWeight: "600" }}>{doneCount}/{tasks.length}</span>
                                <div style={{ width: "70px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                                    <motion.div animate={{ width: tasks.length ? `${(doneCount / tasks.length) * 100}%` : "0%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }}
                                        style={{ height: "100%", background: allDone && tasks.length ? "var(--success)" : "var(--text-primary)", borderRadius: "4px", boxShadow: allDone ? "0 0 10px var(--success)" : "none" }} />
                                </div>
                            </div>
                        </div>

                        {/* Task List */}
                        {tasks.map((task, i) => {
                            const done = checkedTasks.has(task.id);
                            const isEditing = editingId === task.id;

                            if (isEditing) {
                                return (
                                    <div key={task.id} style={{ padding: "20px 24px", background: "var(--bg)", borderBottom: i < tasks.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
                                        <input value={task.label} onChange={(e) => updateTask(task.id, "label", e.target.value.toUpperCase())}
                                            autoFocus
                                            style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.08em", fontFamily: "var(--font-body)", outline: "none", marginBottom: "8px", textTransform: "uppercase" }}
                                            placeholder="TASK NAME" />
                                        <input value={task.description} onChange={(e) => updateTask(task.id, "description", e.target.value)}
                                            style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "13px", fontFamily: "var(--font-body)", outline: "none" }}
                                            placeholder="Short description" />
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
                                            {tasks.length > 1 && (
                                                <button onClick={() => removeTask(task.id)}
                                                    style={{ padding: "6px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "6px", color: "#ec8a8a", fontSize: "12px", fontWeight: "500", fontFamily: "var(--font-body)", cursor: "pointer", letterSpacing: "0.04em", transition: "background 0.2s" }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.2)"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.1)"}>
                                                    Remove
                                                </button>
                                            )}
                                            <motion.button onClick={() => { if (task.label.trim()) setEditingId(null); }}
                                                style={{ marginLeft: "auto", padding: "8px 20px", background: "var(--text-primary)", border: "none", borderRadius: "6px", color: "#000", fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-body)", cursor: "pointer", transition: "transform 0.1s" }}
                                                whileTap={{ scale: 0.95 }}>
                                                Done Editing
                                            </motion.button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={task.id} style={{ position: "relative", borderBottom: i < tasks.length - 1 || tasks.length < 6 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                                    <motion.button
                                        onClick={() => toggleTask(task.id)}
                                        whileTap={{ scale: 0.99 }}
                                        style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 24px", width: "100%", border: "none", background: done ? "rgba(45,204,112,0.03)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                                        <div style={{ width: "24px", height: "24px", flexShrink: 0, borderRadius: "6px", border: `2px solid ${done ? "var(--success)" : "rgba(255,255,255,0.2)"}`, background: done ? "var(--success)" : "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", boxShadow: done ? "0 0 12px rgba(45,204,112,0.4)" : "none" }}>
                                            <AnimatePresence>
                                                {done && (
                                                    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 28 }}>
                                                        <Check size={14} color="#000" strokeWidth={3.5} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none", transition: "color 0.2s" }}>{task.label}</div>
                                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px", textDecoration: done ? "line-through" : "none", transition: "color 0.2s" }}>{task.description}</div>
                                        </div>
                                    </motion.button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingId(task.id); }}
                                        title="Edit this task"
                                        style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "8px", opacity: 0.5, transition: "opacity 0.2s, color 0.2s" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                                        <Pencil size={14} />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Add Task Button */}
                        {!editingId && tasks.length < 6 && (
                            <button onClick={addTask}
                                style={{ width: "100%", padding: "16px 24px", background: "rgba(255,255,255,0.01)", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.2s, color 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; }}>
                                <span style={{ fontSize: "18px", lineHeight: 1, fontWeight: "300" }}>+</span> Add a custom task ({6 - tasks.length} max)
                            </button>
                        )}
                    </motion.div>

                    {/* Completion summary */}
                    <AnimatePresence>
                        {allDone && tasks.length > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
                                style={{ width: "100%", overflow: "hidden", marginBottom: "24px" }}>
                                <div style={{ padding: "20px 24px", background: "rgba(45,204,112,0.1)", border: "1px solid rgba(45,204,112,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(45,204,112,0.1)" }}>
                                    <div>
                                        <div className="mono" style={{ fontSize: "12px", color: "var(--success)", letterSpacing: "0.15em", marginBottom: "4px", fontWeight: "700" }}>PROTOCOL COMPLETED</div>
                                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Now try doing this every day for 75 days without failing.</div>
                                    </div>
                                    <div style={{ width: "36px", height: "36px", background: "rgba(45,204,112,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Check size={18} color="var(--success)" strokeWidth={3} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main CTA */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ width: "100%" }}>
                        <button
                            onClick={proceedToOnboarding}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                width: "100%", padding: "22px", background: allDone ? "var(--success)" : "var(--text-primary)",
                                color: "#000", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer",
                                fontWeight: "800", fontFamily: "var(--font-body)", transition: "all 0.3s ease",
                                boxShadow: allDone ? "0 10px 40px rgba(45,204,112,0.3)" : "0 10px 30px rgba(255,255,255,0.15)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02) translateY(-2px)"; e.currentTarget.style.boxShadow = allDone ? "0 15px 50px rgba(45,204,112,0.5)" : "0 15px 40px rgba(255,255,255,0.25)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = allDone ? "0 10px 40px rgba(45,204,112,0.3)" : "0 10px 30px rgba(255,255,255,0.15)"; }}
                        >
                            {allDone ? "Lock in my protocol and start →" : "Sign the contract and start →"}
                        </button>
                        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={12} color="var(--text-secondary)" /> Try it free</span>
                            <span style={{ width: "4px", height: "4px", background: "var(--border)", borderRadius: "50%" }} />
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Check size={12} color="var(--text-secondary)" /> No credit card required</span>
                        </div>
                    </motion.div>
                </section>

                {/* ── BENEFITS ── */}
                <section id="benefits" style={{ borderTop: "1px solid var(--border)", padding: "100px 24px" }}>
                    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                        <Tag>The philosophy</Tag>
                        <h2 style={{ fontSize: "clamp(30px, 6vw, 42px)", fontWeight: "700", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "22px" }}>
                            Discipline is a decision,<br />not a feeling.
                        </h2>
                        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "44px", maxWidth: "540px" }}>
                            You&apos;ve started before. You&apos;ve quit before. So has everyone here. The difference with this protocol is the reset — miss one task and you restart from Day 0, no matter what day you&apos;re on. No negotiation. That ruthlessness is the point.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                            {WHY_CARDS.map((card) => (
                                <motion.div key={card.title} whileHover={{ y: -2, borderColor: "var(--border-bright)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    style={{ padding: "24px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                                    <div style={{ marginBottom: "14px", fontSize: "20px", color: "var(--text-secondary)" }}>{card.icon}</div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--text-primary)" }}>{card.title}</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{card.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section id="testimonials" style={{ borderTop: "1px solid var(--border)", padding: "100px 0", overflow: "hidden" }}>
                    <div style={{ maxWidth: "700px", margin: "0 auto 40px", padding: "0 24px" }}>
                        <Tag>From the community</Tag>
                        <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.025em" }}>Real people.<br />Real streaks.</h2>
                    </div>
                    <motion.div animate={{ x: [0, -1350] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        style={{ display: "flex", gap: "16px", width: "max-content", paddingLeft: "24px" }}>
                        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <div key={i} style={{ width: "300px", flexShrink: 0, padding: "24px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                                <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                                    {Array.from({ length: t.stars }).map((_, si) => <Star key={si} size={12} color="var(--accent)" fill="var(--accent)" />)}
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.65, marginBottom: "20px" }}>&ldquo;{t.text}&rdquo;</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <span className="mono" style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>{t.avatar}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "14px", fontWeight: "600" }}>{t.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* ── FINAL CTA ── */}
                <section style={{ borderTop: "1px solid var(--border)", padding: "120px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "var(--bg-2)" }}>
                    <div style={{ maxWidth: "600px" }}>
                        <h2 style={{ fontSize: "clamp(48px, 10vw, 84px)", fontWeight: "700", lineHeight: 0.95, letterSpacing: "-0.035em", marginBottom: "32px" }}>
                            75 DAYS.<br /><span style={{ color: "var(--text-muted)" }}>WHO WILL</span><br />YOU BE?
                        </h2>
                        <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "44px", lineHeight: 1.75, maxWidth: "440px", margin: "0 auto 44px" }}>
                            A year from now, you&apos;ll either have done this or have another reason why you didn&apos;t. The people who finish aren&apos;t special. They just started.
                        </p>
                        <button onClick={proceedToOnboarding} style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "18px 48px", background: "var(--text-primary)", color: "#000", border: "none", cursor: "pointer", borderRadius: "8px", fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-body)", transition: "transform 0.15s, background 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                            Start the challenge
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", background: "var(--bg)" }}>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>75 PROTOCOL © 2025</span>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <NavBtn label="Benefits" onClick={() => scrollTo("benefits")} />
                        <NavBtn label="Testimonials" onClick={() => scrollTo("testimonials")} />
                        <NavBtn label="Changelog" onClick={() => setModal("changelog")} />
                        <NavBtn label="Write testimonial" onClick={() => setModal("testimonial")} />
                        <NavBtn label="Report bug" onClick={() => setModal("bug")} />
                    </div>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>ZERO EXCUSES.</span>
                </footer>
            </div>
        </>
    );
}
