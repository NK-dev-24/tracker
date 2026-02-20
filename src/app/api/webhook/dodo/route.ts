import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const event = JSON.parse(body);

        // Verify Dodo webhook secret
        const signature = request.headers.get("webhook-signature");
        if (signature !== process.env.DODO_PAYMENTS_WEBHOOK_SECRET) {
            console.warn("Invalid Dodo webhook signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Handle successful payment
        if (event.type === "payment.succeeded" || event.type === "checkout.completed") {
            const customerEmail =
                event.data?.customer?.email ||
                event.data?.billing_details?.email ||
                event.data?.metadata?.email;

            if (!customerEmail) {
                return NextResponse.json(
                    { error: "No customer email in payload" },
                    { status: 400 }
                );
            }

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Find user by email and mark as paid
            const { data: userData, error: userError } =
                await supabase.auth.admin.listUsers();

            if (userError) throw userError;

            const matchedUser = userData.users.find(
                (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
            );

            if (matchedUser) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ has_paid: true })
                    .eq("id", matchedUser.id);

                if (error) throw error;

                console.log(`Unlocked access for ${customerEmail}`);
                return NextResponse.json({ success: true });
            } else {
                // User hasn't signed up yet — store email for when they do
                console.log(`Payment received for ${customerEmail} — user not yet registered`);
                return NextResponse.json({ received: true, note: "User not yet registered" });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Dodo webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
