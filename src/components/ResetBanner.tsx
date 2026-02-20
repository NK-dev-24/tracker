"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ResetBannerProps {
    onDismiss?: () => void;
}

export default function ResetBanner({ onDismiss }: ResetBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
                padding: "18px 20px",
                background: "var(--danger-dim)",
                border: "1px solid var(--danger)",
                borderRadius: "8px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
            }}
        >
            <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
                <div
                    className="mono"
                    style={{ fontSize: "11px", fontWeight: "700", color: "var(--danger)", letterSpacing: "0.12em", marginBottom: "5px" }}
                >
                    YOU MISSED A DAY.
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Streak reset to zero. That&apos;s not a punishment — it&apos;s the rule. The challenge only works if every day counts. Start again. Today.
                </div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px", flexShrink: 0 }}
                >
                    <X size={16} />
                </button>
            )}
        </motion.div>
    );
}
