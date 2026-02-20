import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const all = cookieStore.getAll();
    const supabaseCookies = all.filter(c =>
        c.name.includes("supabase") || c.name.includes("sb-")
    );
    return NextResponse.json({
        totalCookies: all.length,
        allNames: all.map(c => c.name),
        supabaseCookies: supabaseCookies.map(c => ({ name: c.name, length: c.value.length })),
    });
}
