"use client";

import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Check, X, AlertCircle, ChevronRight, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { TASKS } from "@/lib/tasks";
import LoginForm from "@/components/LoginForm";

/* ─────────────────────────────────
   Constants
───────────────────────────────── */
const LS_KEY = "75hard-demo-tasks";

const TESTIMONIALS = [
    { name: "Arjun S.", role: "Software engineer", avatar: "AS", text: "I've tried every habit tracker. This is the only one that actually scared me enough to stay consistent.", stars: 5 },
    { name: "Priya M.", role: "Fitness coach", avatar: "PM", text: "The midnight reset is brutal but that's exactly what I needed. Hit Day 34 today.", stars: 5 },
    { name: "Daniel K.", role: "Entrepreneur", avatar: "DK", text: "Simple, no fluff, no social garbage. Just you vs the clock. Love it.", stars: 5 },
    { name: "Sarah L.", role: "Marathon runner", avatar: "SL", text: "$7 was the easiest buy of my life. I've changed more in 30 days than in the last year.", stars: 5 },
    { name: "Ravi P.", role: "Student", avatar: "RP", text: "Reset at Day 12 — was devastated. Reset again at Day 8 — still came back. On Day 41 now.", stars: 5 },
    { name: "Emma T.", role: "Designer", avatar: "ET", text: "The design feels like premium hardware. Checking off tasks feels incredibly satisfying.", stars: 5 },
];

/* ─────────────────────────────────
   Helpers
───────────────────────────────── */
function Stars({ n }: { n: number }) {
    return (
        <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
            {Array.from({ length: n }).map((_, i) => (
                <Star key={i} size={12} color="var(--accent)" fill="var(--accent)" />
            ))}
        </div>
    );
}

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "none", border: "none", color: "var(--text-muted)",
                cursor: "pointer", fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif",
                padding: "6px 10px", borderRadius: "4px", transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
            {label}
        </button>
    );
}

/* ─────────────────────────────────
   Task Row — satisfying interaction
───────────────────────────────── */
function TaskRow({
    task,
    checked,
    onToggle,
    index,
}: {
    task: typeof TASKS[0];
    checked: boolean;
    onToggle: () => void;
    index: number;
}) {
    const checkboxControls = useAnimation();

    const handleClick = useCallback(async () => {
        // Punch animation on the checkbox
        await checkboxControls.start({ scale: 0.82, transition: { duration: 0.08 } });
        await checkboxControls.start({ scale: 1.14, transition: { duration: 0.1 } });
        await checkboxControls.start({ scale: 1, transition: { type: "spring", stiffness: 500, damping: 22 } });
        onToggle();
    }, [checkboxControls, onToggle]);

    return (
        <motion.div
            role="button"
            tabIndex={0}
            aria-pressed={checked}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
            whileHover={{ backgroundColor: checked ? "rgba(59,255,138,0.06)" : "rgba(255,255,255,0.03)" }}
            whileTap={{ scale: 0.992 }}
            onClick={handleClick}
            onKeyDown={(e) => e.key === "Enter" || e.key === " " ? handleClick() : null}
            style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "18px 20px", cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                background: checked ? "rgba(59,255,138,0.03)" : "transparent",
                transition: "background 0.2s ease",
                userSelect: "none",
            }}
        >
            {/* Checkbox */}
            <motion.div
                animate={checkboxControls}
                style={{
                    width: "26px", height: "26px", flexShrink: 0,
                    border: `2px solid ${checked ? "var(--success)" : "var(--border-bright)"}`,
                    borderRadius: "5px",
                    background: checked ? "var(--success)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.18s ease, border-color 0.18s ease",
                }}
            >
                <AnimatePresence>
                    {checked && (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 22 }}
                        >
                            <Check size={14} color="#000" strokeWidth={3.5} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Labels */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <motion.div
                    animate={{ color: checked ? "var(--text-muted)" : "var(--text-primary)" }}
                    style={{
                        fontSize: "13px", fontWeight: "600", letterSpacing: "0.07em",
                        textDecoration: checked ? "line-through" : "none",
                        textTransform: "uppercase",
                        transition: "text-decoration 0.2s, color 0.2s",
                    }}
                >
                    {task.label}
                </motion.div>
                <motion.div
                    animate={{ color: checked ? "var(--text-muted)" : "var(--text-secondary)" }}
                    style={{ fontSize: "12px", marginTop: "3px", transition: "color 0.2s" }}
                >
                    {task.description}
                </motion.div>
            </div>

            {/* Status dot */}
            <motion.div
                animate={{ backgroundColor: checked ? "var(--success)" : "var(--border-bright)" }}
                transition={{ duration: 0.2 }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 }}
            />
        </motion.div>
    );
}

/* ─────────────────────────────────
   Modals
───────────────────────────────── */
const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
};
const panelStyle: React.CSSProperties = {
    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
    borderRadius: "8px", padding: "32px", width: "100%", maxWidth: "440px",
    position: "relative",
};
const panelVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 14 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 32 } },
    exit: { opacity: 0, scale: 0.92, y: 14, transition: { duration: 0.15 } },
};

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={overlayStyle}>
            <motion.div variants={panelVariants} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()} style={panelStyle}>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute", top: "16px", right: "16px",
                        background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                    }}
                >
                    <X size={18} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

function SimpleForm({
    fields,
    onSubmit,
    submitLabel,
    successMsg,
    accentColor = "var(--text-primary)",
}: {
    fields: { key: string; placeholder: string; multiline?: boolean }[];
    onSubmit: () => void;
    submitLabel: string;
    successMsg: string;
    accentColor?: string;
}) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [sent, setSent] = useState(false);

    const inputBase: React.CSSProperties = {
        width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)",
        borderRadius: "4px", padding: "12px", color: "var(--text-primary)", fontSize: "13px",
        fontFamily: "'Space Grotesk', sans-serif", outline: "none", marginBottom: "10px",
    };

    if (sent) {
        return <p style={{ fontSize: "14px", color: "var(--success)", textAlign: "center", padding: "20px 0" }}>✓ {successMsg}</p>;
    }

    return (
        <>
            {fields.map((f) =>
                f.multiline ? (
                    <textarea
                        key={f.key}
                        placeholder={f.placeholder}
                        rows={4}
                        value={values[f.key] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        style={{ ...inputBase, resize: "none" }}
                    />
                ) : (
                    <input
                        key={f.key}
                        placeholder={f.placeholder}
                        value={values[f.key] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        style={inputBase}
                    />
                )
            )}
            <button
                onClick={() => { if (fields.every((f) => values[f.key]?.trim())) { setSent(true); onSubmit(); } }}
                style={{
                    width: "100%", padding: "13px", background: accentColor, color: "#000",
                    border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
                    fontFamily: "'Space Mono', monospace", letterSpacing: "0.12em", cursor: "pointer",
                }}
            >
                {submitLabel}
            </button>
        </>
    );
}

function BugModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalShell onClose={onClose}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <AlertCircle size={18} color="var(--accent)" />
                <span className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em" }}>REPORT A BUG</span>
            </div>
            <SimpleForm
                fields={[{ key: "msg", placeholder: "Describe the bug — what happened, what you expected...", multiline: true }]}
                onSubmit={() => { }}
                submitLabel="SEND REPORT →"
                successMsg="Got it. Thanks for making this better."
            />
        </ModalShell>
    );
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalShell onClose={onClose}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <Star size={18} color="var(--accent)" fill="var(--accent)" />
                <span className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em" }}>WRITE A TESTIMONIAL</span>
            </div>
            <SimpleForm
                fields={[
                    { key: "name", placeholder: "Your name" },
                    { key: "text", placeholder: "How has 75 Hard changed you?", multiline: true },
                ]}
                onSubmit={() => { }}
                submitLabel="SUBMIT →"
                successMsg="Thank you. Your story matters."
                accentColor="var(--accent)"
            />
        </ModalShell>
    );
}

function LoginModal({ onClose }: { onClose: () => void }) {
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";
    return (
        <ModalShell onClose={onClose}>
            <div className="mono" style={{ fontSize: "10px", letterSpacing: "0.2em", color: "var(--accent)", marginBottom: "8px" }}>
                UNLOCK FULL TRACKING
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "6px", lineHeight: 1.15 }}>
                Save your streak.<br />Own your 75 days.
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.65 }}>
                Daily progress tracked. Miss a task before midnight — reset to Day 0. No mercy. That&apos;s the deal.
            </p>

            {/* Price badge */}
            <div style={{
                background: "var(--accent-dim)", border: "1px solid var(--accent)",
                borderRadius: "6px", padding: "14px 18px", marginBottom: "20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "2px" }}>ONE-TIME. FOREVER.</div>
                    <div className="mono" style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent)" }}>$7</div>
                </div>
                <div style={{ textAlign: "right", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    No subscription<br />No refunds.<br />Commitment only.
                </div>
            </div>

            <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "block", width: "100%", padding: "15px", background: "var(--accent)",
                    color: "#000", textDecoration: "none", textAlign: "center",
                    fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: "700",
                    letterSpacing: "0.12em", borderRadius: "4px", marginBottom: "20px",
                    boxSizing: "border-box",
                }}
            >
                PAY $7 AND START →
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>ALREADY PAID? LOG IN</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            <LoginForm />
        </ModalShell>
    );
}

/* ─────────────────────────────────
   Demo Checklist (hero)
───────────────────────────────── */
function DemoChecklist({
    checkedTasks,
    onToggle,
}: {
    checkedTasks: Set<string>;
    onToggle: (id: string) => void;
}) {
    const doneCount = checkedTasks.size;
    const allDone = doneCount === TASKS.length;

    return (
        <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)",
            }}>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em" }}>THE 6 DAILY TASKS</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="mono" style={{ fontSize: "11px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>
                        {doneCount}/{TASKS.length}
                    </span>
                    <div style={{ width: "64px", height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                        <motion.div
                            animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                            transition={{ type: "spring", stiffness: 380, damping: 38 }}
                            style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "2px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Rows */}
            {TASKS.map((task, i) => (
                <TaskRow
                    key={task.id}
                    task={task}
                    checked={checkedTasks.has(task.id)}
                    onToggle={() => onToggle(task.id)}
                    index={i}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────
   Main Landing Page
───────────────────────────────── */
type ModalType = "login" | "bug" | "testimonial" | null;

export default function LandingClient() {
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<ModalType>(null);
    const [hydrated, setHydrated] = useState(false);
    const confettiFired = useRef(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) setCheckedTasks(new Set(JSON.parse(saved)));
        } catch { /* ignored */ }
        setHydrated(true);
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        if (!hydrated) return;
        localStorage.setItem(LS_KEY, JSON.stringify([...checkedTasks]));
    }, [checkedTasks, hydrated]);

    const allDone = TASKS.every((t) => checkedTasks.has(t.id));
    const doneCount = checkedTasks.size;

    // Confetti on completion
    const fireConfetti = useCallback(() => {
        if (confettiFired.current) return;
        confettiFired.current = true;
        const colors = ["#e8ff47", "#ffffff", "#3bff8a", "#ff3b3b"];
        const base = { spread: 75, colors };
        confetti({ ...base, particleCount: 90, origin: { y: 0.5 } });
        setTimeout(() => confetti({ ...base, particleCount: 65, spread: 110, origin: { y: 0.55, x: 0.2 } }), 220);
        setTimeout(() => confetti({ ...base, particleCount: 65, spread: 110, origin: { y: 0.55, x: 0.8 } }), 400);
        setTimeout(() => { confettiFired.current = false; }, 5000);
    }, []);

    useEffect(() => {
        if (allDone && hydrated) fireConfetti();
    }, [allDone, hydrated, fireConfetti]);

    const toggleTask = useCallback((id: string) => {
        setCheckedTasks((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const openLogin = useCallback(() => setModal("login"), []);
    const closeModal = useCallback(() => setModal(null), []);

    return (
        <>
            {/* ── MODALS ── */}
            <AnimatePresence>
                {modal === "bug" && <BugModal key="bug" onClose={closeModal} />}
                {modal === "testimonial" && <TestimonialModal key="testimonial" onClose={closeModal} />}
                {modal === "login" && <LoginModal key="login" onClose={closeModal} />}
            </AnimatePresence>

            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

                {/* ── NAV ── */}
                <nav style={{
                    position: "sticky", top: 0, zIndex: 50,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 28px",
                    background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)",
                    borderBottom: "1px solid var(--border)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="mono" style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "0.15em" }}>75</span>
                        <span style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.15em", color: "#000", background: "var(--accent)", padding: "2px 7px", borderRadius: "2px" }}>BETA</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <NavBtn label="Report bug" onClick={() => setModal("bug")} />
                        <NavBtn label="Write testimonial" onClick={() => setModal("testimonial")} />
                        <button
                            onClick={openLogin}
                            style={{
                                border: "1px solid var(--border-bright)", borderRadius: "4px",
                                background: "none", color: "var(--text-primary)", cursor: "pointer",
                                fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600",
                                padding: "7px 18px", marginLeft: "6px", transition: "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--text-primary)"; e.currentTarget.style.color = "#000"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                            Login
                        </button>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "56px 24px 48px", maxWidth: "640px", margin: "0 auto", width: "100%",
                }}>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "5px 14px", background: "var(--accent-dim)",
                            border: "1px solid var(--accent)", borderRadius: "2px", marginBottom: "28px",
                        }}
                    >
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                            style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)" }} />
                        <span className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.2em" }}>75 DAYS. NO EXCUSES.</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                        style={{
                            fontSize: "clamp(16px, 4vw, 20px)", fontWeight: "400",
                            color: "var(--text-secondary)", textAlign: "center",
                            letterSpacing: "0.01em", marginBottom: "8px",
                        }}
                    >
                        What are your tasks for today?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
                        style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginBottom: "32px" }}
                    >
                        Check them all off before midnight — or start over from Day 0.
                    </motion.p>

                    {/* Interactive checklist */}
                    <DemoChecklist checkedTasks={checkedTasks} onToggle={toggleTask} />

                    {/* All-done celebration */}
                    <AnimatePresence>
                        {allDone && (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.94 }}
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                style={{
                                    width: "100%", padding: "20px 24px", marginBottom: "18px",
                                    background: "var(--success-dim)", border: "1px solid var(--success)",
                                    borderRadius: "8px", textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: "24px", marginBottom: "6px" }}>🏆</div>
                                <div className="mono" style={{ fontSize: "12px", color: "var(--success)", letterSpacing: "0.12em", marginBottom: "4px" }}>
                                    YOU DID IT — ALL 6 TASKS COMPLETE
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    Now imagine doing this every single day for 75 days.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                        style={{ width: "100%" }}
                    >
                        <motion.button
                            onClick={openLogin}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.982 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            style={{
                                width: "100%", padding: "17px",
                                background: allDone ? "var(--success)" : "var(--accent)",
                                color: "#000", border: "none", borderRadius: "6px",
                                fontSize: "13px", fontWeight: "700", fontFamily: "'Space Mono', monospace",
                                letterSpacing: "0.12em", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                transition: "background 0.35s ease",
                            }}
                        >
                            {allDone ? "START TRACKING MY REAL STREAK" : "TRACK YOUR 75-DAY STREAK"}
                            <ChevronRight size={15} />
                        </motion.button>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
                            One-time unlock · $7 · No subscription ever
                        </p>
                    </motion.div>

                    {/* Local persistence hint */}
                    {doneCount > 0 && !allDone && hydrated && (
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "12px" }}
                        >
                            ✓ Progress saved locally — your ticks will still be here after refresh.
                        </motion.p>
                    )}
                </section>

                {/* ── WHY 75 HARD ── */}
                <section style={{ borderTop: "1px solid var(--border)", padding: "80px 24px" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                        <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: "14px" }}>THE PHILOSOPHY</div>
                        <h2 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "22px" }}>
                            Why 75 days<br />of hard?
                        </h2>
                        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "40px" }}>
                            Most people start a habit and quit when it gets inconvenient. The 75 Hard protocol removes that option. Miss a single task — even one glass of water — and you reset to Day 0. No exceptions. No rest days. No half-measures.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                            {[
                                { icon: "⚡", title: "Mental toughness", desc: "75 consecutive days builds a different kind of discipline." },
                                { icon: "🔄", title: "Zero tolerance", desc: "One miss resets everything. It's the rule that makes it real." },
                                { icon: "📸", title: "Visual proof", desc: "Daily progress photos show you the person you're becoming." },
                                { icon: "📖", title: "Feed your mind", desc: "10 pages daily. How much non-fiction have you read this year?" },
                            ].map((card) => (
                                <motion.div
                                    key={card.title}
                                    whileHover={{ y: -3, borderColor: "var(--border-bright)" }}
                                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                                    style={{
                                        padding: "20px", background: "var(--bg-2)",
                                        border: "1px solid var(--border)", borderRadius: "6px",
                                    }}
                                >
                                    <div style={{ fontSize: "22px", marginBottom: "10px" }}>{card.icon}</div>
                                    <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>{card.title}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55 }}>{card.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section style={{ borderTop: "1px solid var(--border)", padding: "80px 0", overflow: "hidden" }}>
                    <div style={{ maxWidth: "640px", margin: "0 auto 32px", padding: "0 24px" }}>
                        <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.2em", marginBottom: "12px" }}>FROM THE COMMUNITY</div>
                        <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                            Real people.<br />Real streaks.
                        </h2>
                    </div>
                    <motion.div
                        animate={{ x: [0, -1260] }}
                        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                        style={{ display: "flex", gap: "16px", width: "max-content", paddingLeft: "24px" }}
                    >
                        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <div key={i} style={{
                                width: "274px", flexShrink: 0, padding: "20px",
                                background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px",
                            }}>
                                <Stars n={t.stars} />
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "32px", height: "32px", borderRadius: "50%", background: "var(--border-bright)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "10px", fontWeight: "700", fontFamily: "'Space Mono', monospace",
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{t.name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </section>

                {/* ── FINAL CTA ── */}
                <section style={{
                    borderTop: "1px solid var(--border)", padding: "80px 24px",
                    maxWidth: "640px", margin: "0 auto", width: "100%", textAlign: "center",
                }}>
                    <h2 style={{ fontSize: "clamp(36px, 8vw, 68px)", fontWeight: "700", lineHeight: 0.95, letterSpacing: "-0.03em", marginBottom: "24px" }}>
                        75 DAYS.<br />
                        <span style={{ color: "var(--text-muted)" }}>ARE YOU</span><br />
                        READY?
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.7 }}>
                        Stop planning to start. The only way to know if you can do it is to begin today — right now.
                    </p>
                    <motion.button
                        onClick={openLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        style={{
                            padding: "17px 44px", background: "var(--accent)", color: "#000",
                            border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "700",
                            fontFamily: "'Space Mono', monospace", letterSpacing: "0.12em", cursor: "pointer",
                        }}
                    >
                        START THE CHALLENGE →
                    </motion.button>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
                        One-time payment · $7 · No subscription · No refunds
                    </p>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{
                    borderTop: "1px solid var(--border)", padding: "20px 28px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px",
                }}>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>75 HARD TRACKER © 2025</span>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <NavBtn label="Benefits" onClick={() => { }} />
                        <NavBtn label="Testimonials" onClick={() => setModal("testimonial")} />
                        <NavBtn label="Changelog" onClick={() => { }} />
                    </div>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>NO EXCUSES.</span>
                </footer>
            </div>
        </>
    );
}
