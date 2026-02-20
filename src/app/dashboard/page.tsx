import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocalDateString } from "@/lib/streak";
import TaskChecklist from "@/components/TaskChecklist";
import ProgressGrid from "@/components/ProgressGrid";
import StreakCounter from "@/components/StreakCounter";
import MidnightTimer from "@/components/MidnightTimer";
import ResetBanner from "@/components/ResetBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/");

    const today = getLocalDateString();

    // Load challenge state
    const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Load today's log
    const { data: todayLog } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .single();

    const completedToday: string[] = todayLog?.completed_tasks ?? [];
    const currentDay = challenge?.current_day ?? 0;
    const streakActive = challenge?.streak_active ?? false;
    const startDate = challenge?.start_date ?? null;
    const lastCompletedDate = challenge?.last_completed_date ?? null;

    // Check if streak was broken (last completion was before yesterday and not today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    const streakWasBroken =
        currentDay > 0 &&
        lastCompletedDate !== null &&
        lastCompletedDate < yStr &&
        lastCompletedDate !== today;

    return (
        <main
            style={{
                minHeight: "100svh",
                background: "var(--bg)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Nav */}
            <nav
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 32px",
                    borderBottom: "1px solid var(--border)",
                    position: "sticky",
                    top: 0,
                    background: "rgba(10, 10, 10, 0.92)",
                    backdropFilter: "blur(12px)",
                    zIndex: 10,
                }}
            >
                <span
                    className="mono"
                    style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        letterSpacing: "0.2em",
                    }}
                >
                    75
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <MidnightTimer />
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                                fontSize: "10px",
                                fontFamily: "'Space Mono', monospace",
                                letterSpacing: "0.12em",
                                padding: "6px 12px",
                                cursor: "pointer",
                            }}
                        >
                            SIGN OUT
                        </button>
                    </form>
                </div>
            </nav>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    maxWidth: "720px",
                    width: "100%",
                    margin: "0 auto",
                    padding: "40px 24px 60px",
                }}
            >
                {/* Reset Banner */}
                {streakWasBroken && <ResetBanner />}

                {/* Streak Counter */}
                <StreakCounter
                    currentDay={currentDay}
                    startDate={startDate}
                    streakActive={streakActive}
                />

                {/* Progress Grid */}
                <div style={{ marginBottom: "48px" }}>
                    <ProgressGrid currentDay={currentDay} />
                </div>

                {/* Task Checklist */}
                <TaskChecklist initialCompleted={completedToday} />
            </div>

            {/* Footer */}
            <footer
                style={{
                    padding: "20px 32px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <span
                    className="mono"
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                >
                    {user.email}
                </span>
                <span
                    className="mono"
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                >
                    {today}
                </span>
            </footer>
        </main>
    );
}
