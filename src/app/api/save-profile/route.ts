import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Server-side session read — this ALWAYS works after OAuth callback
    // because the server reads HTTP cookies set by the callback route
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
        console.error("[save-profile] getUser failed:", userError?.message);
        return NextResponse.json(
            { error: "Not authenticated. Please sign in again." },
            { status: 401 }
        );
    }

    const body = await request.json();
    const { name, days, tasks } = body as {
        name: string;
        days: 31 | 75 | 90;
        tasks: { id: string; label: string; description: string }[];
    };

    if (!days || !tasks) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days - 1);
    const endStr = endDate.toISOString().split("T")[0];

    // UPDATE profile — trigger already created the row on signup.
    // Using update (not upsert) because profiles table has no INSERT RLS for users.
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            email: user.email,
            name: name || user.user_metadata?.full_name || user.email?.split("@")[0],
            onboarding_complete: true,
        })
        .eq("id", user.id);

    if (profileError) {
        console.error("[save-profile] profile update error:", profileError);
        return NextResponse.json(
            { error: `Profile save failed: ${profileError.message}` },
            { status: 500 }
        );
    }

    // UPSERT challenge — may not exist yet for new users
    const { error: challengeError } = await supabase
        .from("challenges")
        .upsert({
            user_id: user.id,
            duration: days,
            start_date: today,
            end_date: endStr,
            current_day: 1,
            streak_active: true,
            custom_tasks: tasks,
        }, { onConflict: "user_id" });

    if (challengeError) {
        console.error("[save-profile] challenge upsert error:", challengeError);
        return NextResponse.json(
            { error: `Challenge save failed: ${challengeError.message}` },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
