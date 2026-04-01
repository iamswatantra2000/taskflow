// lib/onboarding-actions.ts
"use server"

import { db, users } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq } from "drizzle-orm"

export async function completeOnboarding() {
  const session = await requireAuth()
  await db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, session.user.id!))
}
