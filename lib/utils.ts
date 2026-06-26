import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function formatDisplayName(username: string): string {
  if (!username) return "";
  const mappings: Record<string, string> = {
    "atoro": "Andrés",
    "colaborador": "Colaborador",
  };
  const key = username.toLowerCase();
  if (mappings[key]) {
    return mappings[key];
  }
  // Remove email domain if it exists
  const cleanName = username.split("@")[0];
  // Capitalize first letter of each word
  return cleanName
    .split(/[\s._-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

