import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    // OAuth provider returned an error
    if (errorParam) {
        console.error("[auth/callback] OAuth error:", errorParam, errorDesc);
        return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(errorDesc ?? errorParam)}`);
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/?auth_error=no_code`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("http")) {
        return NextResponse.redirect(`${origin}/?auth_error=supabase_not_configured`);
    }

    // We need to set cookies on the FINAL response.
    // Start with a mutable response so we can set cookies before deciding where to redirect.
    let redirectTarget = `${origin}/onboarding/complete`;
    const response = NextResponse.redirect(redirectTarget);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
        console.error("[auth/callback] exchangeCodeForSession failed:", exchangeError.message);
        return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(exchangeError.message)}`);
    }

    // Now get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(`${origin}/?auth_error=no_user_after_exchange`);
    }

    // Try to save onboarding data if it was embedded in the redirectTo URL
    // (We encode it as a base64 query param when initiating OAuth)
    const encodedData = searchParams.get("od");
    if (encodedData) {
        try {
            const onboardingData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
            const { name, days, tasks } = onboardingData as {
                name: string;
                days: number;
                tasks: { id: string; label: string; description: string }[];
            };

            const today = new Date().toISOString().split("T")[0];
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days - 1);

            await supabase.from("profiles").update({
                email: user.email,
                name: name || user.user_metadata?.full_name || user.email?.split("@")[0],
                onboarding_complete: true,
            }).eq("id", user.id);

            await supabase.from("challenges").upsert({
                user_id: user.id,
                duration: days,
                start_date: today,
                end_date: endDate.toISOString().split("T")[0],
                current_day: 1,
                streak_active: true,
                custom_tasks: tasks,
            }, { onConflict: "user_id" });

        } catch (e) {
            console.error("[auth/callback] Failed to save onboarding data:", e);
            // Don't fail the whole auth flow — redirect to complete page to try again
        }
    }

    // Route based on profile state
    const { data: profile } = await supabase
        .from("profiles")
        .select("has_paid, onboarding_complete")
        .eq("id", user.id)
        .single();

    if (profile?.onboarding_complete && profile?.has_paid) {
        redirectTarget = `${origin}/dashboard`;
    } else {
        redirectTarget = `${origin}/onboarding/complete`;
    }

    // Return the final redirect with auth cookies attached
    const finalResponse = NextResponse.redirect(redirectTarget);
    // Copy all cookies from the original response to the final response
    response.cookies.getAll().forEach(({ name, value, ...rest }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalResponse.cookies.set(name, value, rest as any);
    });

    return finalResponse;
}
