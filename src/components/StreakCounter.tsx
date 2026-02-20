"use client";

import { motion } from "framer-motion";
import { TOTAL_DAYS } from "@/lib/tasks";

interface StreakCounterProps {
    currentDay: number;
    startDate: string | null;
    streakActive: boolean;
}

export default function StreakCounter({
    currentDay,
    startDate,
    streakActive,
}: StreakCounterProps) {
    const progress = Math.min(currentDay / TOTAL_DAYS, 1);
    const circumference = 2 * Math.PI * 54;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                padding: "32px 0",
                borderBottom: "1px solid var(--border)",
                marginBottom: "40px",
            }}
        >
            {/* Ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="3"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="54"
                        fill="none"
                        stroke={currentDay >= TOTAL_DAYS ? "var(--success)" : "var(--accent)"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference * (1 - progress) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                </svg>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <motion.span
                        className="mono"
                        key={currentDay}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color: currentDay >= TOTAL_DAYS ? "var(--success)" : "var(--text-primary)",
                            lineHeight: 1,
                        }}
                    >
                        {currentDay}
                    </motion.span>
                    <span
                        className="mono"
                        style={{
                            fontSize: "9px",
                            color: "var(--text-muted)",
                            letterSpacing: "0.2em",
                            marginTop: "2px",
                        }}
                    >
                        / 75
                    </span>
                </div>
            </div>

            {/* Labels */}
            <div>
                <motion.div
                    key={currentDay}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                        color: "var(--text-primary)",
                    }}
                >
                    {currentDay === 0 ? "DAY" : `DAY ${currentDay}`}
                </motion.div>
                <div
                    style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        marginTop: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: streakActive
                                ? "var(--success)"
                                : currentDay === 0
                                    ? "var(--text-muted)"
                                    : "var(--danger)",
                            flexShrink: 0,
                        }}
                    />
                    {currentDay === 0
                        ? "Not started — complete today's tasks"
                        : currentDay >= TOTAL_DAYS
                            ? "CHALLENGE COMPLETE 🏆"
                            : `${TOTAL_DAYS - currentDay} days remaining`}
                </div>
                {startDate && (
                    <div
                        className="mono"
                        style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            marginTop: "8px",
                            letterSpacing: "0.1em",
                        }}
                    >
                        STARTED {new Date(startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }).toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
}
