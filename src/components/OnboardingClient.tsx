"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, RotateCcw, Pencil } from "lucide-react";
import { TASKS } from "@/lib/tasks";

/* ─────────────────────────────────
   Types
───────────────────────────────── */
type Step = "name" | "science-1" | "duration" | "science-2" | "goals" | "science-3" | "sign" | "account";

interface CustomTask { id: string; label: string; description: string; }
interface UserData { name: string; days: 31 | 75 | 90; tasks: CustomTask[]; }

/* ─────────────────────────────────
   Constants
───────────────────────────────── */
const STEP_ORDER: Step[] = ["name", "science-1", "duration", "science-2", "goals", "science-3", "sign", "account"];

const DURATION_OPTIONS: { days: 31 | 75 | 90; label: string; desc: string; tag?: string }[] = [
    { days: 31, label: "31 Days", desc: "Build the foundation. One month of zero excuses." },
    { days: 75, label: "75 Days", desc: "The original protocol. The one that changes people.", tag: "ORIGINAL" },
    { days: 90, label: "90 Days", desc: "For those who want to go further than most dared." },
];

const SCIENCE: Record<string, { stat: string; unit: string; claim: string; source: string; color: string }> = {
    "science-1": { stat: "3×", unit: "more likely", claim: "People who make a written commitment to a goal achieve it at 3x the rate of those who only think about it.", source: "Dominican University of California, 2015", color: "var(--accent)" },
    "science-2": { stat: "66", unit: "days", claim: "The average time it takes for a new behaviour to become automatic. Not 21 days — that was a myth.", source: "Phillippa Lally, University College London", color: "var(--success)" },
    "science-3": { stat: "91%", unit: "higher success", claim: "People with specific, time-bound goals outperform those with vague intentions by a margin of 9 to 1.", source: "American Psychological Association", color: "#a78bfa" },
};

const DEFAULT_TASKS: CustomTask[] = TASKS.map((t) => ({ id: t.id, label: t.label, description: t.description }));

/* ─────────────────────────────────
   Helpers
───────────────────────────────── */
const pv = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };
const pt = { duration: 0.34, ease: "easeOut" } as const;

function Stepper({ current }: { current: number }) {
    return (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "40px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} animate={{ width: i === current ? "28px" : "8px", background: i < current ? "var(--success)" : i === current ? "var(--accent)" : "var(--border-bright)" }}
                    transition={{ type: "spring", stiffness: 360, damping: 32 }} style={{ height: "4px", borderRadius: "4px" }} />
            ))}
        </div>
    );
}

function MonoLabel({ children }: { children: React.ReactNode }) {
    return <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em", display: "block", marginBottom: "14px" }}>{children}</span>;
}

function PrimaryBtn({ label, onClick, disabled, icon }: { label: string; onClick?: () => void; disabled?: boolean; icon?: React.ReactNode }) {
    return (
        <motion.button onClick={onClick} disabled={disabled}
            whileHover={!disabled ? { scale: 1.012 } : {}} whileTap={!disabled ? { scale: 0.984 } : {}}
            style={{ width: "100%", padding: "16px", background: disabled ? "var(--border)" : "var(--accent)", color: disabled ? "var(--text-muted)" : "#000", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s, color 0.2s" }}>
            {label}{icon}
        </motion.button>
    );
}

/* ─────────────────────────────────
   Science interstitial
───────────────────────────────── */
function StepScience({ id, onNext }: { id: string; onNext: () => void }) {
    const fact = SCIENCE[id];
    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 1800); return () => clearTimeout(t); }, []);
    return (
        <motion.div {...pv} transition={pt} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                style={{ fontSize: "clamp(72px, 16vw, 110px)", fontWeight: "700", fontFamily: "var(--font-heading)", letterSpacing: "-0.04em", color: fact.color, lineHeight: 1, marginBottom: "8px" }}>
                {fact.stat}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mono"
                style={{ fontSize: "12px", color: fact.color, letterSpacing: "0.16em", marginBottom: "28px" }}>
                {fact.unit.toUpperCase()}
            </motion.div>
            <div style={{ width: "200px", height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", marginBottom: "28px" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                    style={{ height: "100%", background: fact.color, borderRadius: "2px" }} />
            </div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
                style={{ fontSize: "17px", color: "var(--text-primary)", lineHeight: 1.7, maxWidth: "380px", marginBottom: "10px" }}>
                {fact.claim}
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mono"
                style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "44px" }}>
                — {fact.source}
            </motion.p>
            <AnimatePresence>
                {ready && (
                    <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={onNext} whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{ padding: "13px 32px", background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        Continue <ArrowRight size={14} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Name
───────────────────────────────── */
function StepName({ onNext }: { onNext: (name: string) => void }) {
    const [name, setName] = useState("");
    const valid = name.trim().length > 1;
    return (
        <motion.div {...pv} transition={pt}>
            <Stepper current={0} />
            <MonoLabel>STEP 1 OF 4</MonoLabel>
            <h1 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>
                Before we begin,<br />what do we call you?
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", maxWidth: "400px" }}>
                This isn&apos;t a passive tracker. You&apos;re making a contract with yourself. Let&apos;s start by putting your name on it.
            </p>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && valid && onNext(name.trim())}
                placeholder="Your full name"
                style={{ width: "100%", padding: "16px 18px", background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "18px", fontFamily: "var(--font-body)", outline: "none", marginBottom: "14px" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")} />
            <PrimaryBtn label="Continue" onClick={() => valid && onNext(name.trim())} disabled={!valid} icon={<ArrowRight size={15} />} />
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Duration
───────────────────────────────── */
function StepDuration({ onNext }: { onNext: (days: 31 | 75 | 90) => void }) {
    const [selected, setSelected] = useState<31 | 75 | 90>(75);
    return (
        <motion.div {...pv} transition={pt}>
            <Stepper current={1} />
            <MonoLabel>STEP 2 OF 4</MonoLabel>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Choose your battle.</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "28px" }}>
                There is no wrong answer. There is only the answer you will actually show up for.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {DURATION_OPTIONS.map((opt) => (
                    <button key={opt.days} onClick={() => setSelected(opt.days)}
                        style={{ padding: "18px 20px", textAlign: "left", background: selected === opt.days ? "var(--accent-dim)" : "var(--bg-2)", border: `1px solid ${selected === opt.days ? "var(--accent)" : "var(--border)"}`, borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "15px", fontWeight: "700", color: selected === opt.days ? "var(--accent)" : "var(--text-primary)" }}>{opt.label}</span>
                                {opt.tag && <span className="mono" style={{ fontSize: "9px", color: "#000", background: "var(--accent)", padding: "2px 6px", borderRadius: "3px", letterSpacing: "0.12em" }}>{opt.tag}</span>}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{opt.desc}</div>
                        </div>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, border: `2px solid ${selected === opt.days ? "var(--accent)" : "var(--border-bright)"}`, background: selected === opt.days ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                            {selected === opt.days && <Check size={11} color="#000" strokeWidth={3} />}
                        </div>
                    </button>
                ))}
            </div>
            <PrimaryBtn label={`I choose ${selected} days`} onClick={() => onNext(selected)} icon={<ArrowRight size={15} />} />
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Goals (editable tasks, 1–6)
───────────────────────────────── */
function StepGoals({ days, onNext }: { days: number; onNext: (tasks: CustomTask[]) => void }) {
    const [tasks, setTasks] = useState<CustomTask[]>(DEFAULT_TASKS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);

    const MAX = 6;
    const count = tasks.length;
    const atMax = count >= MAX;
    const atMin = count <= 1;

    const updateTask = (id: string, field: "label" | "description", value: string) => {
        setTasks((ts) => ts.map((t) => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTask = (id: string) => {
        if (atMin) return;
        setTasks((ts) => ts.filter((t) => t.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const addTask = () => {
        if (atMax) return;
        const newTask: CustomTask = { id: `custom-${Date.now()}`, label: "NEW TASK", description: "Define what this means for you" };
        setTasks((ts) => [...ts, newTask]);
        setEditingId(newTask.id);
    };

    return (
        <motion.div {...pv} transition={pt}>
            <Stepper current={2} />
            <MonoLabel>STEP 3 OF 4</MonoLabel>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 34px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "8px" }}>
                Your {days}-day<br />non-negotiables.
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                <strong style={{ color: "var(--accent)" }}>Click any task to customise it.</strong> You can use between 1 and 6 tasks — 6 is the optimal daily load. Once confirmed, they&apos;re locked for all {days} days.
            </p>

            {/* Task count badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.14em" }}>YOUR TASKS</span>
                <span className="mono" style={{ fontSize: "10px", letterSpacing: "0.12em", color: atMax ? "var(--accent)" : "var(--text-muted)" }}>
                    {count}/{MAX}{atMax ? " · OPTIMAL" : ""}
                </span>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                {tasks.map((task, i) => (
                    <div key={task.id} style={{ borderBottom: i < tasks.length - 1 ? "1px solid var(--border)" : "none" }}>
                        {editingId === task.id ? (
                            <div style={{ padding: "12px 16px", background: "var(--accent-dim)" }}>
                                <input value={task.label} onChange={(e) => updateTask(task.id, "label", e.target.value.toUpperCase())}
                                    autoFocus
                                    style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", fontFamily: "var(--font-body)", outline: "none", marginBottom: "4px", textTransform: "uppercase" }}
                                    placeholder="TASK NAME" />
                                <input value={task.description} onChange={(e) => updateTask(task.id, "description", e.target.value)}
                                    style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "11px", fontFamily: "var(--font-body)", outline: "none" }}
                                    placeholder="Short description" />
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                                    {!atMin && (
                                        <button onClick={() => removeTask(task.id)}
                                            style={{ padding: "4px 10px", background: "var(--danger-dim)", border: "1px solid var(--danger)", borderRadius: "4px", color: "var(--danger)", fontSize: "10px", fontFamily: "var(--font-body)", cursor: "pointer", letterSpacing: "0.08em" }}>
                                            REMOVE
                                        </button>
                                    )}
                                    <button onClick={() => { if (task.label.trim()) setEditingId(null); }}
                                        style={{ marginLeft: "auto", padding: "5px 14px", background: "var(--accent)", border: "none", borderRadius: "5px", color: "#000", fontSize: "11px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: "pointer" }}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => !confirmed && setEditingId(task.id)}
                                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "none", border: "none", cursor: confirmed ? "default" : "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                                <div style={{ width: "18px", height: "18px", flexShrink: 0, borderRadius: "4px", background: "var(--success-dim)", border: "1px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Check size={10} color="var(--success)" strokeWidth={3} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-primary)" }}>{task.label}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{task.description}</div>
                                </div>
                                {!confirmed && <Pencil size={11} color="var(--text-muted)" />}
                            </button>
                        )}
                    </div>
                ))}

                {/* Add task row */}
                {!confirmed && (
                    <button onClick={addTask} disabled={atMax}
                        style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", borderTop: tasks.length > 0 ? "1px dashed var(--border)" : "none", cursor: atMax ? "default" : "pointer", textAlign: "left", fontFamily: "var(--font-body)", color: atMax ? "var(--text-muted)" : "var(--text-secondary)", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.15s" }}>
                        <span style={{ fontSize: "16px", lineHeight: 1, opacity: atMax ? 0.4 : 0.7 }}>+</span>
                        {atMax ? "Max 6 tasks — optimal for daily consistency" : `Add a task (${MAX - count} remaining)`}
                    </button>
                )}
            </div>

            {/* Confirm lock */}
            <button onClick={() => setConfirmed(!confirmed)}
                style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", background: "var(--bg-2)", border: `1px solid ${confirmed ? "var(--accent)" : "var(--border)"}`, borderRadius: "8px", cursor: "pointer", marginBottom: "18px", width: "100%", textAlign: "left", fontFamily: "var(--font-body)", transition: "border-color 0.15s" }}>
                <div style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "1px", borderRadius: "4px", border: `2px solid ${confirmed ? "var(--accent)" : "var(--border-bright)"}`, background: confirmed ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                    {confirmed && <Check size={10} color="#000" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    These are my {count} {count === 1 ? "task" : "tasks"} for all {days} days. I will not change them mid-challenge.
                </span>
            </button>

            <PrimaryBtn label="Confirm my tasks" onClick={() => confirmed && !editingId && onNext(tasks)} disabled={!confirmed || !!editingId} icon={<ArrowRight size={15} />} />
            {editingId && <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>Save the open task before confirming.</p>}
        </motion.div>
    );
}


/* ─────────────────────────────────
   Step: Signature
───────────────────────────────── */
function StepSign({ userData, onNext }: { userData: UserData; onNext: () => void }) {
    const [signed, setSigned] = useState(false);
    return (
        <motion.div {...pv} transition={pt}>
            <Stepper current={3} />
            <MonoLabel>STEP 4 OF 4</MonoLabel>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Make it official.</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
                Sign below. This is your commitment to yourself — not to us, not to anyone else. Just you.
            </p>
            <div style={{ padding: "22px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "24px" }}>
                    I, <strong style={{ color: "var(--text-primary)" }}>{userData.name}</strong>, commit to completing all {userData.tasks.length} daily tasks for <strong style={{ color: "var(--text-primary)" }}>{userData.days} consecutive days</strong>. I accept that missing a single task — for any reason — resets my progress to Day 0. No exceptions. No negotiation. This is my word.
                </p>
                <div style={{ borderBottom: "2px solid var(--border-bright)", paddingBottom: "8px", marginBottom: "8px", minHeight: "56px", display: "flex", alignItems: "flex-end" }}>
                    <AnimatePresence>
                        {signed
                            ? <motion.span key="sig" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ fontSize: "clamp(26px, 5vw, 38px)", fontStyle: "italic", color: "var(--text-primary)", fontFamily: "Georgia, 'Times New Roman', serif" }}>{userData.name}</motion.span>
                            : <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>Click below to sign</span>}
                    </AnimatePresence>
                </div>
                <p className="mono" style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em" }}>SIGNATURE · FOR YOUR PROMISE</p>
            </div>
            <AnimatePresence mode="wait">
                {!signed ? (
                    <motion.button key="sign" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={() => setSigned(true)} whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{ width: "100%", padding: "16px", background: "var(--bg-3)", border: "1px solid var(--border-bright)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", fontSize: "14px", fontFamily: "var(--font-body)", cursor: "pointer", marginBottom: "12px" }}>
                        Sign the contract
                    </motion.button>
                ) : (
                    <motion.button key="next" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        onClick={onNext} whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{ width: "100%", padding: "16px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
                        Create my account <ArrowRight size={15} />
                    </motion.button>
                )}
            </AnimatePresence>
            {signed && (
                <button onClick={() => setSigned(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", margin: "0 auto" }}>
                    <RotateCcw size={12} /> Clear signature
                </button>
            )}
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Create account (OAuth)
───────────────────────────────── */
function StepAccount({ userData }: { userData: UserData }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            // Persist onboarding data across OAuth redirect
            sessionStorage.setItem("75hard-onboarding", JSON.stringify({ name: userData.name, days: userData.days, tasks: userData.tasks }));

            const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url";
            if (!isConfigured) { setError("Supabase not configured — fill in .env.local first."); setLoading(false); return; }

            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { error: err } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/complete` },
            });
            if (err) { setError(err.message); setLoading(false); }
        } catch { setError("Something went wrong. Try again."); setLoading(false); }
    };

    return (
        <motion.div {...pv} transition={pt} style={{ textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--success-dim)", border: "1px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Check size={22} color="var(--success)" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "10px" }}>
                Signed & committed.
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "360px", margin: "0 auto 36px" }}>
                Create your account to lock in your {userData.days}-day challenge. Takes 5 seconds.
            </p>
            <motion.button onClick={handleGoogle} disabled={loading} whileHover={!loading ? { scale: 1.012 } : {}} whileTap={!loading ? { scale: 0.984 } : {}}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "15px", background: "var(--bg-2)", color: "var(--text-primary)", border: "1px solid var(--border-bright)", borderRadius: "8px", fontSize: "14px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, transition: "opacity 0.15s" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                </svg>
                {loading ? "Opening Google..." : "Continue with Google"}
            </motion.button>
            {error && <p style={{ fontSize: "12px", color: "var(--danger)", textAlign: "center", marginTop: "10px" }}>{error}</p>}
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "14px", lineHeight: 1.6 }}>
                No spam. No email newsletters. Just your challenge.
            </p>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Root
───────────────────────────────── */
export default function OnboardingClient() {
    const [stepIndex, setStepIndex] = useState(0);
    const [userData, setUserData] = useState<UserData>({ name: "", days: 75, tasks: DEFAULT_TASKS });
    const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1)), []);
    const step = STEP_ORDER[stepIndex];

    return (
        <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{ position: "fixed", top: "20px", left: "28px" }}>
                <a href="/" style={{ textDecoration: "none" }}>
                    <span className="mono" style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.16em", color: "var(--text-muted)" }}>75</span>
                </a>
            </div>
            <div style={{ width: "100%", maxWidth: "480px" }}>
                <AnimatePresence mode="wait">
                    {step === "name" && <StepName key="name" onNext={(name) => { setUserData((u) => ({ ...u, name })); next(); }} />}
                    {step === "science-1" && <StepScience key="s1" id="science-1" onNext={next} />}
                    {step === "duration" && <StepDuration key="dur" onNext={(days) => { setUserData((u) => ({ ...u, days })); next(); }} />}
                    {step === "science-2" && <StepScience key="s2" id="science-2" onNext={next} />}
                    {step === "goals" && <StepGoals key="goals" days={userData.days} onNext={(tasks) => { setUserData((u) => ({ ...u, tasks })); next(); }} />}
                    {step === "science-3" && <StepScience key="s3" id="science-3" onNext={next} />}
                    {step === "sign" && <StepSign key="sign" userData={userData} onNext={next} />}
                    {step === "account" && <StepAccount key="account" userData={userData} />}
                </AnimatePresence>
            </div>
        </div>
    );
}
