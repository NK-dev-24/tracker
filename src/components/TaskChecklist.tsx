"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { TASKS, type Task } from "@/lib/tasks";

interface TaskChecklistProps {
    initialCompleted: string[];
    onTaskToggle?: (taskId: string, completed: string[]) => void;
}

export default function TaskChecklist({ initialCompleted, onTaskToggle }: TaskChecklistProps) {
    const [completedTasks, setCompletedTasks] = useState<string[]>(initialCompleted);
    const [loadingTask, setLoadingTask] = useState<string | null>(null);

    const toggleTask = async (task: Task) => {
        if (loadingTask) return;
        setLoadingTask(task.id);

        const isCompleting = !completedTasks.includes(task.id);
        const optimistic = isCompleting
            ? [...completedTasks, task.id]
            : completedTasks.filter((t) => t !== task.id);
        setCompletedTasks(optimistic);

        try {
            const res = await fetch("/api/complete-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: task.id }),
            });
            const data = await res.json();
            if (data.completedTasks) {
                setCompletedTasks(data.completedTasks);
                onTaskToggle?.(task.id, data.completedTasks);
            }
        } catch {
            setCompletedTasks(completedTasks); // revert on error
        } finally {
            setLoadingTask(null);
        }
    };

    const allDone = TASKS.every((t) => completedTasks.includes(t.id));
    const doneCount = completedTasks.length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "18px" }}>
                <span className="mono" style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--text-muted)" }}>
                    DAILY TASKS
                </span>
                <span className="mono" style={{ fontSize: "12px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>
                    {doneCount}/{TASKS.length}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: "2px", background: "var(--border)", marginBottom: "24px", borderRadius: "1px", overflow: "hidden" }}>
                <motion.div
                    animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                    style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "1px" }}
                />
            </div>

            {/* Tasks */}
            {TASKS.map((task, i) => {
                const done = completedTasks.includes(task.id);
                const isLoading = loadingTask === task.id;
                return (
                    <motion.button
                        key={task.id}
                        onClick={() => toggleTask(task)}
                        disabled={isLoading}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.987 }}
                        style={{
                            display: "flex", alignItems: "center", gap: "16px",
                            padding: "16px 0",
                            borderTop: "1px solid var(--border)",
                            borderBottom: i === TASKS.length - 1 ? "1px solid var(--border)" : "none",
                            borderLeft: "none", borderRight: "none",
                            background: "none", cursor: isLoading ? "wait" : "pointer",
                            textAlign: "left", width: "100%",
                        }}
                    >
                        {/* Checkbox */}
                        <div style={{
                            width: "24px", height: "24px", flexShrink: 0,
                            border: `2px solid ${done ? "var(--success)" : "var(--border-bright)"}`,
                            background: done ? "var(--success)" : "transparent",
                            borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s ease",
                        }}>
                            <AnimatePresence>
                                {done && (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                    >
                                        <Check size={14} color="#000" strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Labels */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "13px", fontWeight: "600", letterSpacing: "0.07em",
                                color: done ? "var(--text-muted)" : "var(--text-primary)",
                                textDecoration: done ? "line-through" : "none",
                                textTransform: "uppercase", transition: "color 0.2s",
                            }}>
                                {task.label}
                            </div>
                            <div style={{ fontSize: "12px", color: done ? "var(--text-muted)" : "var(--text-secondary)", marginTop: "2px", transition: "color 0.2s" }}>
                                {task.description}
                            </div>
                        </div>

                        {/* Status dot */}
                        <div style={{
                            width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                            background: done ? "var(--success)" : "var(--border-bright)",
                            transition: "background 0.2s",
                        }} />
                    </motion.button>
                );
            })}

            {/* All done */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            marginTop: "20px", padding: "14px 18px",
                            background: "var(--success-dim)", border: "1px solid var(--success)",
                            borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px",
                        }}
                    >
                        <Check size={15} color="var(--success)" />
                        <span className="mono" style={{ fontSize: "11px", color: "var(--success)", letterSpacing: "0.14em" }}>
                            ALL TASKS COMPLETE — DAY LOCKED IN
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
