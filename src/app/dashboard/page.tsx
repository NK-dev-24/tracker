import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocalDateString } from "@/lib/streak";
import { TASKS } from "@/lib/tasks";
import DashboardClient from "@/components/DashboardClient";
import ResetBanner from "@/components/ResetBanner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const today = getLocalDateString();

    // Load profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("name, has_paid, onboarding_complete")
        .eq("id", user.id)
        .single();

    if (!profile?.onboarding_complete) redirect("/onboarding");
    if (!profile?.has_paid) redirect("/onboarding/complete");

    // Load challenge
    const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!challenge) redirect("/onboarding");

    // Load today's log
    const { data: todayLog } = await supabase
        .from("daily_logs")
        .select("completed_tasks")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .single();

    // Resolve tasks (custom or default)
    const tasks = challenge.custom_tasks as { id: string; label: string; description: string }[] | null
        ?? TASKS;

    const completedToday: string[] = todayLog?.completed_tasks ?? [];
    const currentDay: number = challenge.current_day ?? 1;
    const totalDays: number = challenge.duration ?? 75;
    const startDate: string = challenge.start_date ?? today;
    const lastCompleted: string | null = challenge.last_completed_date ?? null;

    // Streak broken check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    const streakBroken = currentDay > 1 && lastCompleted !== null && lastCompleted < yStr && lastCompleted !== today;

    return (
        <DashboardClient
            currentDay={currentDay}
            totalDays={totalDays}
            startDate={startDate}
            tasks={tasks}
            completedToday={completedToday}
            userName={profile.name ?? user.email?.split("@")[0] ?? ""}
            streakBroken={streakBroken}
            userId={user.id}
        />
    );
}
