/**
 * Motivational messages for key days of the challenge.
 * Research-backed days when people tend to quit.
 */
export interface Motivation {
    title: string;
    body: string;
}

const MESSAGES: Record<number, Motivation> = {
    1: { title: "Day 1.", body: "The hardest part was starting. You already did that." },
    3: { title: "Day 3 — the first dropout point.", body: "Most people quit before Day 3. You made it. Keep going." },
    7: { title: "One week.", body: "Your brain has started noticing the pattern. Don't break it now." },
    14: { title: "Two weeks.", body: "Willpower is unreliable. Habit is what you're building. It's forming." },
    21: { title: "Day 21.", body: "People used to believe 21 days built a habit. It doesn't — but it takes discipline to get here." },
    30: { title: "30 days.", body: "One month. Most New Year's resolutions are already dead. Not yours." },
    40: { title: "The second dropout point.", body: "Research shows Day 40 has the second highest quit rate. Today is not the day." },
    50: { title: "50 days in.", body: "Your discipline is compounding. The version of you at Day 1 wouldn't recognise this." },
    66: { title: "Day 66 — habit formed.", body: "Studies show this is when a behaviour becomes genuinely automatic. You're there." },
    75: { title: "Day 75 — the original protocol ends.", body: "You did it. Only a small percentage of people who start ever finish. You're one of them." },
    90: { title: "Day 90 — beyond the limit.", body: "You didn't just do the hard thing. You went further. This is who you are now." },
};

/** Returns a motivational message for a given day, or null if no special message. */
export function getMotivation(day: number): Motivation | null {
    return MESSAGES[day] ?? null;
}

/** Returns a milestone-based progress message for any day. */
export function getMilestoneLabel(day: number, total: number): string {
    const pct = Math.round((day / total) * 100);
    if (pct >= 100) return "Challenge complete.";
    if (pct >= 75) return `Final stretch — ${total - day} days left.`;
    if (pct >= 50) return `Over halfway — ${total - day} days remaining.`;
    if (pct >= 25) return `${pct}% in — ${total - day} days to go.`;
    return `${total - day} days remaining.`;
}
