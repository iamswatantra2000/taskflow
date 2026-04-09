// components/features/DashboardClient.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Sparkles, Lock,
  ListTodo, Zap, CheckCircle2, Circle,
  KanbanSquare, Users,
} from "lucide-react";
import { WorkloadBalancer } from "./WorkloadBalancer";
import { BoardFilters, type FilterState } from "./BoardFilters";
import { TaskBoardWrapper } from "./TaskBoardWrapper";
import { NewTaskDialog } from "./NewTaskDialog";
import { SignOutButton } from "./SignOutButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { toast } from "sonner";
import { AnimatedCounter } from "./AnimatedCounter"
import { NotificationBell } from "./NotificationBell"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { checkDueDateReminders } from "@/lib/notification-actions";

type Task = {
	id: string;
	title: string;
	description: string | null;
	status: string;
	priority: string;
	assigneeId: string | null;
	projectId: string;
	dueDate: Date | null;
	updatedAt: Date | null;
};

type Column = {
	id: string;
	label: string;
	tasks: Task[];
	dot: string;
};

type Project = {
	id: string;
	name: string;
	color: string;
};

type Props = {
	columns: Column[];
	userName: string;
	userInitials: string;
	projectId: string | null;
	projects: Project[];
	stats: { label: string; value: number; sub: string; valueColor: string }[];
	firstName: string;
	user: { name?: string | null; email?: string | null };
	workspaceId:   string;
	plan:          string;
	members:       { id: string; name: string }[];
	currentUserId: string;
};

// Per-stat visual config — icon, accent bar, icon chip colors
const STAT_META: Record<string, {
	icon:      React.ElementType;
	accentBg:  string;
	iconBg:    string;
	iconColor: string;
}> = {
	"Total tasks": { icon: ListTodo,     accentBg: "bg-[var(--tf-bg-hover)]",      iconBg: "bg-[var(--tf-bg-hover)]",       iconColor: "text-[var(--tf-text-secondary)]"         },
	"In progress": { icon: Zap,          accentBg: "bg-indigo-500/50",     iconBg: "bg-indigo-500/[0.12]",  iconColor: "text-indigo-400"     },
	"Completed":   { icon: CheckCircle2, accentBg: "bg-emerald-500/50",    iconBg: "bg-emerald-500/[0.12]", iconColor: "text-emerald-400"    },
	"Todo":        { icon: Circle,       accentBg: "bg-amber-500/50",      iconBg: "bg-amber-500/[0.12]",   iconColor: "text-amber-400"      },
};

const MY_TASK_STATUS: Record<string, { label: string; dot: string; badge: string }> = {
	TODO:        { label: "Todo",        dot: "bg-[var(--tf-text-tertiary)]",  badge: "bg-[var(--tf-bg-dropdown)] text-[var(--tf-text-secondary)] border-[var(--tf-border)]"             },
	IN_PROGRESS: { label: "In progress", dot: "bg-indigo-500",                badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"   },
	IN_REVIEW:   { label: "In review",   dot: "bg-amber-500",                 badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"         },
	DONE:        { label: "Done",        dot: "bg-emerald-500",               badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
}

const MY_TASK_PRIORITY: Record<string, { label: string; color: string }> = {
	LOW:    { label: "Low",    color: "text-emerald-400" },
	MEDIUM: { label: "Medium", color: "text-amber-400"   },
	HIGH:   { label: "High",   color: "text-red-400"     },
	URGENT: { label: "Urgent", color: "text-rose-400"    },
}

// ProGate — locks Pro-only UI for free users
function ProGate({
	plan,
	children,
	label = "Pro feature",
	tooltipDir = "top",
}: {
	plan: string;
	children: React.ReactNode;
	label?: string;
	tooltipDir?: "top" | "bottom";
}) {
	const isPro = plan === "pro" || plan === "enterprise";
	const [show, setShow] = useState(false);
	const hideRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	if (isPro) return <>{children}</>;

	const isTop = tooltipDir === "top";

	function clearHide() {
		if (hideRef.current) clearTimeout(hideRef.current);
	}
	function scheduleHide() {
		hideRef.current = setTimeout(() => setShow(false), 150);
	}

	return (
		<div
			className="relative"
			onMouseEnter={() => { clearHide(); setShow(true); }}
			onMouseLeave={scheduleHide}
		>
			<div className="pointer-events-none opacity-50 select-none">{children}</div>
			<div className="absolute inset-0 cursor-not-allowed rounded-[inherit]" />

			{/* Tooltip */}
			<div
				className={`absolute left-1/2 -translate-x-1/2 z-[200] transition-all duration-150
					${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
					${isTop ? "-top-11" : "top-full mt-2"}`}
				onMouseEnter={clearHide}
				onMouseLeave={scheduleHide}
			>
				{isTop && (
					<div className="w-2 h-2 bg-[var(--tf-bg-card)] border-[var(--tf-border)] border-r border-b rotate-45 mx-auto mb-[-4px] relative z-[-1]" />
				)}
				<div className="bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[8px] px-3 py-1.5 flex items-center gap-2 whitespace-nowrap shadow-xl">
					<Lock size={9} className="text-amber-400 flex-shrink-0" />
					<span className="text-[11px] text-[var(--tf-text-primary)]">{label}</span>
					<a href="/upgrade" className="text-[11px] font-semibold text-[var(--tf-accent-text)] hover:text-indigo-300">
						Upgrade →
					</a>
				</div>
				{!isTop && (
					<div className="w-2 h-2 bg-[var(--tf-bg-card)] border-[var(--tf-border)] border-l border-t rotate-45 mx-auto mt-[-4px] relative z-[-1]" />
				)}
			</div>
		</div>
	);
}

function formatDate() {
	return new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month:   "long",
		day:     "numeric",
		year:    "numeric",
	});
}

export function DashboardClient({
	columns,
	userName,
	userInitials: _userInitials,
	workspaceId,
	projectId,
	projects,
	stats,
	firstName,
	user,
	plan,
	members,
	currentUserId,
}: Props) {
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") ?? "board";
	const isInvited = searchParams.get("invited") === "1";

	const [filters, setFilters] = useState<FilterState>({
		priority: [],
		search: "",
	});
	const [boardView, setBoardView] = useState<"board" | "people">("board");

	useEffect(() => {
		if (isInvited) {
			toast.success("Welcome to the workspace!", {
				description: "You've successfully joined via invitation.",
			})
		}
	}, [isInvited]);

	useEffect(() => {
		// Run at most once per browser session, with a 5s delay so it never
		// blocks the initial render or slows perceived tab switching.
		const key = "ddr-checked"
		if (sessionStorage.getItem(key)) return
		const t = setTimeout(() => {
			sessionStorage.setItem(key, "1")
			checkDueDateReminders().catch(() => {})
		}, 5000)
		return () => clearTimeout(t)
	}, []);

	const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

	return (
		<div className="flex-1 flex flex-col min-h-0">

			{/* ── Topbar ── */}
			<div className="h-[50px] border-b border-[var(--tf-border)] flex items-center justify-between pl-14 pr-4 md:px-5 flex-shrink-0 bg-[var(--tf-bg-card)] z-10">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-[13px] text-[var(--tf-text-tertiary)] hidden sm:inline">Workspace /</span>
					<span className="text-[13px] font-semibold text-[var(--tf-text-primary)] truncate">
					{activeTab === "my-tasks" ? "My tasks" : "Dashboard"}
				</span>
				</div>

				<div className="hidden md:flex items-center gap-3 flex-shrink-0">
					<SignOutButton />

					<button
						type="button"
						onClick={() => {
							document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
						}}
						className="flex items-center gap-2 h-7 px-3 text-[12px] text-[var(--tf-text-tertiary)] border border-[var(--tf-border)] rounded-[7px] hover:border-[var(--tf-border)] hover:text-[var(--tf-text-primary)] transition-colors"
					>
						<Search size={12} />
						<span>Search</span>
						<kbd className="text-[10px] border border-[var(--tf-border)] rounded px-1 ml-1">⌘K</kbd>
					</button>

					<BoardFilters onFilterChange={setFilters} />

					{projectId && (
						<>
							<NewTaskDialog projectId={projectId}>
								<div className="h-7 px-3 text-[12px] bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center font-semibold transition-all duration-100 whitespace-nowrap">
									+ New task
								</div>
							</NewTaskDialog>

							<ProGate plan={plan} label="AI tasks · Pro feature" tooltipDir="bottom">
								<button
									type="button"
									onClick={() =>
										toast("AI task generator coming soon!", {
											description: "We're adding Anthropic API credits. Stay tuned!",
										})
									}
									className="h-7 px-3 text-[12px] bg-violet-950/60 hover:bg-violet-950/80 text-violet-400 border border-violet-800/60 shadow-[0_3px_0_0_rgba(76,29,149,0.5)] active:translate-y-[3px] active:shadow-none rounded-[8px] cursor-pointer flex items-center gap-1.5 font-medium transition-all duration-100 whitespace-nowrap"
								>
									<Sparkles size={12} />
									AI tasks
								</button>
							</ProGate>
						</>
					)}

				</div>

				{/* Always visible on all screens */}
				<div className="flex items-center gap-1.5 flex-shrink-0">
					<NotificationBell />
					<ThemeToggle />
					<ProfileDropdown user={user} />
				</div>
			</div>

			{/* Mobile action bar */}
			<div className="flex md:hidden items-center justify-between gap-2 px-3 py-2 border-b border-[var(--tf-border)] bg-[var(--tf-bg-card)] flex-shrink-0 z-10 shadow-sm">
				<BoardFilters onFilterChange={setFilters} compact />
				{projectId && (
					<NewTaskDialog projectId={projectId}>
						<div className="h-8 px-3 text-[12px] bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center gap-1.5 font-semibold transition-all duration-100 flex-shrink-0 whitespace-nowrap">
							+ New task
						</div>
					</NewTaskDialog>
				)}
			</div>

			{/* ── Main content ── */}
			<div className="flex-1 overflow-auto">
				{activeTab === "my-tasks" ? (() => {
					const myTasks = columns.flatMap((c) => c.tasks).filter((t) => t.assigneeId === currentUserId)
					const projectMap = new Map(projects.map((p) => [p.id, p]))
					const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const
					return (
						<div className="p-5 sm:p-7 space-y-6">
							<div>
								<h1 className="text-[22px] font-bold tracking-tight text-[var(--tf-text-primary)]">My tasks</h1>
								<p className="text-[13px] text-[var(--tf-text-tertiary)] mt-1">
									{myTasks.length} task{myTasks.length !== 1 ? "s" : ""} assigned to you
								</p>
							</div>

							{statuses.map((status) => {
								const group = myTasks.filter((t) => t.status === status)
								if (group.length === 0) return null
								const sc = MY_TASK_STATUS[status]
								return (
									<div key={status}>
										<div className="flex items-center gap-2 mb-3">
											<div className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
											<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] border ${sc.badge}`}>
												{sc.label}
											</span>
											<span className="text-[11px] text-[var(--tf-text-tertiary)]">{group.length}</span>
										</div>
										<div className="space-y-1.5">
											{group.map((task) => {
												const proj = projectMap.get(task.projectId)
												const pc = MY_TASK_PRIORITY[task.priority] ?? MY_TASK_PRIORITY.MEDIUM
												return (
													<div
														key={task.id}
														className="flex items-center gap-3 bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[9px] px-4 py-3 hover:border-[var(--tf-border)] transition-colors"
													>
														<div
															className="w-[6px] h-[6px] rounded-full flex-shrink-0"
															style={{ background: proj?.color ?? "#6366f1" }}
														/>
														<p className="flex-1 text-[13px] text-[var(--tf-text-primary)] truncate">{task.title}</p>
														{proj && (
															<span className="text-[11px] text-[var(--tf-text-tertiary)] hidden sm:block shrink-0">{proj.name}</span>
														)}
														<span className={`text-[11px] font-medium shrink-0 ${pc.color}`}>{pc.label}</span>
														{task.dueDate && (
															<span className="text-[11px] text-[var(--tf-text-tertiary)] shrink-0 hidden sm:block">
																{new Date(task.dueDate).toLocaleDateString()}
															</span>
														)}
													</div>
												)
											})}
										</div>
									</div>
								)
							})}

							{myTasks.length === 0 && (
								<div className="flex flex-col items-center justify-center py-20 text-center">
									<div className="w-14 h-14 rounded-full bg-[var(--tf-bg-hover)] flex items-center justify-center mb-4">
										<ListTodo size={22} className="text-[var(--tf-text-tertiary)]" />
									</div>
									<p className="text-[14px] font-medium text-[var(--tf-text-tertiary)]">No tasks assigned to you</p>
									<p className="text-[12px] text-[var(--tf-text-tertiary)] mt-1">Tasks assigned to you will appear here</p>
								</div>
							)}
						</div>
					)
				})() : (
					<div className="p-5 sm:p-7 space-y-6 sm:space-y-8">

						{/* ── Welcome ── */}
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-2">
									{formatDate()}
								</p>
								<h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
									Good day,{" "}
									<span className="text-indigo-400">{firstName}</span>
								</h1>
								<p className="text-[13px] text-[var(--tf-text-tertiary)] mt-1.5">
									Here&apos;s what&apos;s happening across your projects.
								</p>
							</div>

							{/* Quick task count bubble — desktop only */}
							<div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 pt-1">
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)]">
									<KanbanSquare size={13} className="text-[var(--tf-text-tertiary)]" />
									<span className="text-[12px] font-semibold text-[var(--tf-text-secondary)]">
										{totalTasks} task{totalTasks !== 1 ? "s" : ""} total
									</span>
								</div>
							</div>
						</div>

						{/* ── Stats ── */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{stats.map((stat, index) => {
								const meta = STAT_META[stat.label] ?? STAT_META["Total tasks"];
								const Icon = meta.icon;
								return (
									<div
										key={stat.label}
										className="relative bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[12px] p-4 overflow-hidden
											hover:border-[var(--tf-border)] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]
											transition-all duration-150 group"
									>
										{/* Top accent bar */}
										<div className={`absolute top-0 left-0 right-0 h-[2px] ${meta.accentBg} rounded-t-[12px]`} />

										{/* Label + icon */}
										<div className="flex items-start justify-between mb-4 mt-1">
											<p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em] leading-none">
												{stat.label}
											</p>
											<div className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
												<Icon size={14} className={meta.iconColor} />
											</div>
										</div>

										{/* Value */}
										<p className={`text-[34px] font-bold tracking-tight leading-none mb-2 ${stat.valueColor}`}>
											<AnimatedCounter value={stat.value} duration={1200} delay={index * 100} />
										</p>

										{/* Sub */}
										<p className="text-[11px] text-[var(--tf-text-tertiary)] font-medium">{stat.sub}</p>
									</div>
								);
							})}
						</div>

						{/* ── Task board / People ── */}
						<div>
							{/* Section header with view toggle */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[8px] p-0.5">
									<button
										type="button"
										onClick={() => setBoardView("board")}
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
											boardView === "board"
												? "bg-[var(--tf-bg-card)] text-[var(--tf-text-primary)] shadow-sm"
												: "text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)]"
										}`}
									>
										<KanbanSquare size={12} />
										Board
									</button>
									<button
										type="button"
										onClick={() => setBoardView("people")}
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
											boardView === "people"
												? "bg-[var(--tf-bg-card)] text-[var(--tf-text-primary)] shadow-sm"
												: "text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)]"
										}`}
									>
										<Users size={12} />
										People
									</button>
								</div>

								<div className="flex items-center gap-2">
									{totalTasks > 0 && (
										<span className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-full px-2.5 py-0.5">
											{totalTasks} task{totalTasks !== 1 ? "s" : ""}
										</span>
									)}
								</div>
							</div>

							<div key={boardView} className="animate-fade-in-up-sm">
								{boardView === "board" ? (
									<TaskBoardWrapper
										columns={columns}
										userName={userName}
										filters={filters}
										projects={projects}
										workspaceId={workspaceId}
										members={members}
										currentUserId={currentUserId}
									/>
								) : (
									<WorkloadBalancer
										tasks={columns.flatMap((c) => c.tasks)}
										members={members}
										projects={projects}
										currentUserId={currentUserId}
									/>
								)}
							</div>
						</div>

					</div>
				)}
			</div>
		</div>
	);
}
