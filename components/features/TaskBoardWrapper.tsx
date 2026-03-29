// components/features/TaskBoardWrapper.tsx
"use client"

import dynamic from "next/dynamic"
import type { FilterState } from "./BoardFilters"

const TaskBoard = dynamic(
  () => import("@/components/features/TaskBoard").then((m) => m.TaskBoard),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-4 gap-3">
        {["Todo", "In progress", "In review", "Done"].map((col) => (
          <div
            key={col}
            className="bg-[#111] border border-[#1a1a1a] rounded-[10px] p-3 min-h-[200px] animate-pulse"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-[7px] h-[7px] rounded-full bg-[#2a2a2a]" />
              <div className="h-3 w-16 bg-[#1f1f1f] rounded" />
            </div>
          </div>
        ))}
      </div>
    ),
  }
)

type Column = {
  id:    string
  label: string
  tasks: {
    id:          string
    title:       string
    description: string | null
    status:      string
    priority:    string
    assigneeId:  string | null
    projectId:   string   // ← add this
  }[]
  dot: string
}

type Props = {
  columns:     Column[]
  userName:    string
  filters:     FilterState
  workspaceId: string
  projects:    { id: string; name: string; color: string }[]
}

export function TaskBoardWrapper({
  columns,
  userName,
  filters,
  workspaceId,
  projects,
}: Props) {
  const boardKey = columns.map((c) => `${c.id}:${c.tasks.length}`).join(",")

  return (
    <TaskBoard
      key={boardKey}
      columns={columns}
      userName={userName}
      filters={filters}
      workspaceId={workspaceId}
      projects={projects}
    />
  )
}