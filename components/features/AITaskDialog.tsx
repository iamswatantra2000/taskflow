// components/features/AITaskDialog.tsx
"use client"

import { useState, useRef } from "react"
import { generateSubtasks } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"

type Props = {
  projectId: string
}

export function AITaskDialog({ projectId }: Props) {
  const router              = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [preview, setPreview] = useState<{
    title: string
    priority: string
    description: string
  }[]>([])

  async function handleGenerate() {
    if (!description.trim()) return
    setLoading(true)
    setPreview([])

    try {
      const created = await generateSubtasks(description, projectId)
      toast.success(`Created ${created.length} tasks with AI!`)
      setOpen(false)
      setDescription("")
      setPreview([])
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed")
    } finally {
      setLoading(false)
    }
  }

  const priorityColors: Record<string, string> = {
    LOW:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
    HIGH:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
    URGENT: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-md cursor-pointer flex items-center gap-1.5 font-medium transition-colors">
          <Sparkles size={12} />
          AI tasks
        </div>
      </DialogTrigger>

      <DialogContent className="bg-[var(--tf-bg-card)] border-slate-200 dark:border-[var(--tf-border)] text-[var(--tf-text-primary)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-[var(--tf-text-primary)] flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            AI task generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Description input */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[var(--tf-text-secondary)]">
              Describe a feature or goal
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Build a user authentication system with login, register, and password reset"
              rows={3}
              className="w-full bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--tf-text-primary)] placeholder-slate-300 dark:placeholder-[#444] outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
            />
            <p className="text-[11px] text-[var(--tf-text-tertiary)]">
              AI will break this into 3-6 actionable subtasks automatically
            </p>
          </div>

          {/* Example prompts */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-[var(--tf-text-tertiary)]">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Build a REST API for products",
                "Set up CI/CD pipeline",
                "Design onboarding flow",
                "Add dark mode support",
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDescription(example)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-violet-500 hover:text-violet-400 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-slate-400 dark:text-[var(--tf-text-secondary)] hover:text-slate-600 dark:hover:text-[#999] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-[8px] transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Generate tasks
                </>
              )}
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}