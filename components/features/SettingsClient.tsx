// components/features/SettingsClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  updateDisplayName,
  changePassword,
  updateWorkspaceName,
} from "@/lib/actions"
import {
  User, Building2, Palette,
  Bell, Sun, Moon, Monitor,
  Shield, Save, Loader2
} from "lucide-react"

type Props = {
  user: {
    id:    string
    name:  string
    email: string
  }
  workspace: {
    id:   string
    name: string
    slug: string
  }
  members: {
    id:       string
    name:     string
    email:    string
    role:     string
    joinedAt: Date
  }[]
}

const tabs = [
  { id: "profile",    label: "Profile",    icon: User      },
  { id: "workspace",  label: "Workspace",  icon: Building2 },
  { id: "appearance", label: "Appearance", icon: Palette   },
  { id: "notifications", label: "Notifications", icon: Bell },
]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ——— Profile Tab ———
function ProfileTab({ user }: { user: Props["user"] }) {
  const router                    = useRouter()
  const [name, setName]           = useState(user.name)
  const [savingName, setSavingName] = useState(false)

  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw]         = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [savingPw, setSavingPw]   = useState(false)

  async function handleSaveName() {
    if (name.trim() === user.name) return
    setSavingName(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      await updateDisplayName(fd)
      toast.success("Name updated!")
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name")
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword() {
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match")
      return
    }
    setSavingPw(true)
    try {
      const fd = new FormData()
      fd.set("currentPassword", currentPw)
      fd.set("newPassword", newPw)
      await changePassword(fd)
      toast.success("Password changed!")
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Avatar + name section */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold mb-4">Profile information</h3>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
              {getInitials(name || "User")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[13px] font-medium">{user.name}</p>
            <p className="text-[12px] text-muted-foreground">{user.email}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Avatar is generated from your initials
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-muted-foreground">
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-muted-foreground">
              Email address
            </label>
            <input
              value={user.email}
              disabled
              className="w-full bg-muted border border-border rounded-[8px] px-3 py-2 text-[13px] text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground/60">
              Email cannot be changed
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveName}
            disabled={savingName || name.trim() === user.name}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-[8px] transition-colors"
          >
            {savingName
              ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
              : <><Save size={12} /> Save changes</>
            }
          </button>
        </div>
      </div>

      {/* Password section */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold mb-4">Change password</h3>

        <div className="space-y-3 max-w-sm">
          {[
            { label: "Current password", value: currentPw, setValue: setCurrentPw },
            { label: "New password",     value: newPw,     setValue: setNewPw     },
            { label: "Confirm new",      value: confirmPw, setValue: setConfirmPw },
          ].map(({ label, value, setValue }) => (
            <div key={label} className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-muted-foreground">
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          ))}

          {confirmPw && (
            <p className={`text-[11px] ${newPw === confirmPw ? "text-emerald-400" : "text-red-400"}`}>
              {newPw === confirmPw ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || newPw !== confirmPw}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-[8px] transition-colors"
          >
            {savingPw
              ? <><Loader2 size={12} className="animate-spin" /> Changing...</>
              : <><Shield size={12} /> Change password</>
            }
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-red-900/50 rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold text-red-400 mb-1">
          Danger zone
        </h3>
        <p className="text-[12px] text-muted-foreground mb-4">
          Permanently delete your account and all associated data.
          This action cannot be undone.
        </p>
        <button
          type="button"
          className="px-4 py-2 text-[12px] font-medium border border-red-900 text-red-400 hover:bg-red-950 rounded-[8px] transition-colors"
          onClick={() => toast.error("Please contact support to delete your account")}
        >
          Delete account
        </button>
      </div>

    </div>
  )
}

// ——— Workspace Tab ———
function WorkspaceTab({
  workspace,
  members,
}: {
  workspace: Props["workspace"]
  members:   Props["members"]
}) {
  const [name, setName]       = useState(workspace.name)
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    if (name.trim() === workspace.name) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      await updateWorkspaceName(fd)
      toast.success("Workspace name updated!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const roleColors: Record<string, string> = {
    OWNER:  "bg-violet-950 text-violet-400 border-violet-900",
    ADMIN:  "bg-blue-950 text-blue-400 border-blue-900",
    MEMBER: "bg-[#1a1a1a] text-[#888] border-[#2a2a2a]",
  }

  return (
    <div className="space-y-6">

      {/* Workspace info */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold mb-4">Workspace settings</h3>

        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-muted-foreground">
              Workspace name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-muted-foreground">
              Workspace slug
            </label>
            <input
              value={workspace.slug}
              disabled
              className="w-full bg-muted border border-border rounded-[8px] px-3 py-2 text-[13px] text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground/60">
              Slug cannot be changed after creation
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || name.trim() === workspace.name}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-[8px] transition-colors"
          >
            {saving
              ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
              : <><Save size={12} /> Save changes</>
            }
          </button>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold">
            Members
            <span className="ml-2 text-[11px] text-muted-foreground font-normal">
              {members.length} total
            </span>
          </h3>
          <button
            type="button"
            className="text-[12px] text-muted-foreground border border-border px-3 py-1.5 rounded-[7px] hover:bg-accent transition-colors opacity-50 cursor-not-allowed"
            onClick={() => toast("Team invitations coming in Week 6!")}
          >
            + Invite member
          </button>
        </div>

        <div className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-[8px] hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[11px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
                  {getInitials(member.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{member.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[5px] border ${roleColors[member.role] ?? roleColors.MEMBER}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ——— Appearance Tab ———
function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: "dark",   label: "Dark",   icon: Moon,    desc: "Easy on the eyes"     },
    { id: "light",  label: "Light",  icon: Sun,     desc: "Clean and bright"     },
    { id: "system", label: "System", icon: Monitor, desc: "Follows your OS theme" },
  ]

  const accents = [
    { color: "#6366f1", label: "Indigo"  },
    { color: "#8b5cf6", label: "Violet"  },
    { color: "#ec4899", label: "Pink"    },
    { color: "#0ea5e9", label: "Sky"     },
    { color: "#10b981", label: "Emerald" },
    { color: "#f59e0b", label: "Amber"   },
  ]

  return (
    <div className="space-y-6">

      {/* Theme */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold mb-1">Theme</h3>
        <p className="text-[12px] text-muted-foreground mb-4">
          Choose how TaskFlow looks to you
        </p>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTheme(t.id)
                toast.success(`${t.label} mode enabled`)
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-[10px] border transition-all ${
                theme === t.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-border/80 hover:bg-accent"
              }`}
            >
              <t.icon size={20} className={theme === t.id ? "text-primary" : "text-muted-foreground"} />
              <div className="text-center">
                <p className={`text-[12px] font-medium ${theme === t.id ? "text-primary" : ""}`}>
                  {t.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
              {theme === t.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div className="bg-card border border-border rounded-[12px] p-6">
        <h3 className="text-[14px] font-semibold mb-1">Accent color</h3>
        <p className="text-[12px] text-muted-foreground mb-4">
          Personalize your TaskFlow experience
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {accents.map((a) => (
            <button
              key={a.color}
              type="button"
              onClick={() => toast(`${a.label} accent coming soon!`)}
              className="flex flex-col items-center gap-1.5 group"
              title={a.label}
            >
              <div
                className="w-8 h-8 rounded-full transition-transform group-hover:scale-110 ring-2 ring-transparent group-hover:ring-offset-2 group-hover:ring-offset-background"
                style={{
                  background: a.color
                }}
              />
              <span className="text-[10px] text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

// ——— Notifications Tab ———
function NotificationsTab() {
  const notifications = [
    { id: "task_assigned", label: "Task assigned to you",    desc: "When someone assigns a task to you"          },
    { id: "task_moved",    label: "Task status changed",     desc: "When your task is moved to a new column"     },
    { id: "due_date",      label: "Due date reminder",       desc: "24 hours before a task is due"               },
    { id: "new_member",    label: "New member joined",       desc: "When someone joins your workspace"           },
    { id: "comment",       label: "New comment on task",     desc: "When someone comments on your task"         },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-[12px] p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[14px] font-semibold">Notification preferences</h3>
          <span className="text-[11px] bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground mb-6">
          Choose what you want to be notified about. Requires email setup.
        </p>

        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between p-3 rounded-[8px] hover:bg-muted/50 transition-colors opacity-60"
            >
              <div>
                <p className="text-[13px] font-medium">{n.label}</p>
                <p className="text-[11px] text-muted-foreground">{n.desc}</p>
              </div>
              {/* Toggle pill — UI only */}
              <div className="w-9 h-5 bg-muted border border-border rounded-full relative cursor-not-allowed">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-muted-foreground/30" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 mt-4 pt-4 border-t border-border">
          Email notifications will be available when team invitations are enabled in Week 6.
        </p>
      </div>
    </div>
  )
}

// ——— Main SettingsClient ———
export function SettingsClient({ user, workspace, members }: Props) {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-border flex items-center px-5 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">Workspace /</span>
          <span className="text-[13px] font-medium">Settings</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[18px] font-semibold tracking-tight">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage your account, workspace and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "profile"       && <ProfileTab user={user} />}
        {activeTab === "workspace"     && <WorkspaceTab workspace={workspace} members={members} />}
        {activeTab === "appearance"    && <AppearanceTab />}
        {activeTab === "notifications" && <NotificationsTab />}

      </div>
    </div>
  )
}