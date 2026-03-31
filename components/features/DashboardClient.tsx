// components/features/DashboardClient.tsx
"use client";

import { useState } from "react";
import { Search, Sparkles, Lock, Zap, Check } from "lucide-react";
import { BoardFilters, type FilterState } from "./BoardFilters";
import { TaskBoardWrapper } from "./TaskBoardWrapper";
import { NewTaskDialog } from "./NewTaskDialog";
import { SignOutButton } from "./SignOutButton";
import { ProfileDropdown } from "./ProfileDropdown";
import { toast } from "sonner";
import { AnimatedCounter } from "./AnimatedCounter";

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
	stats: { label: string; value: number; sub: string; valueColor: string }[]
	firstName: string;
	user: { name?: string | null; email?: string | null };
	workspaceId: string;
	plan: string;
};

const FREE_FEATURES = ["Unlimited tasks", "Kanban board", "Basic filters & search", "Up to 3 projects"]
const PRO_LOCKED    = ["Advanced filters", "Activity feed", "Analytics", "Unlimited projects", "AI task generator"]

// Wraps Pro-only elements: free users see a lock overlay + tooltip on hover
function ProGate({ plan, children, label = "Pro feature" }: { plan: string; children: React.ReactNode; label?: string }) {
	const isPro = plan === "pro" || plan === "enterprise"
	if (isPro) return <>{children}</>
	return (
		<div className="relative group/gate">
			<div className="pointer-events-none opacity-50 select-none">{children}</div>
			{/* Invisible click-blocker */}
			<div className="absolute inset-0 cursor-not-allowed rounded-[inherit]" />
			{/* Upgrade tooltip */}
			<div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 pointer-events-none
				opacity-0 group-hover/gate:opacity-100 transition-opacity duration-150 scale-95 group-hover/gate:scale-100">
				<div className="bg-[#1c1c1c] border border-white/10 rounded-[8px] px-3 py-1.5 flex items-center gap-2 whitespace-nowrap shadow-xl">
					<Lock size={9} className="text-amber-400 flex-shrink-0" />
					<span className="text-[11px] text-[#ccc]">{label}</span>
					<a href="/#pricing" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
						Upgrade →
					</a>
				</div>
				{/* Arrow */}
				<div className="w-2 h-2 bg-[#1c1c1c] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
			</div>
		</div>
	)
}

// Plan banner shown to free users — compact strip with locked feature chips
function PlanBanner({ plan }: { plan: string }) {
	const isPro = plan === "pro" || plan === "enterprise"

	if (isPro) {
		return (
			<div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-indigo-600/[0.07] border border-indigo-500/20 w-fit">
				<div className="w-4 h-4 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
					<Check size={9} className="text-indigo-400" />
				</div>
				<span className="text-[12px] font-semibold text-indigo-400 capitalize">{plan} Plan</span>
				<span className="text-[11px] text-[#444]">· All features unlocked</span>
			</div>
		)
	}

	return (
		<div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-[12px] bg-white/[0.02] border border-white/[0.07]">
			<div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap gap-y-2">
				<span className="text-[11.5px] font-semibold text-[#888] px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] whitespace-nowrap flex-shrink-0">
					Free Plan
				</span>
				<div className="flex flex-wrap gap-1.5">
					{FREE_FEATURES.map((f) => (
						<span key={f} className="inline-flex items-center gap-1 text-[11px] text-[#555] bg-white/[0.02] border border-white/[0.06] rounded-full px-2 py-0.5">
							<Check size={8} className="text-emerald-500" />{f}
						</span>
					))}
					{PRO_LOCKED.map((f) => (
						<span key={f} className="inline-flex items-center gap-1 text-[11px] text-[#3a3a3a] bg-white/[0.01] border border-white/[0.04] rounded-full px-2 py-0.5">
							<Lock size={8} className="text-[#3a3a3a]" />{f}
						</span>
					))}
				</div>
			</div>
			<a
				href="/#pricing"
				className="flex-shrink-0 inline-flex items-center gap-1.5 h-7 px-3 text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150 whitespace-nowrap"
			>
				<Zap size={11} />
				Upgrade to Pro
			</a>
		</div>
	)
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
}: Props) {
	const [filters, setFilters] = useState<FilterState>({
		priority: [],
		search: "",
	});

	return (
		<div className="flex-1 flex flex-col min-h-0">

			{/* Topbar */}
			<div className="h-[50px] border-b border-border flex items-center justify-between pl-14 pr-4 md:px-5 flex-shrink-0 bg-background z-10">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-[13px] text-muted-foreground hidden sm:inline">Workspace /</span>
					<span className="text-[13px] font-semibold text-foreground truncate">
						Dashboard
					</span>
				</div>

				{/* Desktop-only right side — on mobile everything moves to sidebar / action bar */}
				<div className="hidden md:flex items-center gap-3 flex-shrink-0">
					<SignOutButton />

					<button
						type="button"
						onClick={() => {
							document.dispatchEvent(
								new KeyboardEvent("keydown", {
									key: "k",
									metaKey: true,
									bubbles: true,
								}),
							);
						}}
						className="flex items-center gap-2 h-7 px-3 text-[12px] text-muted-foreground border border-border rounded-[7px] hover:border-border/80 hover:text-foreground transition-colors"
					>
						<Search size={12} />
						<span>Search</span>
						<kbd className="text-[10px] border border-border rounded px-1 ml-1">
							⌘K
						</kbd>
					</button>

					<BoardFilters onFilterChange={setFilters} />

					{projectId && (
						<>
							<NewTaskDialog projectId={projectId}>
								<div className="h-7 px-3 text-[12px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none cursor-pointer flex items-center font-semibold transition-all duration-100 whitespace-nowrap">
									+ New task
								</div>
							</NewTaskDialog>

							<ProGate plan={plan} label="AI tasks · Pro feature">
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

					<ProfileDropdown user={user} />
				</div>
			</div>

			{/* Mobile action bar — icon-only controls, hidden on desktop */}
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

			<div className="flex-1 overflow-auto">
			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
				{/* Welcome */}
				<div>
					<h1 className="text-[20px] font-bold text-foreground tracking-tight">
						Good day, {firstName}
					</h1>
					<p className="text-[13px] text-muted-foreground mt-1">
						Here what happening across your projects.
					</p>
				</div>

				{/* Plan banner */}
				<PlanBanner plan={plan} />

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
					{stats.map((stat, index) => (
						<div
							key={stat.label}
							className="bg-card border border-border rounded-[10px] p-4 hover:border-border/80 transition-colors"
						>
							<p className="text-[11px] font-medium text-muted-foreground mb-2">
								{stat.label}
							</p>
							<p
								className={`text-[26px] font-bold tracking-tight leading-none ${stat.valueColor}`}
							>
								<AnimatedCounter value={stat.value} duration={1500} delay={index * 150} />
							</p>
							<p className="text-[11px] font-medium text-muted-foreground/60 mt-1.5">
								{stat.sub}
							</p>
						</div>
					))}
				</div>

				{/* Board */}
				<div>
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-[13px] font-semibold text-foreground">
							Task board
						</h2>
					</div>
					<TaskBoardWrapper
						columns={columns}
						userName={userName}
						filters={filters}
						projects={projects}
						workspaceId={workspaceId}
					/>
				</div>
			</div>
			</div>
		</div>
	);
}
