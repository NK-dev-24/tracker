export interface Task {
    id: string;
    label: string;
    description: string;
}

export const TASKS: Task[] = [
    {
        id: "workout-1",
        label: "WORKOUT #1",
        description: "45 min workout (weights, HIIT, or sport)",
    },
    {
        id: "workout-2",
        label: "OUTDOOR WALK",
        description: "45 min walk outside — no excuses",
    },
    {
        id: "diet",
        label: "CLEAN DIET",
        description: "Zero cheat meals. Follow your nutrition plan",
    },
    {
        id: "water",
        label: "GALLON OF WATER",
        description: "Drink 1 full gallon (~3.8L) of water",
    },
    {
        id: "read",
        label: "READ 10 PAGES",
        description: "10 pages of a non-fiction, self-improvement book",
    },
    {
        id: "progress-photo",
        label: "PROGRESS PHOTO",
        description: "Take your daily progress photo",
    },
];

export const TOTAL_DAYS = 75;
