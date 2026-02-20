"use client";

import { useEffect, useState } from "react";
import { getMidnightCountdown } from "@/lib/streak";
import { motion, AnimatePresence } from "framer-motion";

export default function MidnightTimer() {
    const [time, setTime] = useState(getMidnightCountdown());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getMidnightCountdown());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const isUrgent = time.totalSeconds < 3600; // less than 1 hour

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                background: isUrgent ? "var(--danger-dim)" : "var(--bg-3)",
                border: `1px solid ${isUrgent ? "var(--danger)" : "var(--border)"}`,
                borderRadius: "4px",
                transition: "all 0.3s ease",
            }}
        >
            <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: isUrgent ? "var(--danger)" : "var(--text-muted)",
                    flexShrink: 0,
                }}
            />
            <span
                className="mono"
                style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    color: isUrgent ? "var(--danger)" : "var(--text-muted)",
                }}
            >
                {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
            <span
                className="mono"
                style={{
                    fontSize: "9px",
                    color: "var(--text-muted)",
                    letterSpacing: "0.15em",
                }}
            >
                UNTIL MIDNIGHT
            </span>
        </div>
    );
}
