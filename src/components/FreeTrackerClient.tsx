"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import MidnightTimer from "@/components/MidnightTimer";
import { TASKS } from "@/lib/tasks";

/* ─────────────────────────────────
   Types
───────────────────────────────── */
interface Task { id: string; label: string; description: string; }

const LS_KEY_TASKS = "75hard-custom-tasks";
const LS_KEY_CHECKED = "75hard-free-checked";
const LS_KEY_DATE = "75hard-free-date";

function getTodayStr() {
    return new Date().toISOString().split("T")[0];
}

/* ─────────────────────────────────
   Component
───────────────────────────────── */
export default function FreeTrackerClient() {
    const [tasks, setTasks] = useState<Task[]>(TASKS);
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [hydrated, setHydrated] = useState(false);
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";

    // Hydrate from localStorage, reset if it's a new day
    useEffect(() => {
        const savedDate = localStorage.getItem(LS_KEY_DATE);
        const today = getTodayStr();

        // Load custom tasks from onboarding if available
        const rawTasks = sessionStorage.getItem("75hard-onboarding");
        if (rawTasks) {
            try { const parsed = JSON.parse(rawTasks); if (parsed.tasks?.length) setTasks(parsed.tasks); } catch { /* ignore */ }
        } else {
            const savedTasks = localStorage.getItem(LS_KEY_TASKS);
            if (savedTasks) { try { setTasks(JSON.parse(savedTasks)); } catch { /* ignore */ } }
        }

        if (savedDate === today) {
            const raw = localStorage.getItem(LS_KEY_CHECKED);
            if (raw) { try { setChecked(new Set(JSON.parse(raw))); } catch { /* ignore */ } }
        } else {
            // New day — clear progress
            localStorage.setItem(LS_KEY_DATE, today);
            localStorage.removeItem(LS_KEY_CHECKED);
        }
        setHydrated(true);
    }, []);

    // Persist checked state
    useEffect(() => {
        if (hydrated) localStorage.setItem(LS_KEY_CHECKED, JSON.stringify([...checked]));
    }, [checked, hydrated]);

    const toggle = useCallback((id: string) => {
        setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }, []);

    const today = new Date();
    const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const allDone = tasks.every((t) => checked.has(t.id));
    const doneCount = checked.size;

    return (
        <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Nav */}
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", zIndex: 10 }}>
                <div>
                    <span className="mono" style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.18em", color: "var(--text-primary)" }}>75</span>
                    <span className="mono" style={{ marginLeft: "10px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em" }}>FREE</span>
                </div>
                <MidnightTimer />
            </nav>

            {/* Content */}
            <div style={{ maxWidth: "640px", width: "100%", margin: "0 auto", padding: "36px 24px 120px", flex: 1 }}>

                {/* Date header */}
                <div style={{ marginBottom: "32px" }}>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.16em", marginBottom: "4px" }}>TODAY</div>
                    <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>{dateLabel}</h1>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Progress resets at midnight. Nothing is saved.</p>
                </div>

                {/* Task card */}
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
                    {/* Progress header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.16em" }}>DAILY TASKS</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="mono" style={{ fontSize: "11px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>{doneCount}/{tasks.length}</span>
                            <div style={{ width: "56px", height: "2px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                                <motion.div animate={{ width: `${(doneCount / tasks.length) * 100}%` }} transition={{ type: "spring", stiffness: 380, damping: 40 }}
                                    style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "2px" }} />
                            </div>
                        </div>
                    </div>

                    {/* Task rows */}
                    {tasks.map((task) => {
                        const done = checked.has(task.id);
                        return (
                            <motion.button key={task.id} onClick={() => toggle(task.id)} whileTap={{ scale: 0.988 }}
                                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", width: "100%", borderBottom: "1px solid var(--border)", borderLeft: "none", borderRight: "none", borderTop: "none", background: done ? "rgba(45,204,112,0.025)" : "transparent", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                                <div style={{ width: "22px", height: "22px", flexShrink: 0, borderRadius: "4px", border: `2px solid ${done ? "var(--success)" : "var(--border-bright)"}`, background: done ? "var(--success)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                                    <AnimatePresence>
                                        {done && (
                                            <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 28 }}>
                                                <Check size={13} color="#000" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.07em", textTransform: "uppercase", color: done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none", transition: "color 0.2s" }}>{task.label}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{task.description}</div>
                                </div>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: done ? "var(--success)" : "var(--border-bright)", transition: "background 0.2s" }} />
                            </motion.button>
                        );
                    })}

                    {/* All done banner */}
                    {allDone && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}>
                            <div style={{ padding: "14px 20px", background: "var(--success-dim)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Check size={14} color="var(--success)" />
                                <span className="mono" style={{ fontSize: "11px", color: "var(--success)", letterSpacing: "0.12em" }}>ALL TASKS DONE — MIDNIGHT WILL RESET.</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Upgrade prompt — sticky feel at bottom of content */}
                <div style={{ padding: "20px", background: "var(--bg-2)", border: "1px solid var(--border-bright)", borderRadius: "10px", position: "relative", overflow: "hidden" }}>
                    {/* Accent top bar */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--accent)" }} />
                    <div style={{ marginBottom: "12px" }}>
                        <div className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.14em", marginBottom: "6px" }}>DON&apos;T LOSE YOUR PROGRESS</div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                            Every task you complete disappears at midnight. For <strong style={{ color: "var(--text-primary)" }}>$4 (one-time)</strong> your streak, history, and day counter are saved forever.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <a href={paymentLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 22px", background: "var(--accent)", color: "#000", textDecoration: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-body)" }}>
                            Commit for $4 <ArrowUpRight size={13} />
                        </a>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>No subscription · Beta price</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
