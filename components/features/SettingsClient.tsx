// components/features/SettingsClient.tsx
"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateDisplayName, updateWorkspaceName } from "@/lib/actions"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  User, Building2, Palette, Bell, Sun, Moon,
  Save, Loader2, Camera, Zap, CheckCircle, Shield,
  Trash2, Users, Check, Mail, AlertTriangle, Sparkles,
  Clock, MessageSquare, UserPlus, ArrowUpRight,
} from "lucide-react"
import { InviteModal } from "./InviteModal"
import { saveNotificationPreferences, type NotifPrefs } from "@/lib/notification-prefs-actions"
import { ThemePicker } from "./ThemePicker"
import { useStyleTheme } from "@/context/ThemeStyleContext"

type Invitation = {
  id: string; email: string; role: string
  status: string; createdAt: Date; expiresAt: Date
}

type Props = {
  user:           { id: string; name: string; email: string; plan: string }
  workspace:      { id: string; name: string; slug: string }
  members:        { id: string; name: string; email: string; role: string; joinedAt: Date }[]
  userRole:       string
  pendingInvites: Invitation[]
  notifPrefs:     NotifPrefs
}

const tabs = [
  { id: "profile",       label: "Profile",       icon: User,      color: "indigo" },
  { id: "workspace",     label: "Workspace",     icon: Building2, color: "violet" },
  { id: "appearance",   label: "Appearance",    icon: Palette,   color: "sky"    },
  { id: "notifications", label: "Notifications", icon: Bell,      color: "amber"  },
]

const TAB_COLORS: Record<string, { active: string; icon: string }> = {
  indigo: { active: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/[0.1] dark:text-indigo-300 dark:border-indigo-500/25", icon: "bg-indigo-500/[0.12] text-indigo-400" },
  violet: { active: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/[0.1] dark:text-violet-300 dark:border-violet-500/25", icon: "bg-violet-500/[0.12] text-violet-400" },
  sky:    { active: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/[0.1] dark:text-sky-300 dark:border-sky-500/25",    icon: "bg-sky-500/[0.12]    text-sky-400"    },
  amber:  { active: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/[0.1] dark:text-amber-300 dark:border-amber-500/25",  icon: "bg-amber-500/[0.12]  text-amber-400"  },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ── Shared card wrapper ──
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)] rounded-[16px] p-6
      hover:border-[var(--tf-border)] hover:-translate-y-[1px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]
      transition-all duration-200 ${className}`}>
      {children}
    </div>
  )
}

// ── Section heading with icon chip ──
function SectionHead({
  icon: Icon, title, subtitle, iconBg = "bg-indigo-500/[0.1]", iconColor = "text-indigo-400", right,
}: {
  icon: React.ElementType; title: string; subtitle?: string
  iconBg?: string; iconColor?: string; right?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-[9px] ${iconBg} border border-[var(--tf-border)] flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} className={iconColor} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-[var(--tf-text-primary)] tracking-tight leading-none">{title}</h3>
          {subtitle && <p className="text-[11.5px] text-[var(--tf-text-tertiary)] mt-1">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

// ── Labelled input ──
function Field({
  label, value, onChange, disabled, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void
  disabled?: boolean; hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">{label}</p>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className={`w-full rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none transition-all duration-150 border
          ${disabled
            ? "bg-[var(--tf-bg-panel)] border-[var(--tf-border-subtle)] text-[var(--tf-text-tertiary)] cursor-not-allowed"
            : "bg-[var(--tf-bg-input)] border-[var(--tf-border)] text-[var(--tf-text-primary)] placeholder-[var(--tf-text-tertiary)] " +
              "hover:border-[var(--tf-border)] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/[0.1]"
          }`}
      />
      {hint && <p className="text-[11px] text-[var(--tf-text-tertiary)]">{hint}</p>}
    </div>
  )
}

// ── Save button ──
function SaveBtn({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 h-9 px-5 text-[12.5px] font-semibold
        bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 disabled:cursor-not-allowed
        text-white border border-indigo-700/80 rounded-[10px]
        shadow-[0_4px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none
        transition-all duration-100"
    >
      {loading
        ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
        : <><Save size={13} /> Save changes</>
      }
    </button>
  )
}

// ══════════════════════════════
// ── Plan card ──
// ══════════════════════════════
const PLAN_META: Record<string, {
  label: string; badge: string; badgeBg: string; border: string
  glow: string; cardBg: string; features: string[]
  PlanIcon: React.ElementType
}> = {
  free: {
    label:    "Free",
    badge:    "text-[var(--tf-text-tertiary)]",
    badgeBg:  "bg-[var(--tf-bg-hover)] border-[var(--tf-border)]",
    border:   "border-[var(--tf-border)]",
    glow:     "rgba(255,255,255,0.015)",
    cardBg:   "bg-[var(--tf-bg-panel)]",
    features: ["Up to 3 projects", "Unlimited tasks", "Kanban board", "Basic search & filters"],
    PlanIcon: Zap,
  },
  pro: {
    label:    "Pro",
    badge:    "text-indigo-300",
    badgeBg:  "bg-indigo-500/[0.12] border-indigo-500/25",
    border:   "border-indigo-500/20",
    glow:     "rgba(99,102,241,0.08)",
    cardBg:   "bg-indigo-500/[0.04]",
    features: ["Unlimited projects", "Advanced filters", "Analytics", "Activity feed", "Priority support"],
    PlanIcon: Sparkles,
  },
  enterprise: {
    label:    "Enterprise",
    badge:    "text-violet-300",
    badgeBg:  "bg-violet-500/[0.12] border-violet-500/25",
    border:   "border-violet-500/20",
    glow:     "rgba(139,92,246,0.08)",
    cardBg:   "bg-violet-500/[0.04]",
    features: ["Everything in Pro", "SSO / SAML", "Audit logs", "SLA guarantee", "Dedicated support"],
    PlanIcon: Shield,
  },
}

function PlanCard({ plan }: { plan: string }) {
  const meta = PLAN_META[plan] ?? PLAN_META.free
  const { PlanIcon } = meta

  return (
    <div
      className={`relative rounded-[16px] p-6 border ${meta.border} ${meta.cardBg} overflow-hidden
        hover:-translate-y-[1px] transition-all duration-200`}
      style={{ boxShadow: `0 0 80px ${meta.glow}, 0 4px 24px rgba(0,0,0,0.08)` }}
    >
      {/* Background glow blob */}
      <div
        className="absolute -bottom-8 -right-8 w-[200px] h-[160px] rounded-full blur-[70px] pointer-events-none"
        style={{ background: meta.glow }}
      />

      <div className="relative flex items-start justify-between mb-5">
        <div>
          <p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-2">Current plan</p>
          <div className="flex items-center gap-2.5">
            <span className="text-[30px] font-bold text-[var(--tf-text-primary)] tracking-tight leading-none">{meta.label}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badge}`}>
              {plan === "free" ? "Forever free" : "Active"}
            </span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-[11px] flex items-center justify-center border ${meta.badgeBg}`}>
          <PlanIcon size={16} className={meta.badge} />
        </div>
      </div>

      <ul className="space-y-2 mb-5 relative">
        {meta.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-[12.5px] text-[var(--tf-text-tertiary)]">
            <div className="w-[18px] h-[18px] rounded-full bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] flex items-center justify-center flex-shrink-0">
              <Check size={9} className="text-[var(--tf-text-tertiary)]" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <div className="relative">
        {plan === "free" && (
          <a
            href="/upgrade"
            className="inline-flex items-center gap-1.5 h-9 px-5 text-[12.5px] font-semibold
              bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-700/80
              rounded-[10px] shadow-[0_4px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none
              transition-all duration-100"
          >
            <Sparkles size={13} /> Upgrade to Pro
          </a>
        )}
        {plan === "pro" && (
          <p className="text-[12px] text-[var(--tf-text-tertiary)]">
            Need more?{" "}
            <a href="/upgrade" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5 transition-colors">
              Contact sales for Enterprise <ArrowUpRight size={11} />
            </a>
          </p>
        )}
        {plan === "enterprise" && (
          <p className="text-[12px] text-violet-400/70">You&apos;re on the highest tier. Thank you!</p>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════
// ── Profile Tab ──
// ══════════════════════════════
function ProfileTab({ user }: { user: Props["user"] }) {
  const { user: clerkUser }           = useUser()
  const [name, setName]               = useState(user.name)
  const [savingName, setSavingName]   = useState(false)
  const [uploading, setUploading]     = useState(false)
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !clerkUser) return
    setUploading(true)
    try {
      await clerkUser.setProfileImage({ file })
      toast.success("Profile picture updated!")
    } catch {
      toast.error("Failed to update profile picture")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

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

  return (
    <div className="space-y-4">

      {/* Profile information */}
      <Card>
        <SectionHead
          icon={User}
          title="Profile information"
          subtitle="Your public identity across workspaces"
        />

        {/* Avatar row */}
        <div className="flex items-center gap-5 mb-6 p-4 rounded-[12px] bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group flex-shrink-0"
            title="Change profile picture"
          >
            {/* Hover glow ring */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-600/40 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300" />
            <Avatar className="relative h-[72px] w-[72px] ring-2 ring-[var(--tf-border)] ring-offset-2 ring-offset-[var(--tf-bg-panel)]">
              <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                {getInitials(name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading
                ? <Loader2 size={18} className="text-white animate-spin" />
                : <Camera size={16} className="text-white" />
              }
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <div>
            <p className="text-[15px] font-bold text-[var(--tf-text-primary)] tracking-tight">{user.name}</p>
            <p className="text-[12.5px] text-[var(--tf-text-tertiary)] mt-0.5">{user.email}</p>
            <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-2 flex items-center gap-1.5">
              <Camera size={10} />
              Click avatar to change photo
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Display name" value={name} onChange={setName} />
          <Field
            label="Email address"
            value={user.email}
            disabled
            hint="Email cannot be changed — managed by your auth provider"
          />
          <div className="pt-1">
            <SaveBtn onClick={handleSaveName} loading={savingName} disabled={name.trim() === user.name} />
          </div>
        </div>
      </Card>

      {/* Plan */}
      <PlanCard plan={user.plan} />

      {/* Security */}
      <Card>
        <SectionHead
          icon={Shield}
          title="Password &amp; security"
          subtitle="Authentication managed by your provider"
          iconBg="bg-emerald-500/[0.1]"
          iconColor="text-emerald-400"
        />
        <p className="text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed">
          Password and 2FA settings are handled by your auth provider (Google, GitHub, or email).
          Sign out and sign back in to update your credentials.
        </p>
      </Card>

      {/* Danger zone */}
      <div
        className="rounded-[16px] p-6 border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/[0.05]
          hover:border-red-300 dark:hover:border-red-900/50 hover:-translate-y-[1px]
          hover:shadow-[0_16px_48px_rgba(127,29,29,0.08)] dark:hover:shadow-[0_16px_48px_rgba(127,29,29,0.15)]
          transition-all duration-200"
      >
        <SectionHead
          icon={AlertTriangle}
          title="Danger zone"
          subtitle="Irreversible — proceed with caution"
          iconBg="bg-red-500/[0.1]"
          iconColor="text-red-400"
        />
        <p className="text-[12.5px] text-[var(--tf-text-tertiary)] mb-5 leading-relaxed">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          type="button"
          className="flex items-center gap-2 h-9 px-5 text-[12.5px] font-semibold border border-red-200 dark:border-red-900/40
            text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-[10px]
            shadow-[0_4px_0_0_rgba(239,68,68,0.2)] dark:shadow-[0_4px_0_0_rgba(69,10,10,0.5)] active:translate-y-[3px] active:shadow-none
            transition-all duration-100"
          onClick={() => toast.error("Please contact support to delete your account")}
        >
          <Trash2 size={13} />
          Delete account
        </button>
      </div>

    </div>
  )
}

// ══════════════════════════════
// ── Workspace Tab ──
// ══════════════════════════════
function WorkspaceTab({
  workspace, members, userRole, pendingInvites,
}: {
  workspace:      Props["workspace"]
  members:        Props["members"]
  userRole:       string
  pendingInvites: Invitation[]
}) {
  const [name, setName]         = useState(workspace.name)
  const [saving, setSaving]     = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const canInvite = userRole === "OWNER" || userRole === "ADMIN"

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

  const roleStyles: Record<string, { bg: string; text: string; border: string }> = {
    OWNER:  { bg: "bg-violet-500/[0.1]", text: "text-violet-300", border: "border-violet-500/25" },
    ADMIN:  { bg: "bg-indigo-500/[0.1]", text: "text-indigo-300", border: "border-indigo-500/25" },
    MEMBER: { bg: "bg-[var(--tf-bg-hover)]",     text: "text-[var(--tf-text-tertiary)]",     border: "border-[var(--tf-border)]"  },
  }

  return (
    <div className="space-y-4">

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          pendingInvites={pendingInvites}
          userRole={userRole}
        />
      )}

      <Card>
        <SectionHead
          icon={Building2}
          title="Workspace settings"
          subtitle="Configure your team workspace"
          iconBg="bg-violet-500/[0.1]"
          iconColor="text-violet-400"
        />
        <div className="space-y-4 max-w-sm">
          <Field label="Workspace name" value={name} onChange={setName} />
          <Field
            label="Workspace slug"
            value={workspace.slug}
            disabled
            hint="Slug cannot be changed after creation"
          />
          <div className="pt-1">
            <SaveBtn onClick={handleSave} loading={saving} disabled={name.trim() === workspace.name} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHead
          icon={Users}
          title="Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} in this workspace`}
          iconBg="bg-violet-500/[0.1]"
          iconColor="text-violet-400"
          right={
            <button
              type="button"
              onClick={() => canInvite ? setInviteOpen(true) : toast.error("Only owners and admins can invite members")}
              className={`flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-semibold
                border rounded-[9px] shadow-[0_3px_0_0_rgba(0,0,0,0.4)]
                transition-all duration-100 active:translate-y-[2px] active:shadow-none
                ${canInvite
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700/80"
                  : "text-[var(--tf-text-tertiary)] border-[var(--tf-border-subtle)] opacity-50 cursor-not-allowed"
                }`}
            >
              <UserPlus size={12} />
              Invite
            </button>
          }
        />

        <div className="space-y-1">
          {members.map((member) => {
            const rs = roleStyles[member.role] ?? roleStyles.MEMBER
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-[10px] border border-transparent
                  hover:bg-[var(--tf-bg-hover)] hover:border-[var(--tf-border-subtle)] transition-all duration-150"
              >
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    {getInitials(member.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--tf-text-primary)] truncate">{member.name}</p>
                  <p className="text-[11px] text-[var(--tf-text-tertiary)] truncate">{member.email}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full border ${rs.bg} ${rs.border} ${rs.text}`}>
                  {member.role}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

    </div>
  )
}

// ══════════════════════════════
// ── Appearance Tab ──
// ══════════════════════════════
function AppearanceTab() {
  return (
    <div className="space-y-4">
      <Card>
        <SectionHead
          icon={Palette}
          title="Themes"
          subtitle="Choose a look that fits your style — dark, light, and everything in between"
          iconBg="bg-sky-500/[0.1]"
          iconColor="text-sky-400"
        />
        <ThemePicker />
      </Card>

      <Card>
        <SectionHead
          icon={Moon}
          title="Quick toggle"
          subtitle="Switch between dark and light using the sun / moon button in any page header"
          iconBg="bg-amber-500/[0.1]"
          iconColor="text-amber-400"
        />
        <div className="flex items-center gap-3 p-3 rounded-[10px] bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)]">
          <ThemeToggleInline />
          <div>
            <p className="text-[12.5px] font-semibold text-[var(--tf-text-primary)]">Sun / Moon toggle</p>
            <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-0.5">Available in every page header — switches between your paired dark & light themes</p>
          </div>
        </div>
      </Card>

    </div>
  )
}

// Inline toggle preview used inside the Quick Toggle card
function ThemeToggleInline() {
  const { themeDef } = useStyleTheme()
  const isDark = themeDef.type === "dark"
  return (
    <div className={[
      "w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 border",
      isDark
        ? "bg-amber-950/40 border-amber-700/40 text-amber-400"
        : "bg-indigo-50 border-indigo-200 text-indigo-500",
    ].join(" ")}>
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </div>
  )
}

// ══════════════════════════════
// ── Notifications Tab ──
// ══════════════════════════════
function NotificationsTab({ initialPrefs }: { initialPrefs: NotifPrefs }) {
  const [prefs, setPrefs]   = useState<NotifPrefs>(initialPrefs)
  const [saving, setSaving] = useState(false)

  const ITEMS: {
    key:      keyof NotifPrefs
    label:    string
    desc:     string
    icon:     React.ElementType
    iconBg:   string
    iconColor: string
  }[] = [
    { key: "taskAssigned",    label: "Task assigned to you", desc: "When someone assigns a task to you",   icon: User,          iconBg: "bg-indigo-500/[0.1]",  iconColor: "text-indigo-400"  },
    { key: "statusChange",    label: "Task status changed",  desc: "When a task is moved to a new column", icon: CheckCircle,   iconBg: "bg-emerald-500/[0.1]", iconColor: "text-emerald-400" },
    { key: "dueDateReminder", label: "Due date reminder",    desc: "24 hours before a task is due",        icon: Clock,         iconBg: "bg-amber-500/[0.1]",   iconColor: "text-amber-400"   },
    { key: "mentions",        label: "Mentions",             desc: "When someone @mentions you",           icon: UserPlus,      iconBg: "bg-violet-500/[0.1]",  iconColor: "text-violet-400"  },
    { key: "replies",         label: "Comment replies",      desc: "When someone replies to your comment", icon: MessageSquare, iconBg: "bg-sky-500/[0.1]",     iconColor: "text-sky-400"     },
  ]

  async function toggle(key: keyof NotifPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    try {
      await saveNotificationPreferences(next)
    } catch {
      setPrefs(prefs) // revert
      toast.error("Failed to save preference")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionHead
          icon={Bell}
          title="Notification preferences"
          subtitle="Choose what you want to hear about"
          iconBg="bg-amber-500/[0.1]"
          iconColor="text-amber-400"
          right={
            saving
              ? <Loader2 size={13} className="animate-spin text-[var(--tf-text-tertiary)]" />
              : null
          }
        />

        <div className="space-y-2">
          {ITEMS.map((item) => {
            const on = prefs[item.key]
            return (
              <div
                key={item.key}
                className="flex items-center gap-3.5 p-3.5 rounded-[12px] bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)]
                  hover:border-[var(--tf-border)] hover:bg-[var(--tf-bg-hover)] transition-all duration-150"
              >
                <div className={`w-8 h-8 rounded-[9px] ${item.iconBg} border border-[var(--tf-border)] flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={13} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold ${on ? "text-[var(--tf-text-primary)]" : "text-[var(--tf-text-tertiary)]"}`}>{item.label}</p>
                  <p className="text-[11px] text-[var(--tf-text-tertiary)]">{item.desc}</p>
                </div>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className="flex-shrink-0 focus:outline-none"
                  aria-label={on ? "Disable" : "Enable"}
                >
                  <div className={`w-10 h-[22px] rounded-full border relative transition-colors duration-200
                    ${on
                      ? "bg-indigo-600 border-indigo-500/50"
                      : "bg-[var(--tf-bg-hover)] border-[var(--tf-border)]"
                    }`}
                  >
                    <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200
                      ${on
                        ? "left-[calc(100%-19px)] bg-white"
                        : "left-[3px] bg-[var(--tf-text-tertiary)]/50"
                      }`}
                    />
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-5 pt-4 border-t border-[var(--tf-border-subtle)] flex items-center gap-1.5">
          <Mail size={10} />
          Email notifications will be available when team invitations are enabled.
        </p>
      </Card>
    </div>
  )
}

// ══════════════════════════════
// ── Main ──
// ══════════════════════════════
export function SettingsClient({ user, workspace, members, userRole, pendingInvites, notifPrefs }: Props) {
  const [activeTab, setActiveTab] = useState("profile")
  const [show, setShow]           = useState(true)

  function switchTab(id: string) {
    if (id === activeTab) return
    setShow(false)
    setTimeout(() => {
      setActiveTab(id)
      setShow(true)
    }, 80)
  }

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-border flex items-center justify-between pl-14 pr-5 md:px-5 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground hidden sm:inline">Workspace /</span>
          <span className="text-[13px] font-semibold">Settings</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 sm:pt-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[30px] font-bold tracking-tight text-[var(--tf-text-primary)]">Settings</h1>
          <p className="text-[13.5px] text-[var(--tf-text-tertiary)] mt-1.5">
            Manage your account, workspace, and preferences
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const tc       = TAB_COLORS[tab.color]
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[12.5px] font-semibold
                  border whitespace-nowrap flex-shrink-0 transition-all duration-150
                  ${isActive
                    ? tc.active
                    : "border-transparent text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-hover)]"
                  }`}
              >
                <div className={`w-5 h-5 rounded-[5px] flex items-center justify-center transition-colors ${isActive ? tc.icon : ""}`}>
                  <tab.icon size={12} />
                </div>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Animated tab content */}
        <div
          style={{
            opacity:    show ? 1 : 0,
            transform:  show ? "translateY(0)" : "translateY(6px)",
            transition: show ? "opacity 0.13s ease, transform 0.13s ease" : "opacity 0.08s ease, transform 0.08s ease",
          }}
        >
          {activeTab === "profile"       && <ProfileTab user={user} />}
          {activeTab === "workspace"     && <WorkspaceTab workspace={workspace} members={members} userRole={userRole} pendingInvites={pendingInvites} />}
          {activeTab === "appearance"    && <AppearanceTab />}
          {activeTab === "notifications" && <NotificationsTab initialPrefs={notifPrefs} />}
        </div>

      </div>
    </div>
  )
}
