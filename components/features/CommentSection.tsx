// components/features/CommentSection.tsx
"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Send, Loader2, MessageSquare, CornerDownRight, Bold, Italic, Code, Strikethrough } from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getComments, createComment } from "@/lib/comment-actions"
import { MentionInput } from "./MentionInput"

type Member  = { id: string; name: string }
type Comment = {
  id: string; content: string; createdAt: Date
  parentId: string | null; userName: string; userId: string
}

type Props = {
  taskId:        string
  taskTitle:     string
  members:       Member[]
  currentUserId: string
}

// ── helpers ──────────────────────────────────────────────────────
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

// ── Markdown toolbar ─────────────────────────────────────────────
function MarkdownToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  function wrap(before: string, after: string) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end   = el.selectionEnd
    const sel   = el.value.slice(start, end) || "text"
    const newVal = el.value.slice(0, start) + before + sel + after + el.value.slice(end)
    // Trigger React synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set
    nativeInputValueSetter?.call(el, newVal)
    el.dispatchEvent(new Event("input", { bubbles: true }))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + sel.length)
    }, 0)
  }

  const btns = [
    { icon: Bold,          title: "Bold",          action: () => wrap("**", "**") },
    { icon: Italic,        title: "Italic",         action: () => wrap("*",  "*")  },
    { icon: Code,          title: "Inline code",    action: () => wrap("`",  "`")  },
    { icon: Strikethrough, title: "Strikethrough",  action: () => wrap("~~", "~~") },
  ]

  return (
    <div className="flex items-center gap-0.5 px-1 py-1 bg-white/[0.02] border border-white/[0.06] rounded-[8px] w-fit">
      {btns.map(({ icon: Icon, title, action }) => (
        <button
          key={title}
          type="button"
          title={title}
          onMouseDown={(e) => { e.preventDefault(); action() }}
          className="w-6 h-6 flex items-center justify-center rounded-[5px] text-[#444]
            hover:text-[#888] hover:bg-white/[0.06] transition-colors"
        >
          <Icon size={11} />
        </button>
      ))}
    </div>
  )
}

// ── Markdown renderer ─────────────────────────────────────────────
function MDContent({ content }: { content: string }) {
  // Highlight @mentions before markdown parse
  const withMentions = content.replace(
    /(@\w[\w ]*)/g,
    (m) => `<mention>${m}</mention>`
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p:      ({ children }) => <p className="text-[12.5px] text-[#555] leading-relaxed mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-[#888]">{children}</strong>,
        em:     ({ children }) => <em className="italic text-[#666]">{children}</em>,
        del:    ({ children }) => <del className="line-through text-[#444]">{children}</del>,
        code:   ({ children, className }) => {
          const isBlock = className?.includes("language-")
          return isBlock
            ? <code className="block bg-white/[0.04] border border-white/[0.08] rounded-[6px] px-3 py-2 text-[11.5px] text-indigo-300 font-mono my-1 overflow-x-auto">{children}</code>
            : <code className="bg-white/[0.06] border border-white/[0.08] rounded-[4px] px-1 py-0.5 text-[11.5px] text-indigo-300 font-mono">{children}</code>
        },
        a:      ({ children, href }) => <a href={href} className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300" target="_blank" rel="noopener noreferrer">{children}</a>,
        ul:     ({ children }) => <ul className="list-disc list-inside text-[12.5px] text-[#555] space-y-0.5 my-1">{children}</ul>,
        ol:     ({ children }) => <ol className="list-decimal list-inside text-[12.5px] text-[#555] space-y-0.5 my-1">{children}</ol>,
        li:     ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500/40 pl-3 my-1 text-[#444] italic">{children}</blockquote>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// Separate inline renderer that also highlights @mentions
function CommentContent({ content }: { content: string }) {
  // Split by @mention pattern
  const parts = content.split(/(@\w[\w ]*)/g)
  const processed = parts.map((part, i) =>
    part.startsWith("@")
      ? `[${part}](#)`
      : part
  ).join("")

  return <MDContent content={content} />
}

// ── Reply input ───────────────────────────────────────────────────
function ReplyInput({
  onSubmit, onCancel, members, pending,
}: {
  onSubmit:  (content: string, mentionedIds: string[]) => void
  onCancel:  () => void
  members:   Member[]
  pending:   boolean
}) {
  const [content, setContent]           = useState("")
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const textareaRef                     = useRef<HTMLTextAreaElement | null>(null)

  return (
    <div className="mt-2 ml-8 space-y-1.5">
      <div className="space-y-1">
        <MarkdownToolbar textareaRef={textareaRef} />
        <MentionInput
          value={content}
          onChange={(v, ids) => { setContent(v); setMentionedIds(ids) }}
          members={members}
          placeholder="Write a reply… supports **markdown**"
          rows={2}
          textareaRef={textareaRef}
          onSubmit={() => content.trim() && onSubmit(content, mentionedIds)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => content.trim() && onSubmit(content, mentionedIds)}
          disabled={!content.trim() || pending}
          className="flex items-center gap-1.5 h-6 px-2.5 text-[11px] font-semibold
            bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white
            border border-indigo-700/80 rounded-[7px] shadow-[0_2px_0_0_#3730a3]
            active:translate-y-[2px] active:shadow-none transition-all duration-100"
        >
          {pending ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
          Reply
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-6 px-2.5 text-[11px] text-[#444] hover:text-[#666] transition-colors"
        >
          Cancel
        </button>
        <span className="text-[10px] text-[#222] ml-auto">⌘↵ to post</span>
      </div>
    </div>
  )
}

// ── Single comment (with optional replies) ────────────────────────
function CommentThread({
  comment, replies, members, currentUserId, taskId, taskTitle,
  onRefresh, depth,
}: {
  comment:       Comment
  replies:       Comment[]
  members:       Member[]
  currentUserId: string
  taskId:        string
  taskTitle:     string
  onRefresh:     () => void
  depth:         number
}) {
  const [replyOpen, setReplyOpen]   = useState(false)
  const [pending, startTransition]  = useTransition()

  function submitReply(content: string, mentionedIds: string[]) {
    startTransition(async () => {
      try {
        await createComment(taskId, content, mentionedIds, taskTitle, comment.id)
        setReplyOpen(false)
        onRefresh()
      } catch {
        toast.error("Failed to post reply")
      }
    })
  }

  const isOwn = comment.userId === currentUserId

  return (
    <div>
      {/* Comment body */}
      <div className="flex gap-2.5 group">
        {/* Avatar */}
        <div className={`rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5
          ${depth === 0
            ? "w-7 h-7 from-indigo-500/60 to-violet-600/60"
            : "w-5 h-5 from-indigo-500/40 to-violet-600/40"
          }`}
        >
          <span className={`font-bold text-white ${depth === 0 ? "text-[9px]" : "text-[8px]"}`}>
            {getInitials(comment.userName)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-[#777]">
              {isOwn ? "You" : comment.userName}
            </span>
            <span className="text-[10px] text-[#2e2e2e]">{timeAgo(comment.createdAt)}</span>
            {depth === 0 && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1
                  text-[10.5px] text-[#333] hover:text-indigo-400 transition-all duration-150"
              >
                <CornerDownRight size={10} />
                Reply
              </button>
            )}
          </div>

          {/* Markdown content */}
          <div className="prose-sm">
            <CommentContent content={comment.content} />
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-9 mt-2 pl-3 border-l border-white/[0.06] space-y-2.5">
          {replies.map((r) => (
            <CommentThread
              key={r.id}
              comment={r}
              replies={[]}
              members={members}
              currentUserId={currentUserId}
              taskId={taskId}
              taskTitle={taskTitle}
              onRefresh={onRefresh}
              depth={1}
            />
          ))}
        </div>
      )}

      {/* Reply input */}
      {replyOpen && (
        <ReplyInput
          onSubmit={submitReply}
          onCancel={() => setReplyOpen(false)}
          members={members}
          pending={pending}
        />
      )}
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────
export function CommentSection({ taskId, taskTitle, members, currentUserId }: Props) {
  const [list, setList]                 = useState<Comment[]>([])
  const [content, setContent]           = useState("")
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [loading, setLoading]           = useState(true)
  const [pending, startTransition]      = useTransition()
  const [preview, setPreview]           = useState(false)
  const textareaRef                     = useRef<HTMLTextAreaElement | null>(null)

  const topLevel = list.filter((c) => !c.parentId)
  const replyMap = list.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = [...(acc[c.parentId] ?? []), c]
    }
    return acc
  }, {})
  const totalCount = list.length

  async function refresh() {
    const data = await getComments(taskId)
    setList(data as Comment[])
  }

  useEffect(() => {
    refresh().then(() => setLoading(false))
  }, [taskId])

  function handleSubmit() {
    if (!content.trim()) return
    const snap = content
    const ids  = mentionedIds
    setContent("")
    setMentionedIds([])
    setPreview(false)

    startTransition(async () => {
      try {
        await createComment(taskId, snap, ids, taskTitle)
        await refresh()
      } catch {
        toast.error("Failed to post comment")
        setContent(snap)
      }
    })
  }

  return (
    <div className="border-t border-white/[0.06] pt-4 mt-1 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className="text-[#444]" />
        <span className="text-[11px] font-semibold text-[#3a3a3a] uppercase tracking-[0.08em]">
          Comments{totalCount > 0 && ` · ${totalCount}`}
        </span>
      </div>

      {/* Thread list */}
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={11} className="animate-spin text-[#333]" />
          <span className="text-[12px] text-[#333]">Loading…</span>
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-[12px] text-[#2a2a2a]">No comments yet. Supports **markdown** and @mentions.</p>
      ) : (
        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-0.5">
          {topLevel.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              replies={replyMap[c.id] ?? []}
              members={members}
              currentUserId={currentUserId}
              taskId={taskId}
              taskTitle={taskTitle}
              onRefresh={refresh}
              depth={0}
            />
          ))}
        </div>
      )}

      {/* New comment input */}
      <div className="space-y-1.5">
        {/* Toolbar + preview toggle */}
        <div className="flex items-center justify-between">
          <MarkdownToolbar textareaRef={textareaRef} />
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={`text-[10.5px] font-medium px-2 py-0.5 rounded-[5px] transition-colors
              ${preview
                ? "text-indigo-400 bg-indigo-500/[0.1] border border-indigo-500/20"
                : "text-[#333] hover:text-[#555]"
              }`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="min-h-[60px] bg-[#0d0d0d] border border-white/[0.08] rounded-[10px] px-3 py-2.5">
            {content.trim()
              ? <MDContent content={content} />
              : <span className="text-[12px] text-[#2a2a2a]">Nothing to preview</span>
            }
          </div>
        ) : (
          <MentionInput
            value={content}
            onChange={(v, ids) => { setContent(v); setMentionedIds(ids) }}
            members={members}
            placeholder="Add a comment… supports **markdown** and @mentions"
            rows={2}
            textareaRef={textareaRef}
            onSubmit={handleSubmit}
          />
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10.5px] text-[#222]">
            **bold** · *italic* · `code` · ~~strike~~ · @mention
          </p>
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
