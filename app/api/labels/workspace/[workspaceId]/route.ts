// app/api/labels/workspace/[workspaceId]/route.ts
import { requireAuth } from "@/lib/session"
import { db, labels } from "@/lib/db"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  await requireAuth()
  const { workspaceId } = await params
  const rows = await db
    .select()
    .from(labels)
    .where(eq(labels.workspaceId, workspaceId))
    .orderBy(asc(labels.createdAt))
  return NextResponse.json({ labels: rows })
}
