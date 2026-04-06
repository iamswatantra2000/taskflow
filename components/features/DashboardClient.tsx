// components/features/DashboardClient.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, Sparkles, Lock,
  ListTodo, Zap, CheckCircle2, Circle,
  KanbanSquare,
} from "lucide-react";
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
	invited?:      boolean;
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
	"Total tasks": { icon: ListTodo,     accentBg: "bg-slate-200 dark:bg-white/[0.12]",      iconBg: "bg-slate-100 dark:bg-white/[0.06]",       iconColor: "text-slate-500 dark:text-[#888]"         },
	"In progress": { icon: Zap,          accentBg: "bg-indigo-500/50",     iconBg: "bg-indigo-500/[0.12]",  iconColor: "text-indigo-400"     },
	"Completed":   { icon: CheckCircle2, accentBg: "bg-emerald-500/50",    iconBg: "bg-emerald-500/[0.12]", iconColor: "text-emerald-400"    },
	"Todo":        { icon: Circle,       accentBg: "bg-amber-500/50",      iconBg: "bg-amber-500/[0.12]",   iconColor: "text-amber-400"      },
};

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
					<div className="w-2 h-2 bg-white dark:bg-[#1c1c1c] border-slate-200 dark:border-white/10 border-r border-b rotate-45 mx-auto mb-[-4px] relative z-[-1]" />
				)}
				<div className="bg-white dark:bg-[#1c1c1c] border border-slate-200 dark:border-white/10 rounded-[8px] px-3 py-1.5 flex items-center gap-2 whitespace-nowrap shadow-xl">
					<Lock size={9} className="text-amber-400 flex-shrink-0" />
					<span className="text-[11px] text-slate-700 dark:text-[#ccc]">{label}</span>
					<a href="/upgrade" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
						Upgrade →
					</a>
				</div>
				{!isTop && (
					<div className="w-2 h-2 bg-white dark:bg-[#1c1c1c] border-slate-200 dark:border-white/10 border-l border-t rotate-45 mx-auto mt-[-4px] relative z-[-1]" />
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
	invited,
	members,
	currentUserId,
}: Props) {
	const [filters, setFilters] = useState<FilterState>({
		priority: [],
		search: "",
	});

	useEffect(() => {
		if (invited) {
			toast.success("Welcome to the workspace!", {
				description: "You've successfully joined via invitation.",
			})
		}
	}, [invited]);

	useEffect(() => {
		checkDueDateReminders().catch(() => {})
	}, []);

	const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

	return (
		<div className="flex-1 flex flex-col min-h-0">

			{/* ── Topbar ── */}
			<div className="h-[50px] border-b border-border flex items-center justify-between pl-14 pr-4 md:px-5 flex-shrink-0 bg-background z-10">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-[13px] text-muted-foreground hidden sm:inline">Workspace /</span>
					<span className="text-[13px] font-semibold text-foreground truncate">Dashboard</span>
				</div>

				<div className="hidden md:flex items-center gap-3 flex-shrink-0">
					<SignOutButton />

					<button
						type="button"
						onClick={() => {
							document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
						}}
						className="flex items-center gap-2 h-7 px-3 text-[12px] text-muted-foreground border border-border rounded-[7px] hover:border-border/80 hover:text-foreground transition-colors"
					>
						<Search size={12} />
						<span>Search</span>
						<kbd className="text-[10px] border border-border rounded px-1 ml-1">⌘K</kbd>
					</button>

					<BoardFilters onFilterChange={setFilters} />

					{projectId && (
						<>
							<NewTaskDialog projectId={projectId}>
								<div className="h-7 px-3 text-[12px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center font-semibold transition-all duration-100 whitespace-nowrap">
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

					<NotificationBell />
				<ThemeToggle />
				<ProfileDropdown user={user} />
				</div>
			</div>

			{/* Mobile action bar */}
			<div className="flex md:hidden items-center justify-between gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0 z-10 shadow-sm">
				<BoardFilters onFilterChange={setFilters} compact />
				{projectId && (
					<NewTaskDialog projectId={projectId}>
						<div className="h-8 px-3 text-[12px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center gap-1.5 font-semibold transition-all duration-100 flex-shrink-0 whitespace-nowrap">
							+ New task
						</div>
					</NewTaskDialog>
				)}
			</div>

			{/* ── Main content ── */}
			<div className="flex-1 overflow-auto">
				<div className="p-5 sm:p-7 space-y-6 sm:space-y-8">

					{/* ── Welcome ── */}
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-[11px] font-semibold text-slate-400 dark:text-[#3a3a3a] uppercase tracking-[0.1em] mb-2">
								{formatDate()}
							</p>
							<h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight">
								Good day,{" "}
								<span className="text-indigo-600 dark:text-indigo-400">{firstName}</span>
							</h1>
							<p className="text-[13px] text-slate-500 dark:text-[#555] mt-1.5">
								Here&apos;s what&apos;s happening across your projects.
							</p>
						</div>

						{/* Quick task count bubble — desktop only */}
						<div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 pt-1">
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-slate-50 border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.07]">
								<KanbanSquare size={13} className="text-slate-400 dark:text-[#444]" />
								<span className="text-[12px] font-semibold text-slate-500 dark:text-[#666]">
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
									className="relative bg-white dark:bg-[#111] border border-slate-100 dark:border-white/[0.07] rounded-[12px] p-4 overflow-hidden
										hover:border-slate-200 dark:hover:border-white/[0.13] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]
										transition-all duration-150 group"
								>
									{/* Top accent bar */}
									<div className={`absolute top-0 left-0 right-0 h-[2px] ${meta.accentBg} rounded-t-[12px]`} />

									{/* Label + icon */}
									<div className="flex items-start justify-between mb-4 mt-1">
										<p className="text-[10.5px] font-semibold text-slate-400 dark:text-[#444] uppercase tracking-[0.08em] leading-none">
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
									<p className="text-[11px] text-slate-400 dark:text-[#3a3a3a] font-medium">{stat.sub}</p>
								</div>
							);
						})}
					</div>

					{/* ── Task board ── */}
					<div>
						{/* Section header */}
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<KanbanSquare size={15} className="text-slate-400 dark:text-[#444]" />
								<h2 className="text-[14px] font-semibold text-slate-700 dark:text-[#ccc] tracking-tight">
									Task board
								</h2>
							</div>
							<div className="flex items-center gap-2">
								{totalTasks > 0 && (
									<span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 dark:text-[#444] dark:bg-white/[0.04] dark:border-white/[0.07] rounded-full px-2.5 py-0.5">
										{totalTasks} task{totalTasks !== 1 ? "s" : ""}
									</span>
								)}
							</div>
						</div>

						<TaskBoardWrapper
							columns={columns}
							userName={userName}
							filters={filters}
							projects={projects}
							workspaceId={workspaceId}
						members={members}
						currentUserId={currentUserId}
						/>
					</div>

				</div>
			</div>
		</div>
	);
}
