"use client";

import { motion } from "framer-motion";
import { TOTAL_DAYS } from "@/lib/tasks";

interface ProgressGridProps {
    currentDay: number;
    totalDays?: number;
    failedDays?: number[];
}

export default function ProgressGrid({
    currentDay,
    totalDays = TOTAL_DAYS,
    failedDays = [],
}: ProgressGridProps) {
    const cells = Array.from({ length: totalDays }, (_, i) => i + 1);
    // Adaptive columns: ~15 columns looks good for 75 days, scale proportionally
    const cols = totalDays <= 31 ? 10 : totalDays <= 75 ? 15 : 18;

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "16px",
                }}
            >
                <span className="mono" style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {totalDays}-DAY GRID
                </span>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {Math.max(0, currentDay)} / {totalDays}
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "4px" }}>
                {cells.map((day) => {
                    const isDone = day < currentDay;
                    const isToday = day === currentDay;
                    const isFailed = failedDays.includes(day);
                    const isFuture = day > currentDay;

                    return (
                        <motion.div
                            key={day}
                            title={`Day ${day}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: day * 0.008,
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                            }}
                            style={{
                                aspectRatio: "1",
                                borderRadius: "2px",
                                background: isFailed
                                    ? "var(--danger)"
                                    : isDone
                                        ? "var(--text-primary)"
                                        : isToday
                                            ? "var(--accent)"
                                            : "transparent",
                                border: isFuture
                                    ? "1px solid var(--border)"
                                    : isToday
                                        ? "1px solid var(--accent)"
                                        : "1px solid transparent",
                                position: "relative",
                                cursor: "default",
                            }}
                        >
                            {isToday && (
                                <motion.div
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "2px",
                                        background: "var(--accent)",
                                        opacity: 0.4,
                                    }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "12px",
                    flexWrap: "wrap",
                }}
            >
                {[
                    { color: "var(--text-primary)", label: "DONE" },
                    { color: "var(--accent)", label: "TODAY" },
                    { color: "var(--border)", label: "AHEAD", border: "1px solid var(--border)" },
                    { color: "var(--danger)", label: "FAILED" },
                ].map((item) => (
                    <div
                        key={item.label}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        <div
                            style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "2px",
                                background: item.color,
                                border: item.border,
                                flexShrink: 0,
                            }}
                        />
                        <span
                            className="mono"
                            style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em" }}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
