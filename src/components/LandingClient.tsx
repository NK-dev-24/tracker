"use client";

import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
    Check,
    X,
    ChevronRight,
    Star,
    AlertCircle,
    Trophy,
    Zap,
    RotateCcw,
    Camera,
    BookOpen,
    Menu,
    ArrowUpRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TASKS } from "@/lib/tasks";
import LoginForm from "@/components/LoginForm";

/* ─────────────────────────────────
   Data
───────────────────────────────── */
const LS_KEY = "75hard-demo-tasks";

const TESTIMONIALS = [
    { name: "Arjun S.", role: "Software engineer", avatar: "AS", text: "I've tried every habit tracker. This is the only one that actually scared me enough to stay consistent.", stars: 5 },
    { name: "Priya M.", role: "Fitness coach", avatar: "PM", text: "The midnight reset is brutal but that's exactly what I needed. Hit Day 34 today.", stars: 5 },
    { name: "Daniel K.", role: "Entrepreneur", avatar: "DK", text: "Simple, no fluff, no social garbage. Just you vs the clock. Love it.", stars: 5 },
    { name: "Sarah L.", role: "Marathon runner", avatar: "SL", text: "$4 was the easiest decision I've made. Changed more in 30 days than in the last year.", stars: 5 },
    { name: "Ravi P.", role: "Student", avatar: "RP", text: "Reset at Day 12, was devastated. Reset at Day 8, still came back. On Day 41 now.", stars: 5 },
    { name: "Emma T.", role: "Designer", avatar: "ET", text: "Checking off tasks at 11pm when everything hurts — that's when it matters most.", stars: 5 },
];

const CHANGELOG = [
    { date: "Feb 2025", version: "0.3", note: "Interactive demo checklist on landing. Confetti on completion." },
    { date: "Feb 2025", version: "0.2", note: "Google OAuth login. Removed email-based magic links." },
    { date: "Feb 2025", version: "0.1", note: "Initial build. Streak tracker, task checklist, midnight reset cron." },
];

const WHY_CARDS = [
    { icon: Zap, title: "Mental toughness", desc: "75 consecutive days builds a different kind of discipline." },
    { icon: RotateCcw, title: "Zero tolerance", desc: "One miss resets everything. That's the rule that makes it real." },
    { icon: Camera, title: "Visual proof", desc: "Daily progress photos show you the person you're becoming." },
    { icon: BookOpen, title: "Feed your mind", desc: "10 pages daily. How much have you actually read this year?" },
];

/* ─────────────────────────────────
   Scroll utility
───────────────────────────────── */
function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────
   Shared primitives
───────────────────────────────── */

function NavBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", fontFamily: "var(--font-body)",
                color: "var(--text-secondary)", padding: "6px 10px",
                borderRadius: "4px", transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
            {label}
        </button>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="mono"
            style={{
                fontSize: "10px", letterSpacing: "0.18em",
                color: "var(--text-muted)", textTransform: "uppercase",
                display: "block", marginBottom: "14px",
            }}
        >
            {children}
        </span>
    );
}

/* ─────────────────────────────────
   Modal shell
───────────────────────────────── */
const panelVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 360, damping: 30 } },
    exit: { opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.14 } },
};

function ModalShell({ onClose, wide, children }: { onClose: () => void; wide?: boolean; children: React.ReactNode }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 100, padding: "20px", backdropFilter: "blur(6px)",
            }}
        >
            <motion.div
                variants={panelVariants} initial="hidden" animate="visible" exit="exit"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                    borderRadius: "10px", padding: "32px", width: "100%",
                    maxWidth: wide ? "520px" : "420px", position: "relative",
                }}
            >
                <button
                    onClick={onClose} aria-label="Close"
                    style={{
                        position: "absolute", top: "16px", right: "16px",
                        background: "none", border: "none",
                        color: "var(--text-muted)", cursor: "pointer", padding: "4px",
                    }}
                >
                    <X size={17} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Simple form helper
───────────────────────────────── */
function SimpleForm({
    fields, submitLabel, successMsg, accentBg = "var(--bg-3)",
}: {
    fields: { key: string; placeholder: string; multiline?: boolean }[];
    submitLabel: string;
    successMsg: string;
    accentBg?: string;
}) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [sent, setSent] = useState(false);

    const inputStyle: React.CSSProperties = {
        width: "100%", background: "var(--bg-3)", border: "1px solid var(--border-bright)",
        borderRadius: "6px", padding: "11px 14px", color: "var(--text-primary)",
        fontSize: "13px", fontFamily: "var(--font-body)", outline: "none", marginBottom: "8px",
        transition: "border-color 0.15s",
    };

    if (sent) {
        return (
            <p style={{ fontSize: "13px", color: "var(--success)", textAlign: "center", padding: "24px 0" }}>
                {successMsg}
            </p>
        );
    }

    return (
        <>
            {fields.map((f) =>
                f.multiline ? (
                    <textarea
                        key={f.key} placeholder={f.placeholder} rows={4}
                        value={values[f.key] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        style={{ ...inputStyle, resize: "none" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
                    />
                ) : (
                    <input
                        key={f.key} placeholder={f.placeholder}
                        value={values[f.key] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        style={inputStyle}
                    />
                )
            )}
            <button
                onClick={() => { if (fields.every((f) => values[f.key]?.trim())) setSent(true); }}
                style={{
                    width: "100%", marginTop: "4px", padding: "12px",
                    background: accentBg === "var(--bg-3)" ? "var(--text-primary)" : accentBg,
                    color: "#000", border: "none", borderRadius: "6px",
                    fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-body)",
                    cursor: "pointer",
                }}
            >
                {submitLabel}
            </button>
        </>
    );
}

/* ─────────────────────────────────
   Modals
───────────────────────────────── */
function BugModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalShell onClose={onClose}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <AlertCircle size={16} color="var(--accent)" />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Report a bug</span>
            </div>
            <SimpleForm
                fields={[{ key: "msg", placeholder: "What happened? What did you expect?", multiline: true }]}
                submitLabel="Send report"
                successMsg="Got it — thanks for helping improve this."
            />
        </ModalShell>
    );
}

function TestimonialModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalShell onClose={onClose}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Star size={16} color="var(--accent)" fill="var(--accent)" />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Write a testimonial</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Your story might give someone else the push they need.
            </p>
            <SimpleForm
                fields={[
                    { key: "name", placeholder: "Your name" },
                    { key: "text", placeholder: "How has the 75-day challenge changed you?", multiline: true },
                ]}
                submitLabel="Submit"
                successMsg="Thank you — your story matters."
                accentBg="var(--accent)"
            />
        </ModalShell>
    );
}

function ChangelogModal({ onClose }: { onClose: () => void }) {
    return (
        <ModalShell onClose={onClose}>
            <div style={{ marginBottom: "24px" }}>
                <Tag>Changelog</Tag>
                <h2 style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" }}>What&apos;s new</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {CHANGELOG.map((entry, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "16px 0",
                            borderBottom: i < CHANGELOG.length - 1 ? "1px solid var(--border)" : "none",
                            display: "flex", gap: "16px",
                        }}
                    >
                        <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", width: "56px", flexShrink: 0, paddingTop: "3px" }}>
                            v{entry.version}
                        </span>
                        <div>
                            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                                {entry.date}
                            </span>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{entry.note}</span>
                        </div>
                    </div>
                ))}
            </div>
        </ModalShell>
    );
}

function LoginModal({ onClose }: { onClose: () => void }) {
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";
    return (
        <ModalShell onClose={onClose}>
            <Tag>Unlock full tracking</Tag>
            <h2 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.025em", marginBottom: "6px", lineHeight: 1.2 }}>
                Save your streak.<br />Own your 75 days.
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.7 }}>
                Daily progress saved. Miss any task before midnight — reset to Day 0. No exceptions.
            </p>

            {/* Price */}
            <div style={{
                background: "var(--accent-dim)", border: "1px solid var(--accent)",
                borderRadius: "8px", padding: "16px 20px", marginBottom: "16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div>
                    <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", letterSpacing: "0.1em" }}>ONE-TIME · FOREVER</div>
                    <div className="mono" style={{ fontSize: "36px", fontWeight: "700", color: "var(--accent)", lineHeight: 1 }}>$4</div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", textAlign: "right", lineHeight: 1.8 }}>
                    No subscription<br />No refunds.<br />Commitment only.
                </div>
            </div>

            <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    width: "100%", padding: "14px", background: "var(--accent)", color: "#000",
                    textDecoration: "none", textAlign: "center", fontWeight: "700",
                    fontSize: "13px", borderRadius: "6px", marginBottom: "24px",
                    fontFamily: "var(--font-body)",
                }}
            >
                Pay $4 and start
                <ArrowUpRight size={15} />
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
                    ALREADY PAID
                </span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            <LoginForm />
        </ModalShell>
    );
}

/* ─────────────────────────────────
   Task row
───────────────────────────────── */
function TaskRow({
    task, checked, onToggle, index,
}: {
    task: typeof TASKS[0]; checked: boolean; onToggle: () => void; index: number;
}) {
    const controls = useAnimation();

    const handleClick = useCallback(async () => {
        await controls.start({ scale: 0.84, transition: { duration: 0.07 } });
        await controls.start({ scale: 1.12, transition: { duration: 0.10 } });
        await controls.start({ scale: 1, transition: { type: "spring", stiffness: 500, damping: 22 } });
        onToggle();
    }, [controls, onToggle]);

    return (
        <motion.div
            role="button" tabIndex={0} aria-pressed={checked}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.055, type: "spring", stiffness: 320, damping: 30 }}
            whileHover={{ backgroundColor: checked ? "rgba(45,204,112,0.05)" : "rgba(255,255,255,0.025)" }}
            whileTap={{ scale: 0.995 }}
            onClick={handleClick}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
            style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "16px 20px", cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                background: checked ? "rgba(45,204,112,0.02)" : "transparent",
                transition: "background 0.2s ease", userSelect: "none",
            }}
        >
            {/* Checkbox */}
            <motion.div
                animate={controls}
                style={{
                    width: "24px", height: "24px", flexShrink: 0,
                    borderRadius: "5px", border: `2px solid ${checked ? "var(--success)" : "var(--border-bright)"}`,
                    background: checked ? "var(--success)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s, border-color 0.15s",
                }}
            >
                <AnimatePresence>
                    {checked && (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -12 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 660, damping: 24 }}
                        >
                            <Check size={13} color="#000" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: "13px", fontWeight: "600", letterSpacing: "0.06em",
                    textTransform: "uppercase", color: checked ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: checked ? "line-through" : "none",
                    transition: "color 0.2s", textDecorationColor: "var(--text-muted)",
                }}>
                    {task.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {task.description}
                </div>
            </div>

            {/* Status dot */}
            <div style={{
                width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                background: checked ? "var(--success)" : "var(--border-bright)",
                transition: "background 0.2s",
            }} />
        </motion.div>
    );
}

/* ─────────────────────────────────
   Main component
───────────────────────────────── */
type ModalType = "login" | "bug" | "testimonial" | "changelog" | null;

export default function LandingClient() {
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<ModalType>(null);
    const [hydrated, setHydrated] = useState(false);
    const confettiFired = useRef(false);

    // Load from localStorage after mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) setCheckedTasks(new Set(JSON.parse(saved)));
        } catch { /* ignore */ }
        setHydrated(true);
    }, []);

    // Persist on change
    useEffect(() => {
        if (hydrated) localStorage.setItem(LS_KEY, JSON.stringify([...checkedTasks]));
    }, [checkedTasks, hydrated]);

    const allDone = TASKS.every((t) => checkedTasks.has(t.id));
    const doneCount = checkedTasks.size;

    const fireConfetti = useCallback(() => {
        if (confettiFired.current) return;
        confettiFired.current = true;
        const colors = ["#d4f23d", "#ffffff", "#2dcc70", "#cccccc"];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 55, spread: 100, origin: { y: 0.55, x: 0.2 }, colors }), 220);
        setTimeout(() => confetti({ particleCount: 55, spread: 100, origin: { y: 0.55, x: 0.8 }, colors }), 400);
        setTimeout(() => { confettiFired.current = false; }, 6000);
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
            {/* Modals */}
            <AnimatePresence>
                {modal === "bug" && <BugModal key="bug" onClose={closeModal} />}
                {modal === "testimonial" && <TestimonialModal key="testimonial" onClose={closeModal} />}
                {modal === "changelog" && <ChangelogModal key="changelog" onClose={closeModal} />}
                {modal === "login" && <LoginModal key="login" onClose={closeModal} />}
            </AnimatePresence>

            <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

                {/* ── NAV ── */}
                <nav style={{
                    position: "sticky", top: 0, zIndex: 50,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 32px",
                    background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)",
                    borderBottom: "1px solid var(--border)",
                }}>
                    {/* Logo */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    >
                        <span className="mono" style={{ fontSize: "15px", fontWeight: "700", letterSpacing: "0.16em", color: "var(--text-primary)" }}>75</span>
                        <span className="mono" style={{
                            fontSize: "9px", letterSpacing: "0.14em", color: "#000",
                            background: "var(--accent)", padding: "2px 7px", borderRadius: "3px",
                        }}>BETA</span>
                    </button>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <NavBtn label="Benefits" onClick={() => scrollTo("benefits")} />
                        <NavBtn label="Testimonials" onClick={() => scrollTo("testimonials")} />
                        <NavBtn label="Report bug" onClick={() => setModal("bug")} />
                        <NavBtn label="Write testimonial" onClick={() => setModal("testimonial")} />
                        <button
                            onClick={openLogin}
                            style={{
                                marginLeft: "8px", padding: "7px 18px",
                                border: "1px solid var(--border-bright)", borderRadius: "6px",
                                background: "none", color: "var(--text-primary)", cursor: "pointer",
                                fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: "600",
                                transition: "background 0.15s, color 0.15s",
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
                    padding: "64px 24px 56px", maxWidth: "600px", margin: "0 auto", width: "100%",
                }}>
                    {/* Live badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "5px 14px", background: "var(--accent-dim)",
                            border: "1px solid var(--accent)", borderRadius: "20px", marginBottom: "32px",
                        }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2.2 }}
                            style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)", display: "block" }}
                        />
                        <span className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.18em" }}>
                            75 DAYS. NO EXCUSES.
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                        style={{
                            fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "400",
                            color: "var(--text-secondary)", textAlign: "center",
                            fontFamily: "var(--font-body)",
                            marginBottom: "8px",
                        }}
                    >
                        What are your tasks for today?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.13 }}
                        style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginBottom: "36px", lineHeight: 1.6 }}
                    >
                        Complete all of them before midnight — or reset to Day 0.
                    </motion.p>

                    {/* Checklist card */}
                    <div style={{
                        width: "100%", border: "1px solid var(--border)",
                        borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
                    }}>
                        {/* Card header */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "13px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)",
                        }}>
                            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em" }}>
                                THE 6 DAILY TASKS
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="mono" style={{ fontSize: "11px", color: allDone ? "var(--success)" : "var(--text-secondary)" }}>
                                    {doneCount}/{TASKS.length}
                                </span>
                                <div style={{ width: "60px", height: "2px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                                    <motion.div
                                        animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 380, damping: 40 }}
                                        style={{ height: "100%", background: allDone ? "var(--success)" : "var(--accent)", borderRadius: "2px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tasks */}
                        {TASKS.map((task, i) => (
                            <TaskRow
                                key={task.id} task={task}
                                checked={checkedTasks.has(task.id)}
                                onToggle={() => toggleTask(task.id)}
                                index={i}
                            />
                        ))}
                    </div>

                    {/* Completion banner */}
                    <AnimatePresence>
                        {allDone && (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ width: "100%", overflow: "hidden" }}
                            >
                                <div style={{
                                    padding: "18px 20px", marginBottom: "14px",
                                    background: "var(--success-dim)", border: "1px solid var(--success)",
                                    borderRadius: "8px", textAlign: "center", display: "flex",
                                    flexDirection: "column", gap: "4px",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <Trophy size={18} color="var(--success)" />
                                    </div>
                                    <div className="mono" style={{ fontSize: "11px", color: "var(--success)", letterSpacing: "0.14em" }}>
                                        ALL 6 TASKS COMPLETE
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                        Now imagine doing this every day for 75 days.
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        style={{ width: "100%" }}
                    >
                        <motion.button
                            onClick={openLogin}
                            whileHover={{ scale: 1.012 }}
                            whileTap={{ scale: 0.984 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            style={{
                                width: "100%", padding: "16px",
                                background: allDone ? "var(--success)" : "var(--accent)", color: "#000",
                                border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                                fontFamily: "var(--font-body)", cursor: "pointer",
                                transition: "background 0.4s ease",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                            }}
                        >
                            {allDone ? "Start tracking my real streak" : "Track your 75-day streak"}
                            <ChevronRight size={15} />
                        </motion.button>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
                            One-time unlock · $4 · No subscription, ever
                        </p>
                    </motion.div>
                </section>

                {/* ── BENEFITS / WHY ── */}
                <section id="benefits" style={{ borderTop: "1px solid var(--border)", padding: "80px 24px" }}>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <Tag>The philosophy</Tag>
                        <h2 style={{
                            fontSize: "clamp(30px, 6vw, 48px)", fontWeight: "700",
                            lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "22px",
                        }}>
                            Why 75 days<br />of hard?
                        </h2>
                        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "44px", maxWidth: "480px" }}>
                            Most people start a habit and quit the moment it gets inconvenient. The 75 Hard protocol removes that option. Miss a single task and you start over from Day 0 — no exceptions, no rest days, no half-measures.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                            {WHY_CARDS.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <motion.div
                                        key={card.title}
                                        whileHover={{ y: -2, borderColor: "var(--border-bright)" }}
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        style={{
                                            padding: "20px", background: "var(--bg-2)",
                                            border: "1px solid var(--border)", borderRadius: "8px",
                                        }}
                                    >
                                        <div style={{ marginBottom: "12px" }}>
                                            <Icon size={18} color="var(--text-secondary)" />
                                        </div>
                                        <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{card.title}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{card.desc}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section id="testimonials" style={{ borderTop: "1px solid var(--border)", padding: "80px 0", overflow: "hidden" }}>
                    <div style={{ maxWidth: "600px", margin: "0 auto 36px", padding: "0 24px" }}>
                        <Tag>From the community</Tag>
                        <h2 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
                            Real people.<br />Real streaks.
                        </h2>
                    </div>

                    {/* Scrolling marquee */}
                    <motion.div
                        animate={{ x: [0, -1280] }}
                        transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
                        style={{ display: "flex", gap: "14px", width: "max-content", paddingLeft: "24px" }}
                    >
                        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    width: "272px", flexShrink: 0,
                                    padding: "20px", background: "var(--bg-2)",
                                    border: "1px solid var(--border)", borderRadius: "8px",
                                }}
                            >
                                {/* Stars */}
                                <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
                                    {Array.from({ length: t.stars }).map((_, si) => (
                                        <Star key={si} size={11} color="var(--accent)" fill="var(--accent)" />
                                    ))}
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "16px" }}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "30px", height: "30px", borderRadius: "50%",
                                        background: "var(--border-bright)", display: "flex", alignItems: "center",
                                        justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <span className="mono" style={{ fontSize: "9px", fontWeight: "700" }}>{t.avatar}</span>
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
                    borderTop: "1px solid var(--border)",
                    padding: "100px 24px",
                    maxWidth: "600px", margin: "0 auto", width: "100%", textAlign: "center",
                }}>
                    <h2 style={{
                        fontSize: "clamp(40px, 9vw, 72px)", fontWeight: "700",
                        lineHeight: 0.95, letterSpacing: "-0.035em", marginBottom: "24px",
                    }}>
                        75 DAYS.<br />
                        <span style={{ color: "var(--text-muted)" }}>ARE YOU</span><br />
                        READY?
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "36px", lineHeight: 1.75, maxWidth: "360px", margin: "0 auto 36px" }}>
                        Stop planning to start. The only way to know if you can is to begin today.
                    </p>
                    <motion.button
                        onClick={openLogin}
                        whileHover={{ scale: 1.018 }}
                        whileTap={{ scale: 0.975 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        style={{
                            padding: "16px 44px", background: "var(--accent)", color: "#000",
                            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                            fontFamily: "var(--font-body)", cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: "8px",
                        }}
                    >
                        Start the challenge
                        <ArrowUpRight size={15} />
                    </motion.button>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "14px" }}>
                        One-time payment · $4 · No subscription · No refunds
                    </p>
                </section>

                {/* ── FOOTER ── */}
                <footer style={{
                    borderTop: "1px solid var(--border)",
                    padding: "20px 32px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: "12px",
                }}>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>75 Hard © 2025</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <NavBtn label="Benefits" onClick={() => scrollTo("benefits")} />
                        <NavBtn label="Testimonials" onClick={() => scrollTo("testimonials")} />
                        <NavBtn label="Changelog" onClick={() => setModal("changelog")} />
                        <NavBtn label="Write testimonial" onClick={() => setModal("testimonial")} />
                    </div>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>No excuses.</span>
                </footer>
            </div>
        </>
    );
}
