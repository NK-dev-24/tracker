import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboarding";

    if (!code) return NextResponse.redirect(`${origin}/`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(`${origin}/`);
    }

    const response = NextResponse.redirect(`${origin}${next}`);

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
    if (error) return NextResponse.redirect(`${origin}/`);

    // Check if onboarding is already complete → skip to dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_complete, has_paid")
            .eq("id", user.id)
            .single();

        if (profile?.onboarding_complete && profile?.has_paid) {
            return NextResponse.redirect(`${origin}/dashboard`);
        }
        if (profile?.onboarding_complete) {
            return NextResponse.redirect(`${origin}/onboarding?step=paywall`);
        }
    }

    return response;
}
