"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { TASKS, type Task } from "@/lib/tasks";
import clsx from "clsx";

interface TaskChecklistProps {
    initialCompleted: string[];
    onTaskToggle?: (taskId: string, completed: string[]) => void;
}

export default function TaskChecklist({
    initialCompleted,
    onTaskToggle,
}: TaskChecklistProps) {
    const [completedTasks, setCompletedTasks] =
        useState<string[]>(initialCompleted);
    const [loadingTask, setLoadingTask] = useState<string | null>(null);

    const toggleTask = async (task: Task) => {
        if (loadingTask) return;
        setLoadingTask(task.id);

        const isNowCompleting = !completedTasks.includes(task.id);
        const optimistic = isNowCompleting
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
            // Revert on error
            setCompletedTasks(completedTasks);
        } finally {
            setLoadingTask(null);
        }
    };

    const allDone = TASKS.every((t) => completedTasks.includes(t.id));
    const doneCount = TASKS.filter((t) => completedTasks.includes(t.id)).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "20px",
                }}
            >
                <span
                    className="mono"
                    style={{
                        fontSize: "10px",
                        letterSpacing: "0.2em",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                    }}
                >
                    DAILY TASKS
                </span>
                <span
                    className="mono"
                    style={{
                        fontSize: "12px",
                        color: allDone ? "var(--success)" : "var(--text-secondary)",
                    }}
                >
                    {doneCount}/{TASKS.length}
                </span>
            </div>

            {/* Progress bar */}
            <div
                style={{
                    height: "2px",
                    background: "var(--border)",
                    marginBottom: "28px",
                    borderRadius: "1px",
                    overflow: "hidden",
                }}
            >
                <motion.div
                    style={{
                        height: "100%",
                        background: allDone ? "var(--success)" : "var(--accent)",
                        borderRadius: "1px",
                    }}
                    animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
            </div>

            {/* Task rows */}
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
                        whileTap={{ scale: 0.985 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "18px 0",
                            borderTop: `1px solid var(--border)`,
                            borderBottom: i === TASKS.length - 1 ? `1px solid var(--border)` : "none",
                            borderLeft: "none",
                            borderRight: "none",
                            background: "none",
                            cursor: isLoading ? "wait" : "pointer",
                            textAlign: "left",
                            width: "100%",
                        }}
                    >
                        {/* Checkbox */}
                        <div
                            style={{
                                width: "24px",
                                height: "24px",
                                flexShrink: 0,
                                border: done
                                    ? "2px solid var(--success)"
                                    : "2px solid var(--border-bright)",
                                background: done ? "var(--success)" : "transparent",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s ease",
                            }}
                        >
                            <AnimatePresence>
                                {done && (
                                    <motion.div
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
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    letterSpacing: "0.08em",
                                    color: done ? "var(--text-muted)" : "var(--text-primary)",
                                    textDecoration: done ? "line-through" : "none",
                                    transition: "all 0.2s ease",
                                    textTransform: "uppercase",
                                }}
                            >
                                {task.label}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: done ? "var(--text-muted)" : "var(--text-secondary)",
                                    marginTop: "2px",
                                    transition: "color 0.2s ease",
                                }}
                            >
                                {task.description}
                            </div>
                        </div>

                        {/* Status dot */}
                        <motion.div
                            animate={{
                                backgroundColor: done ? "var(--success)" : "var(--border-bright)",
                                scale: done ? 1.2 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                flexShrink: 0,
                            }}
                        />
                    </motion.button>
                );
            })}

            {/* All done state */}
            <AnimatePresence>
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            marginTop: "24px",
                            padding: "16px 20px",
                            background: "var(--success-dim)",
                            border: "1px solid var(--success)",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <Check size={16} color="var(--success)" />
                        <span
                            className="mono"
                            style={{
                                fontSize: "12px",
                                color: "var(--success)",
                                letterSpacing: "0.15em",
                            }}
                        >
                            ALL TASKS COMPLETE — DAY LOCKED IN
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
