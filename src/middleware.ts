import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_supabase_project_url") {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    // Always allow: public, auth, api routes
    if (
        pathname === "/" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api")
    ) {
        return supabaseResponse;
    }

    // Not logged in → landing
    if (!user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // /onboarding → only needs auth, not payment
    if (pathname.startsWith("/onboarding")) {
        return supabaseResponse;
    }

    // /dashboard → needs paid
    if (pathname.startsWith("/dashboard")) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("has_paid, onboarding_complete")
            .eq("id", user.id)
            .single();

        if (!profile?.onboarding_complete) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        if (!profile?.has_paid) {
            return NextResponse.redirect(new URL("/onboarding?step=paywall", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
