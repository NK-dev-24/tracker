import { TASKS } from "./tasks";

export function getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD in local UTC
}

export function getLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getMidnightCountdown(): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
} {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // next midnight local time
    const diff = Math.max(0, midnight.getTime() - now.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds, totalSeconds };
}

export function isStreakBroken(lastCompletedDate: string | null): boolean {
    if (!lastCompletedDate) return false;
    const today = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    // broken if last completion was before yesterday
    return lastCompletedDate < yStr && lastCompletedDate !== today;
}

export function allTasksComplete(completedTasks: string[]): boolean {
    return TASKS.every((t) => completedTasks.includes(t.id));
}

export function getDayNumber(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}
