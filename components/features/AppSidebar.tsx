// components/features/AppSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NewProjectDialog } from "./NewProjectDialog"
import { LogoMark } from "@/components/ui/LogoMark"
import {
  LayoutDashboard, CheckSquare, Clock,
  Settings, ChevronLeft, ChevronRight,
  Search, BarChart2, Menu, X, LogOut, Lock
} from "lucide-react"
import { useState } from "react"
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
  href:  string
  label: string
  icon:  React.ElementType
  pro?:  boolean
  proLabel?: string
}

const navItems: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-tasks",   label: "My tasks",  icon: CheckSquare     },
  { href: "/activity",   label: "Activity",  icon: Clock,    pro: true, proLabel: "Activity feed" },
  { href: "/analytics",  label: "Analytics", icon: BarChart2, pro: true, proLabel: "Analytics"    },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// A locked nav item: greyed out, not navigable, shows upgrade tooltip on the right
function LockedNavItem({ label, icon: Icon, proLabel, collapsed }: {
  label: string
  icon: React.ElementType
  proLabel: string
  collapsed: boolean
}) {
  return (
    <div className="relative group/locked">
      {/* The item itself — dimmed, not clickable */}
      <div className="flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] opacity-40 cursor-not-allowed select-none overflow-hidden">
        <Icon size={15} className="flex-shrink-0" />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
        {!collapsed && <Lock size={9} className="ml-auto flex-shrink-0 text-muted-foreground" />}
      </div>

      {/* Tooltip — appears to the right of the sidebar item */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[200] pointer-events-none
        opacity-0 group-hover/locked:opacity-100 transition-opacity duration-150">
        <div className="bg-[#1c1c1c] border border-white/10 rounded-[8px] px-3 py-1.5 flex items-center gap-2 whitespace-nowrap shadow-xl">
          <Lock size={9} className="text-amber-400 flex-shrink-0" />
          <span className="text-[11px] text-[#ccc]">{proLabel} · Pro</span>
          <a href="/#pricing" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
            Upgrade →
          </a>
        </div>
        {/* Left arrow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1c1c1c] border-l border-b border-white/10 rotate-45" />
      </div>
    </div>
  )
}

export function AppSidebar({ user, projects, plan }: AppSidebarProps) {
  const pathname                    = usePathname()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut }                 = useClerk()
  const { user: clerkUser }         = useUser()

  const isPro = plan === "pro" || plan === "enterprise"

  function openCommandPalette() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-[50px] px-3 border-b border-border">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 min-w-0"
        >
          <LogoMark height={22} className="flex-shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap font-bricolage" style={{ fontSize: 13, fontWeight: 900 }}>TaskFlow</span>
          )}
        </Link>
        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-[22px] h-[22px] rounded-[5px] border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-[22px] h-[22px] rounded-[5px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={11} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ href, label, icon: Icon, pro, proLabel }) => {
          const isLocked = pro && !isPro

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
              className={cn(
                "flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] transition-all overflow-hidden",
                pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}

        {/* Search */}
        {!collapsed && (
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full flex items-center justify-between px-2 py-[7px] rounded-[7px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Search size={15} className="flex-shrink-0" />
              <span className="text-[12.5px]">Search</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="text-[10px] border border-border rounded px-1 py-0.5">⌘</kbd>
              <kbd className="text-[10px] border border-border rounded px-1 py-0.5">K</kbd>
            </div>
          </button>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full flex items-center justify-center px-2 py-[7px] rounded-[7px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Search (⌘K)"
          >
            <Search size={15} />
          </button>
        )}

        {/* Projects */}
        <div className="pt-3">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Projects
              </span>
              <NewProjectDialog />
            </div>
          )}

          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] transition-all overflow-hidden",
                pathname === `/projects/${project.id}`
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={collapsed ? project.name : undefined}
            >
              <div
                className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                style={{ background: project.color }}
              />
              {!collapsed && (
                <span className="whitespace-nowrap truncate">{project.name}</span>
              )}
            </Link>
          ))}

          {projects.length === 0 && !collapsed && (
            <p className="text-[11px] text-muted-foreground px-2 py-2">
              No projects yet
            </p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-0.5">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all overflow-hidden"
        >
          <Settings size={15} className="flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Settings</span>}
        </Link>

        <div className="flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] hover:bg-accent cursor-pointer overflow-hidden">
          <Avatar className="h-[26px] w-[26px] flex-shrink-0">
            <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
              {getInitials(user.name ?? "User")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[12px] font-medium truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.email}</p>
            </div>
          )}
        </div>

        {/* Sign out — mobile only (desktop uses topbar ProfileDropdown) */}
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="md:hidden w-full flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] text-muted-foreground hover:bg-red-950/40 hover:text-red-400 transition-all"
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span className="whitespace-nowrap">Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button — shown in topbar */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 w-8 h-8 rounded-[7px] border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={15} />
      </button>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col h-full bg-card border-r border-border transition-transform duration-300 md:hidden w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-full bg-card border-r border-border transition-all duration-200 flex-shrink-0",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
