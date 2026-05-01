import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {return "just now";}
  if (minutes < 60) {return `${minutes}m ago`;}
  if (hours < 24) {return `${hours}h ago`;}
  if (days === 1) {return "yesterday";}
  if (days < 7) {return `${days}d ago`;}
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PRIORITY_CONFIG = {
  high: { label: "High", color: "#dc2626", bg: "#fee2e2", dot: "bg-red-500" },
  medium: {
    label: "Medium",
    color: "#d97706",
    bg: "#fef3c7",
    dot: "bg-amber-500",
  },
  low: { label: "Low", color: "#0891b2", bg: "#cffafe", dot: "bg-cyan-500" },
};

export const STATUS_CONFIG = {
  "on-track": { label: "On Track", color: "#16a34a", bg: "#dcfce7" },
  "at-risk": { label: "At Risk", color: "#d97706", bg: "#fef3c7" },
  behind: { label: "Behind", color: "#dc2626", bg: "#fee2e2" },
  completed: { label: "Completed", color: "#5b4fff", bg: "#ede9ff" },
};

export const COLUMN_CONFIG = {
  todo: { label: "To Do", color: "#6b6966", bg: "#f2f1ee", count: 0 },
  inProgress: {
    label: "In Progress",
    color: "#d97706",
    bg: "#fef3c7",
    count: 0,
  },
  review: { label: "Review", color: "#0891b2", bg: "#cffafe", count: 0 },
  done: { label: "Done", color: "#16a34a", bg: "#dcfce7", count: 0 },
};

export const ANALYTICS_DATA = {
  taskCompletion: [
    { month: "Sep", completed: 32, created: 45 },
    { month: "Oct", completed: 48, created: 52 },
    { month: "Nov", completed: 41, created: 38 },
    { month: "Dec", completed: 55, created: 60 },
    { month: "Jan", completed: 67, created: 71 },
    { month: "Feb", completed: 58, created: 63 },
  ],
  teamActivity: [
    { day: "Mon", commits: 12, reviews: 8, comments: 24 },
    { day: "Tue", commits: 19, reviews: 12, comments: 31 },
    { day: "Wed", commits: 8, reviews: 15, comments: 18 },
    { day: "Thu", commits: 22, reviews: 10, comments: 42 },
    { day: "Fri", commits: 15, reviews: 18, comments: 27 },
    { day: "Sat", commits: 4, reviews: 2, comments: 8 },
    { day: "Sun", commits: 6, reviews: 3, comments: 11 },
  ],
  goalProgress: [
    { name: "Platform v2", value: 68, fill: "#5b4fff" },
    { name: "10K Users", value: 42, fill: "#e11d48" },
    { name: "Uptime SLA", value: 91, fill: "#16a34a" },
    { name: "Security", value: 25, fill: "#d97706" },
    { name: "Team Growth", value: 60, fill: "#0891b2" },
  ],
  memberContributions: [
    { name: "Alex", tasks: 18, goals: 4, announcements: 3 },
    { name: "Sarah", tasks: 22, goals: 2, announcements: 5 },
    { name: "Marcus", tasks: 15, goals: 2, announcements: 1 },
    { name: "Priya", tasks: 20, goals: 3, announcements: 2 },
    { name: "Tom", tasks: 10, goals: 1, announcements: 4 },
  ],
};
