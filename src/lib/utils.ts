import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(s: string) {
  const chunks = s.split(" ");
  if (chunks.length < 2) return;

  return chunks.map((c) => c.charAt(0)).join("");
}
