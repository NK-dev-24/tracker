"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ResetBannerProps {
    onDismiss?: () => void;
}

export default function ResetBanner({ onDismiss }: ResetBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
                padding: "20px 24px",
                background: "var(--danger-dim)",
                border: "1px solid var(--danger)",
                borderRadius: "4px",
                marginBottom: "32px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
            }}
        >
            <AlertTriangle
                size={20}
                color="var(--danger)"
                style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <div style={{ flex: 1 }}>
                <div
                    className="mono"
                    style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--danger)",
                        letterSpacing: "0.1em",
                        marginBottom: "6px",
                    }}
                >
                    YOU MISSED A DAY.
                </div>
                <div
                    style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                    }}
                >
                    Your streak has been reset to zero. That&apos;s not a punishment —
                    it&apos;s the rule. The challenge only works if every day counts.
                    Start again. Today.
                </div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "0",
                        lineHeight: 1,
                        flexShrink: 0,
                    }}
                >
                    ×
                </button>
            )}
        </motion.div>
    );
}
