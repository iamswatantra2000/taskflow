// app/(dashboard)/projects/[id]/page.tsx
import { requireAuth } from "@/lib/session"
import { db, tasks, projects, workspaceMembers } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ProjectClient } from "../../../../components/features/ProjectClient"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await requireAuth()

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) notFound()

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, id),
        eq(projects.workspaceId, membership.workspaceId)
      )
    )
    .limit(1)

  if (!project) notFound()

  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, membership.workspaceId))

  const projectTasks = await db
    .select({
      id:          tasks.id,
      title:       tasks.title,
      description: tasks.description,
      status:      tasks.status,
      priority:    tasks.priority,
      assigneeId:  tasks.assigneeId,
      projectId:   tasks.projectId,
      dueDate:     tasks.dueDate,
      createdAt:   tasks.createdAt,
    })
    .from(tasks)
    .where(eq(tasks.projectId, project.id))

  return (
    <ProjectClient
      project={project}
      tasks={projectTasks}
      allProjects={allProjects}
      currentUser={{ userId: session.user.id, name: session.user.name }}
    />
  )
}




















// // app/(dashboard)/projects/[id]/page.tsx
// import { requireAuth } from "@/lib/session"
// import { db, tasks, projects, workspaceMembers } from "@/lib/db"
// import { eq, and } from "drizzle-orm"
// import { notFound } from "next/navigation"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { NewTaskDialog } from "@/components/features/NewTaskDialog"
// import { DeleteTaskButton } from "@/components/features/DeleteTaskButton"

// function getInitials(name: string) {
//   return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
// }

// const priorityConfig = {
//   HIGH:   { label: "High",   class: "bg-red-950 text-red-400 border-red-900"             },
//   URGENT: { label: "Urgent", class: "bg-red-950 text-red-400 border-red-900"             },
//   MEDIUM: { label: "Medium", class: "bg-amber-950 text-amber-400 border-amber-900"       },
//   LOW:    { label: "Low",    class: "bg-emerald-950 text-emerald-400 border-emerald-900" },
// }

// export default async function ProjectPage({
//   params,
// }: {
//   params: Promise<{ id: string }>
// }) {
//   const { id }    = await params   // ← Next.js 16 requires await
//   const session   = await requireAuth()

//   const [membership] = await db
//     .select()
//     .from(workspaceMembers)
//     .where(eq(workspaceMembers.userId, session.user.id!))
//     .limit(1)

//   if (!membership) notFound()

//   const [project] = await db
//     .select()
//     .from(projects)
//     .where(
//       and(
//         eq(projects.id, id),
//         eq(projects.workspaceId, membership.workspaceId)
//       )
//     )
//     .limit(1)

//   if (!project) notFound()

//   const projectTasks    = await db
//     .select()
//     .from(tasks)
//     .where(eq(tasks.projectId, project.id))

//   const todoTasks        = projectTasks.filter((t) => t.status === "TODO")
//   const inProgressTasks  = projectTasks.filter((t) => t.status === "IN_PROGRESS")
//   const inReviewTasks    = projectTasks.filter((t) => t.status === "IN_REVIEW")
//   const doneTasks        = projectTasks.filter((t) => t.status === "DONE")
  

//   const columns = [
//     { id: "TODO",        label: "Todo",        tasks: todoTasks,       dot: "bg-[#555]"      },
//     { id: "IN_PROGRESS", label: "In progress", tasks: inProgressTasks, dot: "bg-indigo-500"  },
//     { id: "IN_REVIEW",   label: "In review",   tasks: inReviewTasks,   dot: "bg-amber-500"   },
//     { id: "DONE",        label: "Done",        tasks: doneTasks,       dot: "bg-emerald-500" },
//   ]

//   return (
//     <div className="flex-1 overflow-auto">

//       {/* Topbar */}
//       <div className="h-[50px] border-b border-[#1a1a1a] flex items-center justify-between px-5 bg-[#0d0d0d] sticky top-0 z-10">
//         <div className="flex items-center gap-2">
//           <span className="text-[13px] text-[#555]">Projects /</span>
//           <div className="w-2 h-2 rounded-full" style={{ background: project.color }} />
//           <span className="text-[13px] font-medium text-[#e0e0e0]">{project.name}</span>
//         </div>
//         <NewTaskDialog projectId={project.id}>
//           <div className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md cursor-pointer flex items-center font-medium transition-colors">
//             + New task
//           </div>
//         </NewTaskDialog>
//       </div>

//       <div className="p-6 space-y-6">

//         {/* Project header */}
//         <div className="flex items-start gap-4">
//           <div
//             className="w-10 h-10 rounded-[10px] flex-shrink-0"
//             style={{ background: project.color }}
//           />
//           <div>
//             <h1 className="text-[18px] font-semibold text-[#f0f0f0] tracking-tight">
//               {project.name}
//             </h1>
//             {project.description && (
//               <p className="text-[13px] text-[#555] mt-1">{project.description}</p>
//             )}
//             <p className="text-[12px] text-[#444] mt-1">
//               {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
//             </p>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-4 gap-3">
//           {[
//             { label: "Total",       value: projectTasks.length,    color: "text-[#e0e0e0]"   },
//             { label: "In progress", value: inProgressTasks.length, color: "text-indigo-400"  },
//             { label: "Completed",   value: doneTasks.length,       color: "text-emerald-400" },
//             { label: "Todo",        value: todoTasks.length,       color: "text-amber-400"   },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-[#111] border border-[#1f1f1f] rounded-[10px] p-4">
//               <p className="text-[11px] font-medium text-[#555] mb-2">{stat.label}</p>
//               <p className={`text-[26px] font-semibold tracking-tight leading-none ${stat.color}`}>
//                 {stat.value}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Task columns */}
//         <div>
//           <h2 className="text-[13px] font-medium text-[#d0d0d0] mb-3">Tasks</h2>
//           <div className="grid grid-cols-4 gap-3">
//             {columns.map((col) => (
//               <div
//                 key={col.id}
//                 className="bg-[#111] border border-[#1a1a1a] rounded-[10px] p-3 flex flex-col gap-2 min-h-[120px]"
//               >
//                 {/* Column header */}
//                 <div className="flex items-center justify-between mb-1">
//                   <div className="flex items-center gap-1.5">
//                     <div className={`w-[7px] h-[7px] rounded-full ${col.dot}`} />
//                     <span className="text-[11px] font-medium text-[#666]">{col.label}</span>
//                   </div>
//                   <span className="text-[10px] text-[#444] bg-[#1a1a1a] rounded-full px-2 py-0.5">
//                     {col.tasks.length}
//                   </span>
//                 </div>

//                 {/* Tasks */}
//                 {col.tasks.map((task) => {
//                   const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
//                   return (
//                     <div
//                       key={task.id}
//                       className={`group bg-[#161616] border border-[#222] rounded-[8px] p-3 hover:border-[#333] transition-all
//                         ${task.status === "IN_PROGRESS" ? "border-l-2 border-l-indigo-500" : ""}
//                         ${task.status === "DONE" ? "opacity-50" : ""}
//                       `}
//                     >
//                       <div className="flex items-start justify-between gap-2 mb-2">
//                         <p className="text-[12px] text-[#ccc] leading-[1.45] flex-1">
//                           {task.title}
//                         </p>
//                         <DeleteTaskButton taskId={task.id} />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority.class}`}>
//                           {priority.label}
//                         </span>
//                         {task.assigneeId && (
//                           <Avatar className="h-[18px] w-[18px]">
//                             <AvatarFallback className="text-[8px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
//                               {getInitials(session.user.name ?? "U")}
//                             </AvatarFallback>
//                           </Avatar>
//                         )}
//                       </div>
//                     </div>
//                   )
//                 })}

//                 {/* Empty state */}
//                 {col.tasks.length === 0 && (
//                   <div className="flex-1 flex items-center justify-center py-6">
//                     <p className="text-[11px] text-[#333]">No tasks</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }