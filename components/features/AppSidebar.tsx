// components/features/AppSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NewProjectDialog } from "./NewProjectDialog"
import { LogoMark } from "@/components/ui/LogoMark"
import {
  LayoutDashboard, ListChecks, Activity,
  Settings2, ChevronLeft, ChevronRight,
  Search, BarChart3, Menu, X, LogOut, Lock, Zap, Sparkles,
} from "lucide-react"
import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createPortal } from "react-dom"
import { useClerk, useUser } from "@clerk/nextjs"

type Project = {
  id:    string
  name:  string
  color: string
}

type AppSidebarProps = {
  user:     { name?: string | null; email?: string | null }
  projects: Project[]
  plan:     string
}

type NavItem = {
  href:     string
  label:    string
  icon:     React.ElementType
  pro?:     boolean
  proLabel?: string
}

const navItems: NavItem[] = [
  { href: "/dashboard",              label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard?tab=my-tasks", label: "My tasks",  icon: ListChecks      },
  { href: "/activity",               label: "Activity",  icon: Activity,  pro: true, proLabel: "Activity feed" },
  { href: "/analytics",              label: "Analytics", icon: BarChart3, pro: true, proLabel: "Analytics"    },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// Locked nav item — dimmed with portal tooltip to the right
function LockedNavItem({ label, icon: Icon, proLabel, collapsed }: {
  label:    string
  icon:     React.ElementType
  proLabel: string
  collapsed: boolean
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const hideRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  function clearHide() {
    if (hideRef.current) clearTimeout(hideRef.current)
  }

  function scheduleHide() {
    clearHide()
    hideRef.current = setTimeout(() => setPos(null), 150)
  }

  function handleMouseEnter() {
    clearHide()
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 })
    }
  }

  return (
    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={scheduleHide}>
      <div className="flex items-center gap-3 px-3 h-9 rounded-[8px] text-[13px] opacity-30 cursor-not-allowed select-none">
        <Icon size={16} className="flex-shrink-0" />
        {!collapsed && <span className="whitespace-nowrap font-medium">{label}</span>}
        {!collapsed && <Lock size={10} className="ml-auto flex-shrink-0" />}
      </div>

      {pos && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-auto"
          style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
          onMouseEnter={clearHide}
          onMouseLeave={scheduleHide}
        >
          <div className="bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[9px] px-3 py-2 flex items-center gap-2.5 whitespace-nowrap shadow-2xl shadow-black/20">
            <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Lock size={9} className="text-amber-400" />
            </div>
            <span className="text-[11.5px] text-[var(--tf-text-primary)] font-medium">{proLabel}</span>
            <span className="text-[11px] text-[var(--tf-text-tertiary)]">·</span>
            <a href="/upgrade" className="text-[11.5px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              <Zap size={9} />
              Upgrade
            </a>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 bg-[var(--tf-bg-dropdown)] border-l border-b border-[var(--tf-border)] rotate-45" />
        </div>,
        document.body
      )}
    </div>
  )
}

export function AppSidebar({ user, projects, plan }: AppSidebarProps) {
  const pathname                    = usePathname()
  const searchParams                = useSearchParams()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut }                 = useClerk()
  const { user: clerkUser }         = useUser()

  const isPro = plan === "pro" || plan === "enterprise"

  function isNavActive(href: string): boolean {
    if (href === "/dashboard?tab=my-tasks") {
      return pathname === "/dashboard" && searchParams.get("tab") === "my-tasks"
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard" && !searchParams.get("tab")
    }
    return pathname === href
  }

  function openCommandPalette() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Logo header ── */}
      <div className={cn(
        "flex items-center justify-between h-[50px] border-b border-[var(--tf-border-subtle)] flex-shrink-0",
        collapsed ? "px-3" : "px-4"
      )}>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <LogoMark height={20} className="flex-shrink-0" />
          {!collapsed && (
            <span
              className="whitespace-nowrap font-bricolage tracking-tight"
              style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              TaskFlow
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-6 h-6 rounded-[6px] border border-[var(--tf-border)] items-center justify-center text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)] hover:border-[var(--tf-border)] hover:bg-[var(--tf-bg-hover)] transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-6 h-6 rounded-[6px] border border-[var(--tf-border)] flex items-center justify-center text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-hover)] transition-all"
        >
          <X size={11} />
        </button>
      </div>

      {/* ── Main nav ── */}
      <nav className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5",
        collapsed ? "px-2" : "px-3"
      )}>

        {/* Primary nav items */}
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, pro, proLabel }) => {
            const isLocked  = pro && !isPro
            const isActive  = isNavActive(href)

            if (isLocked) {
              return (
                <LockedNavItem
                  key={href}
                  label={label}
                  icon={Icon}
                  proLabel={proLabel ?? label}
                  collapsed={collapsed}
                />
              )
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={cn(
                  "relative flex items-center gap-3 h-9 rounded-[8px] text-[13px] font-medium transition-all duration-150 overflow-hidden",
                  collapsed ? "px-0 justify-center" : "px-3",
                  isActive
                    ? ""
                    : "text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)]"
                )}
                style={isActive ? {
                  backgroundColor: "var(--tf-accent-muted)",
                  color:           "var(--tf-accent-text)",
                } : undefined}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                    style={{ backgroundColor: "var(--tf-accent)" }}
                  />
                )}
                <Icon
                  size={16}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "" : "text-[var(--tf-text-tertiary)]"
                  )}
                  style={isActive ? { color: "var(--tf-accent)" } : undefined}
                />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <div className="pt-1">
          {!collapsed ? (
            <button
              type="button"
              onClick={openCommandPalette}
              className="w-full flex items-center gap-3 h-9 px-3 rounded-[8px] text-[13px] font-medium text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)] transition-all group"
            >
              <Search size={16} className="flex-shrink-0 text-[var(--tf-text-tertiary)] group-hover:text-[var(--tf-text-secondary)] transition-colors" />
              <span className="flex-1 text-left">Search</span>
              <div className="flex items-center gap-0.5">
                <kbd className="text-[9px] font-medium border border-[var(--tf-border)] bg-[var(--tf-bg-hover)] rounded-[4px] px-1.5 py-0.5 text-[var(--tf-text-tertiary)]">⌘</kbd>
                <kbd className="text-[9px] font-medium border border-[var(--tf-border)] bg-[var(--tf-bg-hover)] rounded-[4px] px-1.5 py-0.5 text-[var(--tf-text-tertiary)]">K</kbd>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCommandPalette}
              title="Search (⌘K)"
              className="w-full flex items-center justify-center h-9 rounded-[8px] text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-[var(--tf-text-tertiary)] dark:hover:text-[#ccc] dark:hover:bg-[var(--tf-bg-hover)] transition-all"
            >
              <Search size={16} />
            </button>
          )}
        </div>

        {/* ── Projects ── */}
        <div className="pt-4">
          {!collapsed && (
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em]">
                Projects
              </span>
              <NewProjectDialog />
            </div>
          )}
          {collapsed && <div className="h-px bg-[var(--tf-border)] mb-2 mx-1" />}

          <div className="space-y-0.5">
            {projects.map((project) => {
              const isActive = pathname === `/projects/${project.id}`
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? project.name : undefined}
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-[8px] text-[13px] font-medium transition-all duration-150 overflow-hidden",
                    collapsed ? "px-0 justify-center" : "px-3",
                    isActive
                      ? "bg-[var(--tf-bg-hover)] text-[var(--tf-text-primary)]"
                      : "text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 rounded-[4px] transition-all",
                      collapsed ? "w-2 h-2 rounded-full" : "w-[18px] h-[18px]",
                      !collapsed && "flex items-center justify-center"
                    )}
                    style={{ background: collapsed ? project.color : `${project.color}22`, border: collapsed ? "none" : `1px solid ${project.color}55` }}
                  >
                    {!collapsed && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                    )}
                  </div>
                  {!collapsed && (
                    <span className="whitespace-nowrap truncate">{project.name}</span>
                  )}
                </Link>
              )
            })}

            {projects.length === 0 && !collapsed && (
              <p className="text-[11.5px] text-[var(--tf-text-tertiary)] px-3 py-2 italic">
                No projects yet
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className={cn(
        "flex-shrink-0 border-t border-[var(--tf-border-subtle)] pt-2 pb-2 space-y-0.5",
        collapsed ? "px-2" : "px-3"
      )}>
        {/* Upgrade CTA — free users only */}
        {!isPro && (
          <Link
            href="/upgrade"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 h-9 rounded-[8px] text-[13px] font-semibold transition-all border",
              collapsed ? "px-0 justify-center" : "px-3"
            )}
            style={{
              backgroundColor: "var(--tf-accent-muted)",
              borderColor:     "color-mix(in srgb, var(--tf-accent) 30%, transparent)",
              color:           "var(--tf-accent-text)",
            }}
            title={collapsed ? "Upgrade to Pro" : undefined}
          >
            <Sparkles size={15} className="flex-shrink-0" style={{ color: "var(--tf-accent)" }} />
            {!collapsed && <span>Upgrade to Pro</span>}
          </Link>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-3 h-9 rounded-[8px] text-[13px] font-medium transition-all text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)]",
            collapsed ? "px-0 justify-center" : "px-3",
            pathname === "/settings" && "bg-[var(--tf-bg-hover)] text-[var(--tf-text-primary)]"
          )}
        >
          <Settings2 size={16} className="flex-shrink-0 text-[var(--tf-text-tertiary)]" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User card */}
        <div className={cn(
          "flex items-center gap-3 rounded-[9px] bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)] hover:bg-[var(--tf-bg-hover)] hover:border-[var(--tf-border)] transition-all cursor-default",
          collapsed ? "p-1.5 justify-center" : "px-2.5 py-2"
        )}>
          <div className="relative flex-shrink-0">
            <Avatar className="h-7 w-7">
              <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 font-semibold">
                {getInitials(user.name ?? "User")}
              </AvatarFallback>
            </Avatar>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[var(--tf-bg-panel)]" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[12px] font-semibold text-[var(--tf-text-primary)] truncate leading-tight">
                  {user.name}
                </p>
                {isPro ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/[0.12] border border-indigo-500/20 px-1.5 py-px rounded-full flex-shrink-0">
                    Pro
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-[var(--tf-text-tertiary)] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] px-1.5 py-px rounded-full flex-shrink-0">
                    Free
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-[var(--tf-text-tertiary)] truncate leading-tight mt-px">
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Sign out — mobile only */}
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="md:hidden w-full flex items-center gap-3 h-9 px-3 rounded-[8px] text-[13px] font-medium text-[var(--tf-text-tertiary)] hover:bg-red-500/[0.08] hover:text-red-500 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="whitespace-nowrap">Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 w-8 h-8 rounded-[8px] border border-[var(--tf-border)] bg-[var(--tf-bg-card)] flex items-center justify-center text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] transition-colors"
      >
        <Menu size={15} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 h-full bg-[var(--tf-bg-panel)] border-r border-[var(--tf-border-subtle)] transition-transform duration-300 md:hidden w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-full bg-[var(--tf-bg-panel)] border-r border-[var(--tf-border-subtle)] transition-all duration-200 flex-shrink-0",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
