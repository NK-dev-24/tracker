import LoginForm from "@/components/LoginForm";

export default async function LandingPage() {
  // Only check auth/paid status if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && supabaseUrl !== "your_supabase_project_url";

  if (isSupabaseConfigured) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const { redirect } = await import("next/navigation");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_paid")
          .eq("id", user.id)
          .single();

        if (profile?.has_paid) {
          redirect("/dashboard");
        }
      }
    } catch {
      // Silently fail — show landing page
    }
  }

  const paymentLink =
    process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK || "#";

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: "14px",
            fontWeight: "700",
            letterSpacing: "0.2em",
            color: "var(--text-primary)",
          }}
        >
          75
        </span>
        <span
          className="mono"
          style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "0.2em",
          }}
        >
          EST. 2025
        </span>
      </nav>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          maxWidth: "640px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            borderRadius: "2px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: "10px",
              color: "var(--accent)",
              letterSpacing: "0.2em",
            }}
          >
            75 DAYS. NO EXCEPTIONS.
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(52px, 12vw, 96px)",
            fontWeight: "700",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          HARD.
          <br />
          <span style={{ color: "var(--text-muted)" }}>EVERY</span>
          <br />
          DAY.
        </h1>

        {/* Rules */}
        <div
          style={{
            width: "100%",
            marginBottom: "48px",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          {[
            ["01", "Complete all 6 tasks daily"],
            ["02", "Every task, before midnight"],
            ["03", "Miss one → back to Day 0"],
            ["04", "75 days straight. No mercy."],
          ].map(([num, rule]) => (
            <div
              key={num}
              style={{
                display: "flex",
                gap: "20px",
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
                alignItems: "center",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  width: "20px",
                }}
              >
                {num}
              </span>
              <span
                style={{ fontSize: "14px", color: "var(--text-secondary)" }}
              >
                {rule}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ width: "100%", marginBottom: "32px" }}>
          <a
            href={paymentLink}
            style={{
              display: "block",
              width: "100%",
              padding: "18px",
              background: "var(--accent)",
              color: "#000",
              textDecoration: "none",
              textAlign: "center",
              fontFamily: "'Space Mono', monospace",
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              borderRadius: "4px",
            }}
          >
            START THE CHALLENGE — $19 →
          </a>
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "10px",
            }}
          >
            One-time commitment fee. Zero refunds. That&apos;s the point.
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{ flex: 1, height: "1px", background: "var(--border)" }}
          />
          <span
            className="mono"
            style={{ fontSize: "10px", color: "var(--text-muted)" }}
          >
            ALREADY PAID?
          </span>
          <div
            style={{ flex: 1, height: "1px", background: "var(--border)" }}
          />
        </div>

        {/* Login */}
        <div style={{ width: "100%" }}>
          <LoginForm />
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 32px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          className="mono"
          style={{ fontSize: "10px", color: "var(--text-muted)" }}
        >
          75 HARD TRACKER
        </span>
        <span
          className="mono"
          style={{ fontSize: "10px", color: "var(--text-muted)" }}
        >
          NO EXCUSES. NO EXCEPTIONS.
        </span>
      </footer>
    </main>
  );
}
