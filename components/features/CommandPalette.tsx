// components/features/CommandPalette.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  LayoutDashboard, CheckSquare, Clock,
  FolderPlus, Plus, LogOut, Settings,
  Search, ArrowRight, Lock, BarChart3,
} from "lucide-react"
import { useClerk } from "@clerk/nextjs"

type Props = {
  projects: { id: string; name: string; color: string }[]
  plan:     string
}

export function CommandPalette({ projects, plan }: Props) {
  const router            = useRouter()
  const [open, setOpen]   = useState(false)
  const { signOut }       = useClerk()
  const [query, setQuery] = useState("")

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const isPro = plan === "pro" || plan === "enterprise"

  function runCommand(fn: () => void) {
    setOpen(false)
    setQuery("")
    fn()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">

      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={() => setOpen(false)}
        aria-label="Close command palette"
      />

      {/* Palette */}
      <div className="relative w-full max-w-[560px] mx-3 sm:mx-4">
        <Command className="bg-[#161616] border border-[#2a2a2a] rounded-[14px] shadow-2xl overflow-hidden">

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#222]">
            <Search size={15} className="text-[#555] flex-shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search commands, tasks, projects..."
              autoFocus
              className="flex-1 bg-transparent text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none"
            />
            <kbd className="text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto p-2">

            <Command.Empty className="text-center text-[13px] text-[#555] py-8">
              No results found
            </Command.Empty>

            {/* Navigation */}
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#444] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {[
                { label: "Go to Dashboard", icon: LayoutDashboard, href: "/dashboard",  pro: false },
                { label: "Go to My Tasks",  icon: CheckSquare,     href: "/my-tasks",   pro: false },
                { label: "Go to Activity",  icon: Clock,           href: "/activity",   pro: true  },
                { label: "Go to Analytics", icon: BarChart3,       href: "/analytics",  pro: true  },
                { label: "Go to Settings",  icon: Settings,        href: "/settings",   pro: false },
              ].map((item) => {
                const locked = item.pro && !isPro
                return (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => runCommand(() => router.push(locked ? "/upgrade" : item.href))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] cursor-pointer transition-colors data-[selected=true]:bg-[#1f1f1f] data-[selected=true]:text-[#e0e0e0] text-[#999]"
                  >
                    <item.icon size={14} className={`flex-shrink-0 ${locked ? "text-[#444]" : ""}`} />
                    <span className={`flex-1 ${locked ? "text-[#555]" : ""}`}>{item.label}</span>
                    {locked ? (
                      <div className="flex items-center gap-1.5">
                        <Lock size={10} className="text-amber-500/70" />
                        <span className="text-[10px] text-amber-500/60 font-medium">Pro</span>
                      </div>
                    ) : (
                      <ArrowRight size={12} className="text-[#444]" />
                    )}
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Projects */}
            {projects.length > 0 && (
              <Command.Group
                heading="Projects"
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#444] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-1"
              >
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`project ${project.name}`}
                    onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] text-[#999] cursor-pointer data-[selected=true]:bg-[#1f1f1f] data-[selected=true]:text-[#e0e0e0] transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: project.color }}
                    />
                    <span className="flex-1">{project.name}</span>
                    <ArrowRight size={12} className="text-[#444]" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Actions */}
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#444] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-1"
            >
              <Command.Item
                value="create new project"
                onSelect={() => runCommand(() => router.push("/dashboard?newProject=true"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] text-[#999] cursor-pointer data-[selected=true]:bg-[#1f1f1f] data-[selected=true]:text-[#e0e0e0] transition-colors"
              >
                <FolderPlus size={14} className="flex-shrink-0" />
                <span className="flex-1">Create new project</span>
              </Command.Item>

              <Command.Item
                value="create new task"
                onSelect={() => runCommand(() => router.push("/dashboard?newTask=true"))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] text-[#999] cursor-pointer data-[selected=true]:bg-[#1f1f1f] data-[selected=true]:text-[#e0e0e0] transition-colors"
              >
                <Plus size={14} className="flex-shrink-0" />
                <span className="flex-1">Create new task</span>
              </Command.Item>

              <Command.Item
                value="sign out logout"
                onSelect={() => runCommand(() => signOut({ redirectUrl: "/login" }))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] text-red-400 cursor-pointer data-[selected=true]:bg-red-950/50 transition-colors"
              >
                <LogOut size={14} className="flex-shrink-0" />
                <span className="flex-1">Sign out</span>
              </Command.Item>
            </Command.Group>

          </Command.List>

          {/* Footer hints */}
          <div className="hidden sm:flex border-t border-[#222] px-4 py-2 items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5">↑</kbd>
              <kbd className="text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5">↓</kbd>
              <span className="text-[11px] text-[#444]">navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5">↵</kbd>
              <span className="text-[11px] text-[#444]">select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] text-[#444] border border-[#2a2a2a] rounded px-1.5 py-0.5">ESC</kbd>
              <span className="text-[11px] text-[#444]">close</span>
            </div>
          </div>

        </Command>
      </div>
    </div>
  )
}