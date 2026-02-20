import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboarding/complete";

    if (!code) return NextResponse.redirect(`${origin}/`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.redirect(`${origin}/`);

    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/`);

    // Check existing profile to route correctly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("has_paid, onboarding_complete")
            .eq("id", user.id)
            .single();

        // Returning paid user → dashboard
        if (profile?.onboarding_complete && profile?.has_paid) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }
        // Completed onboarding but not paid → paywall
        if (profile?.onboarding_complete && !profile?.has_paid) {
            return NextResponse.redirect(`${origin}/onboarding/complete`);
        }
        // New user or incomplete → complete onboarding
        return NextResponse.redirect(`${origin}/onboarding/complete`);
    }

    return response;
}
