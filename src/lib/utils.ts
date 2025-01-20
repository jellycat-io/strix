import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(s: string) {
  if (s.length == 0) return;
  const chunks = s.split(" ");

  if (chunks.length === 1) {
    return chunks[0]?.charAt(0).toUpperCase();
  }

  return chunks.map((c) => c.charAt(0).toUpperCase()).join("");
}
