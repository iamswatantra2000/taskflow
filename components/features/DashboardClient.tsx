// components/features/DashboardClient.tsx
"use client"

import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { BoardFilters, type FilterState } from "./BoardFilters"
import { TaskBoardWrapper } from "./TaskBoardWrapper"
import { NewTaskDialog } from "./NewTaskDialog"
import { SignOutButton } from "./SignOutButton"
import { ProfileDropdown } from "./ProfileDropdown"
import { toast } from "sonner"

type Task = {
  id:          string
  title:       string
  description: string | null
  status:      string
  priority:    string
  assigneeId:  string | null
  projectId:   string
  dueDate:     Date | null
}

type Column = {
  id:    string
  label: string
  tasks: Task[]
  dot:   string
}

type Project = {
  id:    string
  name:  string
  color: string
}

type Props = {
  columns:      Column[]
  userName:     string
  userInitials: string
  projectId:    string | null
  projects:     Project[]
  stats:        { label: string; value: number; sub: string; valueColor: string }[]
  firstName:    string
  user:         { name?: string | null; email?: string | null }
  workspaceId:  string
}

export function DashboardClient({
  columns,
  userName,
  userInitials,
  workspaceId,
  projectId,
  projects,
  stats,
  firstName,
  user,
}: Props) {
  const [filters, setFilters] = useState<FilterState>({
    priority: [],
    search:   "",
  })

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-border flex items-center justify-between px-5 flex-shrink-0 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">Workspace /</span>
          <span className="text-[13px] font-medium text-foreground">Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <SignOutButton />

          {/* Search / Command palette trigger */}
          <button
            type="button"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
              )
            }}
            className="hidden md:flex items-center gap-2 h-7 px-3 text-[12px] text-muted-foreground border border-border rounded-[7px] hover:border-border/80 hover:text-foreground transition-colors"
          >
            <Search size={12} />
            <span>Search</span>
            <kbd className="text-[10px] border border-border rounded px-1 ml-1">⌘K</kbd>
          </button>

          <BoardFilters onFilterChange={setFilters} />

          {projectId && (
            <>
              <NewTaskDialog projectId={projectId}>
                <div className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md cursor-pointer flex items-center font-medium transition-colors">
                  + New task
                </div>
              </NewTaskDialog>

              <button
                type="button"
                onClick={() => toast("AI task generator coming soon! 🤖", {
                  description: "We're adding Anthropic API credits. Stay tuned!",
                })}
                className="h-7 px-3 text-xs bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-900 rounded-md cursor-pointer flex items-center gap-1.5 font-medium transition-colors"
              >
                <Sparkles size={12} />
                AI tasks
              </button>
            </>
          )}

          <ProfileDropdown user={user} />
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-[18px] font-semibold text-foreground tracking-tight">
            Good day, {firstName}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Here what happening across your projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-[10px] p-4 hover:border-border/80 transition-colors"
            >
              <p className="text-[11px] font-medium text-muted-foreground mb-2">
                {stat.label}
              </p>
              <p className={`text-[26px] font-semibold tracking-tight leading-none ${stat.valueColor}`}>
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Board */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium text-foreground">Task board</h2>
          </div>
          <TaskBoardWrapper
            columns={columns}
            userName={userName}
            filters={filters}
            projects={projects}
            workspaceId={workspaceId}
          />
        </div>

      </div>
    </div>
  )
}