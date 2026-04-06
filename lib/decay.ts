/**
 * Task decay — surfaces tasks that haven't been touched in a while.
 * DONE and CANCELLED tasks are excluded (they're finished, not forgotten).
 */

export type DecayLevel = 0 | 1 | 2 | 3

const DAY = 86_400_000 // ms

export function getDecayLevel(updatedAt: Date | null | undefined, status: string): DecayLevel {
  if (!updatedAt || status === "DONE" || status === "CANCELLED") return 0
  const days = (Date.now() - new Date(updatedAt).getTime()) / DAY
  if (days >= 14) return 3
  if (days >= 7)  return 2
  if (days >= 3)  return 1
  return 0
}

export function getDecayDays(updatedAt: Date | null | undefined): number {
  if (!updatedAt) return 0
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / DAY)
}

/** Tailwind border class for each decay level (complete literals for Tailwind scanning) */
export const decayBorderClass: Record<DecayLevel, string> = {
  0: "",
  1: "border-amber-200 dark:border-amber-500/20",
  2: "border-amber-300 dark:border-amber-500/30",
  3: "border-orange-300 dark:border-orange-500/40",
}

/** Tailwind badge class for each decay level */
export const decayBadgeClass: Record<DecayLevel, string> = {
  0: "",
  1: "text-amber-500/80 bg-amber-50 border-amber-200/80 dark:text-amber-400/70 dark:bg-amber-500/[0.07] dark:border-amber-500/15",
  2: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/[0.10] dark:border-amber-500/20",
  3: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/[0.12] dark:border-orange-500/25",
}
