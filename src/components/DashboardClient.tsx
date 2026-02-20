"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import MidnightTimer from "@/components/MidnightTimer";
import ProgressGrid from "@/components/ProgressGrid";
import { getMotivation, getMilestoneLabel } from "@/lib/motivation";

interface Task { id: string; label: string; description: string; }

interface Props {
    currentDay: number;
    totalDays: number;
    startDate: string;
    tasks: Task[];
    completedToday: string[];
    userName: string;
    streakBroken: boolean;
    userId: string;
}

export default function DashboardClient({ currentDay, totalDays, startDate, tasks, completedToday, userName, streakBroken, userId }: Props) {
    const [checked, setChecked] = useState<string[]>(completedToday);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showBanner, setShowBanner] = useState(streakBroken);

    const today = new Date();
    const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const allDone = tasks.every((t) => checked.includes(t.id));
    const doneCount = checked.length;
    const motivation = getMotivation(currentDay);
    const milestoneLabel = getMilestoneLabel(currentDay, totalDays);

    // End date calculation
    const end = new Date(startDate);
    end.setDate(end.getDate() + totalDays - 1);
    const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const toggleTask = useCallback(async (taskId: string) => {
        if (loadingId) return;
        setLoadingId(taskId);
        const isAdding = !checked.includes(taskId);
        const optimistic = isAdding ? [...checked, taskId] : checked.filter((id) => id !== taskId);
        setChecked(optimistic);

        try {
            const res = await fetch("/api/complete-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId }),
            });
            const data = await res.json();
            if (data.completedTasks) setChecked(data.completedTasks);
        } catch {
            setChecked(checked); // revert
        } finally {
            setLoadingId(null);
        }
    }, [checked, loadingId]);

    const firstName = userName.split(" ")[0];

    return (
        <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Nav */}
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", zIndex: 10 }}>
                <span className="mono" style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.18em" }}>75</span>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <MidnightTimer />
                    <form action="/auth/signout" method="post">
                        <button type="submit" style={{ background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", padding: "5px 10px", cursor: "pointer" }}>
                            SIGN OUT
                        </button>
                    </form>
                </div>
            </nav>

            <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", padding: "36px 24px 80px", flex: 1 }}>

                {/* Reset banner */}
                <AnimatePresence>
                    {showBanner && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                            style={{ padding: "16px 18px", background: "var(--danger-dim)", border: "1px solid var(--danger)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ flex: 1 }}>
                                <div className="mono" style={{ fontSize: "11px", fontWeight: "700", color: "var(--danger)", letterSpacing: "0.12em", marginBottom: "4px" }}>YOU MISSED A DAY.</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Streak reset to zero. That&apos;s not a punishment — it&apos;s the rule. Start again. Today.</div>
                            </div>
                            <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}>
                                <X size={15} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Day counter header */}
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
                        <span className="mono" style={{ fontSize: "clamp(42px, 10vw, 68px)", fontWeight: "700", color: "var(--accent)", lineHeight: 1 }}>{currentDay}</span>
                        <span className="mono" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1 }}>/ {totalDays}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "2px" }}>{dateLabel}</div>
                            <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em" }}>{milestoneLabel.toUpperCase()} · ENDS {endLabel.toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {/* Motivational callout (only on key days) */}
                <AnimatePresence>
                    {motivation && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ padding: "16px 20px", background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: "8px", marginBottom: "28px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)", marginBottom: "4px" }}>{motivation.title}</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{motivation.body}</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress grid */}
                <div style={{ marginBottom: "36px" }}>
                    <ProgressGrid currentDay={currentDay} totalDays={totalDays} />
                </div>

                {/* Task checklist */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em" }}>DAILY TASKS</span>
                        <span className="mono" style={{ fontSize: "11px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>{doneCount}/{tasks.length}</span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: "2px", background: "var(--border)", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" }}>
                        <motion.div animate={{ width: `${(doneCount / tasks.length) * 100}%` }} transition={{ type: "spring", stiffness: 380, damping: 40 }}
                            style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "2px" }} />
                    </div>

                    {/* Rows */}
                    {tasks.map((task, i) => {
                        const done = checked.includes(task.id);
                        const isLoading = loadingId === task.id;
                        return (
                            <motion.button key={task.id} onClick={() => toggleTask(task.id)} disabled={isLoading}
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                whileTap={{ scale: 0.988 }}
                                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 0", width: "100%", borderTop: "1px solid var(--border)", borderBottom: i === tasks.length - 1 ? "1px solid var(--border)" : "none", borderLeft: "none", borderRight: "none", background: "none", cursor: isLoading ? "wait" : "pointer", textAlign: "left", fontFamily: "var(--font-body)", opacity: isLoading ? 0.7 : 1 }}>
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
                                    <div style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: done ? "line-through" : "none", transition: "color 0.2s" }}>{task.label}</div>
                                    <div style={{ fontSize: "12px", color: done ? "var(--text-muted)" : "var(--text-secondary)", marginTop: "2px" }}>{task.description}</div>
                                </div>
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: done ? "var(--success)" : "var(--border-bright)", transition: "background 0.2s" }} />
                            </motion.button>
                        );
                    })}

                    {/* All done */}
                    <AnimatePresence>
                        {allDone && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{ marginTop: "18px", padding: "14px 18px", background: "var(--success-dim)", border: "1px solid var(--success)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Check size={14} color="var(--success)" />
                                <span className="mono" style={{ fontSize: "11px", color: "var(--success)", letterSpacing: "0.12em" }}>ALL TASKS COMPLETE — DAY {currentDay} LOCKED IN</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {firstName ? `${firstName} · ` : ""}Day {currentDay} of {totalDays}
                </span>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>{today.toISOString().split("T")[0]}</span>
            </footer>
        </div>
    );
}
