// components/features/CommentSection.tsx
"use client"

import { useState, useEffect, useTransition } from "react"
import { Send, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { getComments, createComment } from "@/lib/comment-actions"
import { MentionInput } from "./MentionInput"

type Member  = { id: string; name: string }
type Comment = { id: string; content: string; createdAt: Date; userName: string; userId: string }

type Props = {
  taskId:        string
  taskTitle:     string
  members:       Member[]
  currentUserId: string
}

function renderContent(content: string) {
  const parts = content.split(/(@\w[\w ]*)/g)
  return parts.map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="text-indigo-400 font-semibold bg-indigo-500/[0.08] rounded px-0.5">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)    return "just now"
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function CommentSection({ taskId, taskTitle, members, currentUserId }: Props) {
  const [list, setList]               = useState<Comment[]>([])
  const [content, setContent]         = useState("")
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [loading, setLoading]         = useState(true)
  const [pending, startTransition]    = useTransition()

  useEffect(() => {
    getComments(taskId).then((data) => {
      setList(data as Comment[])
      setLoading(false)
    })
  }, [taskId])

  function handleChange(val: string, ids: string[]) {
    setContent(val)
    setMentionedIds(ids)
  }

  function handleSubmit() {
    if (!content.trim()) return
    const snap = content
    const ids  = mentionedIds
    setContent("")
    setMentionedIds([])

    startTransition(async () => {
      try {
        await createComment(taskId, snap, ids, taskTitle)
        setList(await getComments(taskId) as Comment[])
      } catch {
        toast.error("Failed to post comment")
        setContent(snap)
      }
    })
  }

  return (
    <div className="border-t border-white/[0.06] pt-4 mt-1 space-y-3">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className="text-[#444]" />
        <span className="text-[11px] font-semibold text-[#3a3a3a] uppercase tracking-[0.08em]">
          Comments{list.length > 0 && ` · ${list.length}`}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 size={11} className="animate-spin text-[#333]" />
          <span className="text-[12px] text-[#333]">Loading…</span>
        </div>
      ) : list.length === 0 ? (
        <p className="text-[12px] text-[#2e2e2e]">No comments yet. Type @ to mention someone.</p>
      ) : (
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-0.5">
          {list.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/50 to-violet-600/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-white">{getInitials(c.userName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[11.5px] font-semibold text-[#777]">
                    {c.userId === currentUserId ? "You" : c.userName}
                  </span>
                  <span className="text-[10px] text-[#333]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-[12.5px] text-[#555] leading-relaxed break-words">
                  {renderContent(c.content)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <MentionInput
          value={content}
          onChange={handleChange}
          members={members}
          placeholder="Add a comment… type @ to mention"
          rows={2}
          onSubmit={handleSubmit}
        />
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] text-[#2a2a2a]">⌘↵ to post</p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || pending}
            className="flex items-center gap-1.5 h-7 px-3 text-[11.5px] font-semibold
              bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
              text-white border border-indigo-700/80 rounded-[8px]
              shadow-[0_2px_0_0_#3730a3] active:translate-y-[2px] active:shadow-none
              transition-all duration-100"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
