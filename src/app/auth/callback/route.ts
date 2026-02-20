import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    // No auth code → back to landing
    if (!code) return NextResponse.redirect(`${origin}/`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey ||
        !supabaseUrl.startsWith("http") ||
        supabaseUrl === "your_supabase_project_url"
    ) {
        return NextResponse.redirect(`${origin}/`);
    }

    // Build the response – start with a redirect to onboarding/complete as safe default
    const response = NextResponse.redirect(`${origin}/onboarding/complete`);

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Exchange failed → safe fallback to home
    if (error) {
        console.error("[auth/callback] exchange error:", error.message);
        return NextResponse.redirect(`${origin}/`);
    }

    // Get the now-authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(`${origin}/`);

    // Read profile to determine where to send them
    const { data: profile } = await supabase
        .from("profiles")
        .select("has_paid, onboarding_complete")
        .eq("id", user.id)
        .single();

    // Returning paid user → straight to dashboard
    if (profile?.onboarding_complete && profile?.has_paid) {
        return NextResponse.redirect(`${origin}/dashboard`);
    }

    // Onboarded but not paid → paywall screen
    if (profile?.onboarding_complete && !profile?.has_paid) {
        return NextResponse.redirect(`${origin}/onboarding/complete`);
    }

    // New or incomplete user → onboarding/complete to save profile + show paywall
    return NextResponse.redirect(`${origin}/onboarding/complete`);
}
