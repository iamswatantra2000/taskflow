// components/features/AppSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NewProjectDialog } from "./NewProjectDialog"
import {
  LayoutDashboard, CheckSquare, Clock,
  Settings, ChevronLeft, ChevronRight, Search,
} from "lucide-react"
import { useState } from "react"

type Project = {
  id:    string
  name:  string
  color: string
}

type AppSidebarProps = {
  user:     { name?: string | null; email?: string | null }
  projects: Project[]
}

const navItems = [
  { href: "/",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-tasks", label: "My tasks",  icon: CheckSquare     },
  { href: "/activity", label: "Activity",  icon: Clock           },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function AppSidebar({ user, projects }: AppSidebarProps) {
  const pathname                    = usePathname()
  const [collapsed, setCollapsed]   = useState(false)

  function openCommandPalette() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  return (
    <aside className={cn(
      "relative flex flex-col h-full bg-card border-r border-border transition-all duration-200 flex-shrink-0",
      collapsed ? "w-[52px]" : "w-[220px]"
    )}>

      {/* Logo */}
      <div className="flex items-center justify-between h-[50px] px-3 border-b border-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">T</span>
          </div>
          {!collapsed && (
            <span className="text-[13px] font-semibold whitespace-nowrap">TaskFlow</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-[22px] h-[22px] rounded-[5px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">

        {/* Nav items */}
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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
        ))}

        {/* Search / Command palette trigger */}
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

        {/* Collapsed search icon */}
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

        {/* Projects section */}
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
          className="flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] text-[12.5px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all overflow-hidden"
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={15} className="flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Settings</span>}
        </Link>

        <div className="flex items-center gap-2.5 px-2 py-[7px] rounded-[7px] hover:bg-accent cursor-pointer overflow-hidden">
          <Avatar className="h-[26px] w-[26px] flex-shrink-0">
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
      </div>

    </aside>
  )
}