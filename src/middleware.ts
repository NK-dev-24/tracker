import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip auth if env vars are not set (local dev without Supabase)
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_supabase_project_url") {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes
    if (
        pathname === "/" ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api")
    ) {
        return supabaseResponse;
    }

    // If not logged in, redirect to landing
    if (!user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user has paid
    if (pathname.startsWith("/dashboard")) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("has_paid")
            .eq("id", user.id)
            .single();

        if (!profile?.has_paid) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
