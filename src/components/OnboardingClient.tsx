"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { TASKS } from "@/lib/tasks";

/* ─────────────────────────────────
   Types
───────────────────────────────── */
type Step = "name" | "science-1" | "duration" | "science-2" | "goals" | "science-3" | "sign" | "paywall";

interface UserData {
    name: string;
    days: 31 | 75 | 90;
    signature: string;
}

const DURATION_OPTIONS: { days: 31 | 75 | 90; label: string; desc: string; hard: boolean }[] = [
    { days: 31, label: "31 Days", desc: "Build the foundation. One month of zero excuses.", hard: false },
    { days: 75, label: "75 Days", desc: "The original protocol. The one that changes people.", hard: true },
    { days: 90, label: "90 Days", desc: "For those who want to go further than most dared.", hard: false },
];

/* ─────────────────────────────────
   Science fact interstitials
───────────────────────────────── */
const SCIENCE_FACTS: Record<string, { stat: string; unit: string; claim: string; source: string; color: string }> = {
    "science-1": {
        stat: "3×",
        unit: "more likely",
        claim: "People who make a written commitment to a goal achieve it at 3x the rate of those who only think about it.",
        source: "Dominican University of California, 2015",
        color: "var(--accent)",
    },
    "science-2": {
        stat: "66",
        unit: "days",
        claim: "The average time it takes for a new behaviour to become automatic. Not 21 days — that was a myth.",
        source: "Phillippa Lally, University College London",
        color: "var(--success)",
    },
    "science-3": {
        stat: "91%",
        unit: "higher success",
        claim: "People with specific, time-bound goals outperform those with vague intentions by a margin of 9 to 1.",
        source: "American Psychological Association",
        color: "#a78bfa",
    },
};

/* ─────────────────────────────────
   Layout wrapper
───────────────────────────────── */
const pageVariants = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
};
const pageTransition = { duration: 0.36, ease: "easeOut" } as const;


function Stepper({ current, total }: { current: number; total: number }) {
    return (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "48px" }}>
            {Array.from({ length: total }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        width: i === current ? "28px" : "8px",
                        background: i < current ? "var(--success)" : i === current ? "var(--accent)" : "var(--border-bright)",
                    }}
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    style={{ height: "4px", borderRadius: "4px" }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────
   Step: Name entry
───────────────────────────────── */
function StepName({ onNext }: { onNext: (name: string) => void }) {
    const [name, setName] = useState("");
    const valid = name.trim().length > 1;

    return (
        <motion.div initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}>
            <Stepper current={0} total={4} />
            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em", display: "block", marginBottom: "14px" }}>
                STEP 1 OF 4
            </span>
            <h1 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "12px" }}>
                Before we begin,<br />what do we call you?
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
                This isn't a passive tracker. You're making a contract with yourself. Let's start by putting your name on it.
            </p>
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && valid && onNext(name.trim())}
                placeholder="Your full name"
                style={{
                    width: "100%", padding: "16px 18px",
                    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                    borderRadius: "8px", color: "var(--text-primary)",
                    fontSize: "18px", fontFamily: "var(--font-body)", outline: "none",
                    marginBottom: "14px", transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
            />
            <motion.button
                onClick={() => valid && onNext(name.trim())}
                disabled={!valid}
                whileHover={valid ? { scale: 1.012 } : {}}
                whileTap={valid ? { scale: 0.984 } : {}}
                style={{
                    width: "100%", padding: "16px",
                    background: valid ? "var(--accent)" : "var(--border)",
                    color: valid ? "#000" : "var(--text-muted)", border: "none",
                    borderRadius: "8px", fontWeight: "700", fontSize: "14px",
                    fontFamily: "var(--font-body)", cursor: valid ? "pointer" : "not-allowed",
                    transition: "background 0.2s, color 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
            >
                Continue
                <ArrowRight size={15} />
            </motion.button>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Science interstitial
───────────────────────────────── */
function StepScience({ id, onNext }: { id: string; onNext: () => void }) {
    const fact = SCIENCE_FACTS[id];
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 1800);
        return () => clearTimeout(t);
    }, []);

    return (
        <motion.div
            initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}
            style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
            {/* Big animated stat */}
            <div style={{ marginBottom: "32px", position: "relative" }}>
                <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                    style={{
                        fontSize: "clamp(72px, 16vw, 110px)", fontWeight: "700",
                        fontFamily: "var(--font-heading)", letterSpacing: "-0.04em",
                        color: fact.color, lineHeight: 1,
                    }}
                >
                    {fact.stat}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="mono"
                    style={{ fontSize: "12px", color: fact.color, letterSpacing: "0.16em", marginTop: "6px" }}
                >
                    {fact.unit.toUpperCase()}
                </motion.div>
            </div>

            {/* Animated bar for visual interest */}
            <div style={{ width: "200px", height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", marginBottom: "32px" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                    style={{ height: "100%", background: fact.color, borderRadius: "2px" }}
                />
            </div>

            <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
                style={{ fontSize: "17px", color: "var(--text-primary)", lineHeight: 1.7, maxWidth: "380px", marginBottom: "12px", fontWeight: "400" }}
            >
                {fact.claim}
            </motion.p>
            <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="mono"
                style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "44px" }}
            >
                — {fact.source}
            </motion.p>

            <AnimatePresence>
                {ready && (
                    <motion.button
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={onNext}
                        whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{
                            padding: "13px 32px", background: "var(--bg-2)",
                            border: "1px solid var(--border-bright)", borderRadius: "8px",
                            color: "var(--text-primary)", fontSize: "13px", fontWeight: "600",
                            fontFamily: "var(--font-body)", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}
                    >
                        Continue
                        <ArrowRight size={14} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Duration
───────────────────────────────── */
function StepDuration({ onNext }: { onNext: (days: 31 | 75 | 90) => void }) {
    const [selected, setSelected] = useState<31 | 75 | 90>(75);

    return (
        <motion.div initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}>
            <Stepper current={1} total={4} />
            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em", display: "block", marginBottom: "14px" }}>
                STEP 2 OF 4
            </span>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>
                Choose your battle.
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
                There is no wrong answer here. There is only the answer you will actually show up for.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {DURATION_OPTIONS.map((opt) => (
                    <motion.button
                        key={opt.days}
                        onClick={() => setSelected(opt.days)}
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.994 }}
                        style={{
                            padding: "18px 20px", textAlign: "left",
                            background: selected === opt.days ? "var(--accent-dim)" : "var(--bg-2)",
                            border: `1px solid ${selected === opt.days ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font-body)",
                            transition: "background 0.15s, border-color 0.15s",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "15px", fontWeight: "700", color: selected === opt.days ? "var(--accent)" : "var(--text-primary)" }}>
                                    {opt.label}
                                </span>
                                {opt.hard && (
                                    <span className="mono" style={{
                                        fontSize: "9px", color: "#000", background: "var(--accent)",
                                        padding: "2px 6px", borderRadius: "3px", letterSpacing: "0.12em",
                                    }}>
                                        ORIGINAL
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{opt.desc}</div>
                        </div>
                        <div style={{
                            width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginLeft: "16px",
                            border: `2px solid ${selected === opt.days ? "var(--accent)" : "var(--border-bright)"}`,
                            background: selected === opt.days ? "var(--accent)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                        }}>
                            {selected === opt.days && <Check size={11} color="#000" strokeWidth={3} />}
                        </div>
                    </motion.button>
                ))}
            </div>

            <motion.button
                onClick={() => onNext(selected)}
                whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                style={{
                    width: "100%", padding: "16px", background: "var(--accent)", color: "#000",
                    border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px",
                    fontFamily: "var(--font-body)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
            >
                I choose {selected} days
                <ArrowRight size={15} />
            </motion.button>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Goals confirmation
───────────────────────────────── */
function StepGoals({ days, onNext }: { days: number; onNext: () => void }) {
    const [confirmed, setConfirmed] = useState(false);

    return (
        <motion.div initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}>
            <Stepper current={2} total={4} />
            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em", display: "block", marginBottom: "14px" }}>
                STEP 3 OF 4
            </span>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>
                Your {days}-day<br />non-negotiables.
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "24px" }}>
                These are your tasks. Every single day. No exceptions.
                Once you confirm, <strong style={{ color: "var(--text-primary)" }}>these cannot be changed</strong> until your challenge is complete.
            </p>

            {/* Task list */}
            <div style={{
                border: "1px solid var(--border)", borderRadius: "8px",
                overflow: "hidden", marginBottom: "20px",
            }}>
                {TASKS.map((task, i) => (
                    <div
                        key={task.id}
                        style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            padding: "14px 18px",
                            borderBottom: i < TASKS.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                    >
                        <div style={{
                            width: "20px", height: "20px", flexShrink: 0,
                            borderRadius: "4px", background: "var(--success-dim)",
                            border: "1px solid var(--success)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Check size={11} color="var(--success)" strokeWidth={3} />
                        </div>
                        <div>
                            <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                                {task.label}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{task.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm checkbox */}
            <motion.div
                onClick={() => setConfirmed(!confirmed)}
                style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "14px 16px", background: "var(--bg-2)",
                    border: `1px solid ${confirmed ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "8px", cursor: "pointer", marginBottom: "20px",
                    transition: "border-color 0.15s, background 0.15s",
                    userSelect: "none",
                }}
            >
                <div style={{
                    width: "18px", height: "18px", flexShrink: 0, marginTop: "1px",
                    borderRadius: "4px", border: `2px solid ${confirmed ? "var(--accent)" : "var(--border-bright)"}`,
                    background: confirmed ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                }}>
                    {confirmed && <Check size={10} color="#000" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    I understand these are my tasks for the full {days} days. I will not change them mid-challenge.
                </span>
            </motion.div>

            <motion.button
                onClick={() => confirmed && onNext()}
                disabled={!confirmed}
                whileHover={confirmed ? { scale: 1.012 } : {}}
                whileTap={confirmed ? { scale: 0.984 } : {}}
                style={{
                    width: "100%", padding: "16px",
                    background: confirmed ? "var(--accent)" : "var(--border)",
                    color: confirmed ? "#000" : "var(--text-muted)", border: "none",
                    borderRadius: "8px", fontWeight: "700", fontSize: "14px",
                    fontFamily: "var(--font-body)", cursor: confirmed ? "pointer" : "not-allowed",
                    transition: "background 0.2s, color 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
            >
                Confirm my tasks
                <ArrowRight size={15} />
            </motion.button>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Signature / Final commit
───────────────────────────────── */
function StepSign({ userData, onNext }: { userData: UserData; onNext: () => void }) {
    const [signed, setSigned] = useState(false);

    return (
        <motion.div initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}>
            <Stepper current={3} total={4} />
            <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.18em", display: "block", marginBottom: "14px" }}>
                STEP 4 OF 4
            </span>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>
                Make it official.
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "36px" }}>
                Sign below. This is your commitment to yourself — not to us, not to anyone else. Just you.
            </p>

            {/* The contract */}
            <div style={{
                padding: "24px", background: "var(--bg-2)",
                border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "20px",
            }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "24px" }}>
                    I, <strong style={{ color: "var(--text-primary)" }}>{userData.name}</strong>, commit to completing
                    all 6 daily tasks for <strong style={{ color: "var(--text-primary)" }}>{userData.days} consecutive days</strong>.
                    I accept that missing a single task — for any reason — resets my progress to Day 0.
                    There are no exceptions. There is no negotiation. This is my word.
                </p>

                {/* Signature area */}
                <div
                    style={{
                        borderBottom: "2px solid var(--border-bright)",
                        paddingBottom: "8px", marginBottom: "8px",
                        minHeight: "56px", display: "flex", alignItems: "flex-end",
                    }}
                >
                    <AnimatePresence>
                        {signed ? (
                            <motion.span
                                key="sig"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    fontSize: "clamp(28px, 6vw, 40px)",
                                    fontStyle: "italic",
                                    color: "var(--text-primary)",
                                    fontFamily: "Georgia, 'Times New Roman', serif",
                                    letterSpacing: "0.01em",
                                }}
                            >
                                {userData.name}
                            </motion.span>
                        ) : (
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                                Click below to sign
                            </span>
                        )}
                    </AnimatePresence>
                </div>
                <p className="mono" style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                    SIGNATURE · FOR YOUR PROMISE
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!signed ? (
                    <motion.button
                        key="sign-btn"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        onClick={() => setSigned(true)}
                        whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{
                            width: "100%", padding: "16px", background: "var(--bg-3)",
                            border: "1px solid var(--border-bright)", borderRadius: "8px",
                            color: "var(--text-primary)", fontWeight: "600", fontSize: "14px",
                            fontFamily: "var(--font-body)", cursor: "pointer", marginBottom: "12px",
                        }}
                    >
                        Sign the contract
                    </motion.button>
                ) : (
                    <motion.button
                        key="done-btn"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        onClick={onNext}
                        whileHover={{ scale: 1.012 }} whileTap={{ scale: 0.984 }}
                        style={{
                            width: "100%", padding: "16px", background: "var(--accent)", color: "#000",
                            border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px",
                            fontFamily: "var(--font-body)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            marginBottom: "12px",
                        }}
                    >
                        Day 1 starts now
                        <ArrowRight size={15} />
                    </motion.button>
                )}
            </AnimatePresence>

            {signed && (
                <button
                    onClick={() => setSigned(false)}
                    style={{
                        background: "none", border: "none", color: "var(--text-muted)",
                        fontSize: "12px", fontFamily: "var(--font-body)", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "6px", margin: "0 auto",
                    }}
                >
                    <RotateCcw size={12} /> Clear signature
                </button>
            )}
        </motion.div>
    );
}

/* ─────────────────────────────────
   Step: Paywall
───────────────────────────────── */
function StepPaywall({ userData }: { userData: UserData }) {
    const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";

    return (
        <motion.div initial={pageVariants.initial} animate={pageVariants.animate} exit={pageVariants.exit} transition={pageTransition}>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
                    style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "var(--success-dim)", border: "1px solid var(--success)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                    }}
                >
                    <Check size={22} color="var(--success)" strokeWidth={2.5} />
                </motion.div>
                <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "10px" }}>
                    You&apos;re committed,<br />{userData.name.split(" ")[0]}.
                </h1>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "380px", margin: "0 auto" }}>
                    Now choose how seriously you want to take this.
                </p>
            </div>

            {/* Option A — Paid */}
            <div style={{
                padding: "22px", background: "var(--accent-dim)",
                border: "1px solid var(--accent)", borderRadius: "10px", marginBottom: "12px",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.14em", display: "block", marginBottom: "4px" }}>
                            FULL TRACKING · ONE-TIME
                        </span>
                        <span className="mono" style={{ fontSize: "38px", fontWeight: "700", color: "var(--accent)", lineHeight: 1 }}>$4</span>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                        Beta price<br />No subscription<br />No refunds
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
                    {[
                        "Daily progress saved — forever",
                        "Streak resets at midnight if you miss a task",
                        "75-day visual progress grid",
                        "Never start over without knowing it",
                    ].map((feat) => (
                        <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <Check size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{feat}</span>
                        </div>
                    ))}
                </div>
                <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        width: "100%", padding: "15px", background: "var(--accent)", color: "#000",
                        textDecoration: "none", fontWeight: "700", fontSize: "14px",
                        fontFamily: "var(--font-body)", borderRadius: "7px",
                    }}
                >
                    Pay $4 and start tracking
                    <ArrowUpRight size={15} />
                </a>
            </div>

            {/* Option B — Free */}
            <div style={{
                padding: "18px", background: "var(--bg-2)",
                border: "1px solid var(--border)", borderRadius: "10px",
            }}>
                <div style={{ marginBottom: "10px" }}>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.14em", display: "block", marginBottom: "4px" }}>
                        USE FOR FREE
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        Daily use, no account. Your progress resets every day — nothing is saved between sessions.
                    </span>
                </div>
                <button
                    onClick={() => window.location.href = "/"}
                    style={{
                        width: "100%", padding: "12px", background: "var(--bg-3)",
                        border: "1px solid var(--border-bright)", borderRadius: "6px",
                        color: "var(--text-secondary)", fontWeight: "600", fontSize: "13px",
                        fontFamily: "var(--font-body)", cursor: "pointer",
                    }}
                >
                    Use without saving
                </button>
            </div>
        </motion.div>
    );
}

/* ─────────────────────────────────
   Root Component
───────────────────────────────── */
const STEP_ORDER: Step[] = ["name", "science-1", "duration", "science-2", "goals", "science-3", "sign", "paywall"];

export default function OnboardingClient() {
    const [stepIndex, setStepIndex] = useState(0);
    const [userData, setUserData] = useState<UserData>({ name: "", days: 75, signature: "" });
    const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1)), []);
    const step = STEP_ORDER[stepIndex];

    return (
        <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            {/* Persistent logo */}
            <div style={{ position: "fixed", top: "20px", left: "28px" }}>
                <span className="mono" style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.16em", color: "var(--text-muted)" }}>75</span>
            </div>

            <div style={{ width: "100%", maxWidth: "480px" }}>
                <AnimatePresence mode="wait">
                    {step === "name" && (
                        <StepName key="name" onNext={(name) => { setUserData((u) => ({ ...u, name })); next(); }} />
                    )}
                    {step === "science-1" && (
                        <StepScience key="science-1" id="science-1" onNext={next} />
                    )}
                    {step === "duration" && (
                        <StepDuration key="duration" onNext={(days) => { setUserData((u) => ({ ...u, days })); next(); }} />
                    )}
                    {step === "science-2" && (
                        <StepScience key="science-2" id="science-2" onNext={next} />
                    )}
                    {step === "goals" && (
                        <StepGoals key="goals" days={userData.days} onNext={next} />
                    )}
                    {step === "science-3" && (
                        <StepScience key="science-3" id="science-3" onNext={next} />
                    )}
                    {step === "sign" && (
                        <StepSign key="sign" userData={userData} onNext={next} />
                    )}
                    {step === "paywall" && (
                        <StepPaywall key="paywall" userData={userData} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
