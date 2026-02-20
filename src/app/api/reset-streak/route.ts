import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getLocalDateString } from "@/lib/streak";

// Called by Vercel Cron at 23:59 daily
// Also callable manually with the CRON_SECRET header
export async function POST(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const today = getLocalDateString();

        // Find all active challenges where last_completed_date is not today
        const { data: staleChallenges, error } = await supabase
            .from("challenges")
            .select("*")
            .eq("streak_active", true)
            .neq("last_completed_date", today)
            .gt("current_day", 0);

        if (error) throw error;

        if (!staleChallenges || staleChallenges.length === 0) {
            return NextResponse.json({
                message: "No streaks to reset",
                reset: 0,
            });
        }

        // Reset all stale streaks
        const ids = staleChallenges.map((c) => c.user_id);
        const { error: resetError } = await supabase
            .from("challenges")
            .update({
                current_day: 0,
                streak_active: false,
                updated_at: new Date().toISOString(),
            })
            .in("user_id", ids);

        if (resetError) throw resetError;

        console.log(`Reset ${ids.length} streaks at ${new Date().toISOString()}`);

        return NextResponse.json({
            message: `Reset ${ids.length} streaks`,
            reset: ids.length,
        });
    } catch (error) {
        console.error("reset-streak error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Allow Vercel Cron to call via GET too
export async function GET(request: Request) {
    return POST(request);
}
