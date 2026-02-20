import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/streak";
import { TASKS } from "@/lib/tasks";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { taskId } = await request.json();

        if (!taskId || !TASKS.find((t) => t.id === taskId)) {
            return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
        }

        const today = getLocalDateString();

        // Upsert today's log
        const { data: existingLog } = await supabase
            .from("daily_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("log_date", today)
            .single();

        const currentTasks: string[] = existingLog?.completed_tasks ?? [];
        const updatedTasks = currentTasks.includes(taskId)
            ? currentTasks.filter((t) => t !== taskId) // toggle off
            : [...currentTasks, taskId]; // toggle on

        const allComplete = TASKS.every((t) => updatedTasks.includes(t.id));

        const { error: logError } = await supabase.from("daily_logs").upsert(
            {
                user_id: user.id,
                log_date: today,
                completed_tasks: updatedTasks,
                all_complete: allComplete,
            },
            { onConflict: "user_id,log_date" }
        );

        if (logError) throw logError;

        // If all tasks just became complete, increment the challenge day
        if (allComplete && !existingLog?.all_complete) {
            const { data: challenge } = await supabase
                .from("challenges")
                .select("*")
                .eq("user_id", user.id)
                .single();

            const newDay = (challenge?.current_day ?? 0) + 1;
            const startDate = challenge?.start_date ?? today;

            await supabase.from("challenges").upsert(
                {
                    user_id: user.id,
                    start_date: startDate,
                    current_day: newDay,
                    streak_active: true,
                    last_completed_date: today,
                },
                { onConflict: "user_id" }
            );
        }

        return NextResponse.json({
            success: true,
            completedTasks: updatedTasks,
            allComplete,
        });
    } catch (error) {
        console.error("complete-task error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
