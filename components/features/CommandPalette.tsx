// components/features/CommandPalette.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  LayoutDashboard, CheckSquare, Clock,
  FolderPlus, Plus, LogOut, Settings2,
  Search, ArrowRight, Lock, BarChart3, Sparkles,
} from "lucide-react"
import { useClerk } from "@clerk/nextjs"

type Props = {
  projects: { id: string; name: string; color: string }[]
  plan:     string
}

// Shared group heading classes
const GROUP_CLS =
  "[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold " +
  "[&_[cmdk-group-heading]]:text-[#333] [&_[cmdk-group-heading]]:uppercase " +
  "[&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:px-2 " +
  "[&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3"

// Base item classes
const ITEM_BASE =
  "group flex items-center gap-3 px-2 py-2 rounded-[10px] text-[13px] " +
  "cursor-pointer transition-all duration-100 " +
  "data-[selected=true]:bg-indigo-500/[0.09] " +
  "data-[selected=true]:border-indigo-500/20 " +
  "border border-transparent"

export function CommandPalette({ projects, plan }: Props) {
  const router            = useRouter()
  const [open, setOpen]   = useState(false)
  const [mounted, setMounted] = useState(false)
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

  // Entrance animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setTimeout(() => setMounted(true), 20))
    } else {
      setMounted(false)
    }
  }, [open])

  const isPro = plan === "pro" || plan === "enterprise"

  function runCommand(fn: () => void) {
    setOpen(false)
    setQuery("")
    fn()
  }

  if (!open) return null

  const navItems = [
    { label: "Dashboard",  icon: LayoutDashboard, href: "/dashboard",  pro: false },
    { label: "My Tasks",   icon: CheckSquare,     href: "/my-tasks",   pro: false },
    { label: "Activity",   icon: Clock,           href: "/activity",   pro: true  },
    { label: "Analytics",  icon: BarChart3,       href: "/analytics",  pro: true  },
    { label: "Settings",   icon: Settings2,       href: "/settings",   pro: false },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[13vh]">

      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default"
        onClick={() => setOpen(false)}
        aria-label="Close command palette"
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-[560px] mx-3 sm:mx-4"
        style={{
          opacity:   mounted ? 1 : 0,
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.97) translateY(-8px)",
          transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top glow */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent pointer-events-none" />

        <Command
          className="relative bg-[#0d0d0d] border border-white/[0.08] rounded-[18px] overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(99,102,241,0.06)" }}
        >

          {/* ── Search input ── */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded-[8px] bg-indigo-500/[0.12] border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Search size={13} className="text-indigo-400" />
            </div>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search commands, projects, navigate..."
              autoFocus
              className="flex-1 bg-transparent text-[13.5px] text-[#ddd] placeholder-[#333] outline-none font-medium"
            />
            <kbd className="text-[10px] font-medium text-[#333] bg-white/[0.04] border border-white/[0.07] rounded-[6px] px-2 py-1 shadow-[0_2px_0_0_rgba(0,0,0,0.4)] flex-shrink-0">
              ESC
            </kbd>
          </div>

          {/* ── List ── */}
          <Command.List className="max-h-[58vh] sm:max-h-[420px] overflow-y-auto p-2 pb-2.5">

            <Command.Empty className="py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <Search size={16} className="text-[#333]" />
              </div>
              <p className="text-[12.5px] text-[#444]">No results found</p>
              <p className="text-[11px] text-[#2a2a2a] mt-1">Try a different keyword</p>
            </Command.Empty>

            {/* ── Navigation ── */}
            <Command.Group heading="Navigation" className={GROUP_CLS}>
              {navItems.map((item) => {
                const locked = item.pro && !isPro
                return (
                  <Command.Item
                    key={item.href}
                    value={`go to ${item.label}`}
                    onSelect={() => runCommand(() => router.push(locked ? "/upgrade" : item.href))}
                    className={ITEM_BASE}
                  >
                    {/* Icon chip */}
                    <div
                      className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors
                        ${locked
                          ? "bg-white/[0.03] border border-white/[0.05]"
                          : "bg-white/[0.05] border border-white/[0.08] group-data-[selected=true]:bg-indigo-500/[0.15] group-data-[selected=true]:border-indigo-500/25"
                        }`}
                    >
                      <item.icon
                        size={13}
                        className={locked ? "text-[#333]" : "text-[#666] group-data-[selected=true]:text-indigo-400"}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`flex-1 font-medium transition-colors
                        ${locked
                          ? "text-[#3a3a3a]"
                          : "text-[#888] group-data-[selected=true]:text-white"
                        }`}
                    >
                      {item.label}
                    </span>

                    {/* Trailing */}
                    {locked ? (
                      <div className="flex items-center gap-1.5 bg-amber-500/[0.08] border border-amber-500/[0.15] rounded-full px-2 py-0.5">
                        <Lock size={9} className="text-amber-500/70" />
                        <span className="text-[10px] text-amber-500/70 font-semibold">Pro</span>
                      </div>
                    ) : (
                      <ArrowRight size={12} className="text-[#2a2a2a] group-data-[selected=true]:text-indigo-500 transition-colors" />
                    )}
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* ── Projects ── */}
            {projects.length > 0 && (
              <Command.Group heading="Projects" className={GROUP_CLS}>
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`project ${project.name}`}
                    onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                    className={ITEM_BASE}
                  >
                    {/* Color chip */}
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 border border-white/[0.06]"
                      style={{ background: `${project.color}18` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: project.color }}
                      />
                    </div>
                    <span className="flex-1 font-medium text-[#888] group-data-[selected=true]:text-white transition-colors">
                      {project.name}
                    </span>
                    <ArrowRight size={12} className="text-[#2a2a2a] group-data-[selected=true]:text-indigo-500 transition-colors" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* ── Actions ── */}
            <Command.Group heading="Actions" className={GROUP_CLS}>
              <Command.Item
                value="create new project"
                onSelect={() => runCommand(() => router.push("/dashboard?newProject=true"))}
                className={ITEM_BASE}
              >
                <div className="w-7 h-7 rounded-[8px] bg-violet-500/[0.08] border border-violet-500/[0.15] flex items-center justify-center flex-shrink-0">
                  <FolderPlus size={13} className="text-violet-400/70" />
                </div>
                <span className="flex-1 font-medium text-[#888] group-data-[selected=true]:text-white transition-colors">
                  Create new project
                </span>
                <ArrowRight size={12} className="text-[#2a2a2a] group-data-[selected=true]:text-indigo-500 transition-colors" />
              </Command.Item>

              <Command.Item
                value="create new task"
                onSelect={() => runCommand(() => router.push("/dashboard?newTask=true"))}
                className={ITEM_BASE}
              >
                <div className="w-7 h-7 rounded-[8px] bg-emerald-500/[0.08] border border-emerald-500/[0.15] flex items-center justify-center flex-shrink-0">
                  <Plus size={13} className="text-emerald-400/70" />
                </div>
                <span className="flex-1 font-medium text-[#888] group-data-[selected=true]:text-white transition-colors">
                  Create new task
                </span>
                <ArrowRight size={12} className="text-[#2a2a2a] group-data-[selected=true]:text-indigo-500 transition-colors" />
              </Command.Item>

              {!isPro && (
                <Command.Item
                  value="upgrade pro plan"
                  onSelect={() => runCommand(() => router.push("/upgrade"))}
                  className={ITEM_BASE}
                >
                  <div className="w-7 h-7 rounded-[8px] bg-amber-500/[0.08] border border-amber-500/[0.15] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={13} className="text-amber-400/80" />
                  </div>
                  <span className="flex-1 font-medium text-[#888] group-data-[selected=true]:text-white transition-colors">
                    Upgrade to Pro
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400/70 bg-amber-500/[0.08] border border-amber-500/[0.15] rounded-full px-2 py-0.5">
                    Unlock all
                  </span>
                </Command.Item>
              )}

              <Command.Item
                value="sign out logout"
                onSelect={() => runCommand(() => signOut({ redirectUrl: "/login" }))}
                className={`${ITEM_BASE} data-[selected=true]:bg-red-500/[0.08] data-[selected=true]:border-red-500/20`}
              >
                <div className="w-7 h-7 rounded-[8px] bg-red-500/[0.06] border border-red-500/[0.12] flex items-center justify-center flex-shrink-0">
                  <LogOut size={13} className="text-red-400/60" />
                </div>
                <span className="flex-1 font-medium text-[#666] group-data-[selected=true]:text-red-300 transition-colors">
                  Sign out
                </span>
              </Command.Item>
            </Command.Group>

          </Command.List>

          {/* ── Footer ── */}
          <div className="hidden sm:flex border-t border-white/[0.05] px-4 py-2.5 items-center gap-5 bg-white/[0.01]">
            <div className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span className="text-[11px] text-[#2e2e2e]">navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              <span className="text-[11px] text-[#2e2e2e]">open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd>ESC</Kbd>
              <span className="text-[11px] text-[#2e2e2e]">close</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span className="text-[11px] text-[#2e2e2e]">toggle</span>
            </div>
          </div>

        </Command>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 text-[10px] font-semibold text-[#333] bg-white/[0.03] border border-white/[0.07] rounded-[5px] shadow-[0_2px_0_0_rgba(0,0,0,0.5)]">
      {children}
    </kbd>
  )
}
