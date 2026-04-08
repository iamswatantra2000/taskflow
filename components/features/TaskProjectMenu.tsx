// components/features/TaskProjectMenu.tsx
"use client"

import { useState } from "react"
import { moveTaskToProject } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal, FolderKanban, Check } from "lucide-react"

type Project = {
  id:    string
  name:  string
  color: string
}

type Props = {
  taskId:           string
  currentProjectId: string
  projects:         Project[]
  onOpenChange?:    (open: boolean) => void
}

export function TaskProjectMenu({ taskId, currentProjectId, projects, onOpenChange }: Props) {
  const router              = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)

  function toggle(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  async function handleMove(projectId: string) {
    if (projectId === currentProjectId) {
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      await moveTaskToProject(taskId, projectId)
      const project = projects.find((p) => p.id === projectId)
      toast.success(`Moved to ${project?.name}`)
      router.refresh()
    } catch {
      toast.error("Failed to move task")
    } finally {
      setLoading(false)
      toggle(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          toggle(!open)
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] transition-all"
      >
        <MoreHorizontal size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 w-[200px] bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[10px] shadow-xl z-50 overflow-hidden">

          <div className="p-2 border-b border-slate-100 dark:border-[var(--tf-border)]">
            <p className="text-[10px] font-medium text-[var(--tf-text-tertiary)] uppercase tracking-wider px-2 py-1">
              Move to project
            </p>
          </div>

          <div className="p-1.5 max-h-[200px] overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  handleMove(project.id)
                }}
                disabled={loading}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] hover:bg-slate-50 dark:hover:bg-[var(--tf-bg-dropdown)] transition-colors text-left"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: project.color }}
                />
                <span className="text-[12px] text-[var(--tf-text-primary)] flex-1 truncate">
                  {project.name}
                </span>
                {project.id === currentProjectId && (
                  <Check size={11} className="text-indigo-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => toggle(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  )
}