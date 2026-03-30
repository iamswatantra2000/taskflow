// app/(dashboard)/activity/page.tsx
import { requireAuth } from "@/lib/session"
import { db, activities, users, workspaceMembers } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  CheckSquare, Trash2, MoveRight,
  FolderPlus, UserPlus, Pencil
} from "lucide-react"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)  return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const activityConfig = {
  TASK_CREATED:    { icon: CheckSquare, color: "text-indigo-400",  bg: "bg-indigo-950/50"  },
  TASK_UPDATED:    { icon: Pencil,      color: "text-amber-400",   bg: "bg-amber-950/50"   },
  TASK_DELETED:    { icon: Trash2,      color: "text-red-400",     bg: "bg-red-950/50"     },
  TASK_MOVED:      { icon: MoveRight,   color: "text-emerald-400", bg: "bg-emerald-950/50" },
  PROJECT_CREATED: { icon: FolderPlus,  color: "text-violet-400",  bg: "bg-violet-950/50"  },
  MEMBER_JOINED:   { icon: UserPlus,    color: "text-blue-400",    bg: "bg-blue-950/50"    },
}

export default async function ActivityPage() {
  const session = await requireAuth()

  // Get user's workspace
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No workspace found</p>
      </div>
    )
  }

  // Fetch activities with user info
  const feed = await db
    .select({
      id:          activities.id,
      type:        activities.type,
      description: activities.description,
      createdAt:   activities.createdAt,
      userName:    users.name,
      userEmail:   users.email,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .where(eq(activities.workspaceId, membership.workspaceId))
    .orderBy(desc(activities.createdAt))
    .limit(100)

  // Group by date
  const grouped = feed.reduce<Record<string, typeof feed>>((acc, item) => {
    const date = new Date(item.createdAt)
    const key  = date.toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-border flex items-center pl-14 pr-5 md:px-5 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground hidden sm:inline">Workspace /</span>
          <span className="text-[13px] font-medium">Activity</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">
            Activity feed
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Everything happening in your workspace
          </p>
        </div>

        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckSquare size={20} className="text-muted-foreground" />
            </div>
            <p className="text-[14px] font-medium text-muted-foreground">
              No activity yet
            </p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">
              Start creating tasks and projects to see activity here
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>

              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium text-muted-foreground px-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month:   "long",
                    day:     "numeric",
                  })}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Activity items */}
              <div className="space-y-1">
                {items.map((item) => {
                  const config = activityConfig[item.type as keyof typeof activityConfig]
                  const Icon   = config?.icon ?? CheckSquare

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-muted/50 transition-colors group"
                    >
                      {/* Activity icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config?.bg ?? "bg-muted"}`}>
                        <Icon size={14} className={config?.color ?? "text-muted-foreground"} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* User avatar + name */}
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
                              {getInitials(item.userName ?? "User")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] font-medium">
                            {item.userName ?? "Someone"}
                          </span>
                          <span className="text-[13px] text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </div>

                      {/* Time */}
                      <span className="text-[11px] text-muted-foreground/60 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {timeAgo(new Date(item.createdAt))}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}