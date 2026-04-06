// components/features/AnalyticsClient.tsx
"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	Legend,
} from "recharts";
import {
	TrendingUp,
	CheckSquare,
	Clock,
	Zap,
	FolderKanban,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type AnalyticsData = {
	statusData: { name: string; value: number; fill: string }[];
	priorityData: { name: string; value: number; fill: string }[];
	velocityData: { day: string; created: number; completed: number }[];
	tasksByProject: {
		projectName: string;
		color: string;
		total: number;
		done: number;
		inProgress: number;
	}[];
	summary: {
		totalTasks: number;
		completedTasks: number;
		completionRate: number;
		inProgressCount: number;
		mostActiveProject: string;
		totalProjects: number;
	};
};

type TooltipPayloadEntry = {
	name: string;
	value: number;
	color?: string;
	fill?: string;
};

type CustomTooltipProps = {
	active?: boolean;
	payload?: TooltipPayloadEntry[];
	label?: string;
};

type BarShapeProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	index: number;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[12px] shadow-lg">
			{label && <p className="text-slate-500 dark:text-[#888] mb-1">{label}</p>}
			{payload.map((entry) => (
				<p key={entry.name} style={{ color: entry.color ?? entry.fill }}>
					{entry.name}: <span className="font-semibold">{entry.value}</span>
				</p>
			))}
		</div>
	);
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
	const { statusData, priorityData, velocityData, tasksByProject, summary } =
		data;
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const gridColor  = isDark ? "#1f1f1f" : "#e2e8f0";
	const axisColor  = isDark ? "#1f1f1f" : "#e2e8f0";
	const tickColor  = isDark ? "#555555" : "#94a3b8";
	const legendColor = isDark ? "#888888" : "#64748b";

	return (
		<div className="flex-1 overflow-auto">
			{/* Topbar */}
			<div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-5 md:px-5 bg-white dark:bg-[#0d0d0d] sticky top-0 z-10">
				<div className="flex items-center gap-2">
					<span className="text-[13px] text-slate-400 dark:text-[#555] hidden sm:inline">Workspace /</span>
					<span className="text-[13px] font-medium text-slate-800 dark:text-[#e0e0e0]">
						Analytics
					</span>
				</div>
				<ThemeToggle />
			</div>

			<div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
				{/* Header */}
				<div>
					<h1 className="text-[18px] font-semibold text-slate-900 dark:text-[#f0f0f0] tracking-tight">
						Analytics
					</h1>
					<p className="text-[13px] text-slate-400 dark:text-[#555] mt-1">
						Track your team progress and productivity
					</p>
				</div>

				{/* Summary stats */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
					{[
						{
							label: "Total tasks",
							value: summary.totalTasks,
							icon: CheckSquare,
							color: "text-slate-800 dark:text-[#e0e0e0]",
						},
						{
							label: "Completed",
							value: summary.completedTasks,
							icon: CheckSquare,
							color: "text-emerald-600 dark:text-emerald-400",
						},
						{
							label: "In progress",
							value: summary.inProgressCount,
							icon: Clock,
							color: "text-indigo-600 dark:text-indigo-400",
						},
						{
							label: "Completion rate",
							value: `${summary.completionRate}%`,
							icon: TrendingUp,
							color: "text-amber-600 dark:text-amber-400",
						},
						{
							label: "Projects",
							value: summary.totalProjects,
							icon: FolderKanban,
							color: "text-violet-600 dark:text-violet-400",
						},
						{
							label: "Top project",
							value: summary.mostActiveProject,
							icon: Zap,
							color: "text-pink-600 dark:text-pink-400",
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[10px] p-4 hover:border-slate-200 dark:hover:border-[#2a2a2a] transition-colors"
						>
							<div className="flex items-center gap-2 mb-2">
								<stat.icon size={13} className="text-slate-400 dark:text-[#555]" />
								<p className="text-[11px] font-medium text-slate-400 dark:text-[#555]">
									{stat.label}
								</p>
							</div>
							<p
								className={`text-[20px] font-semibold tracking-tight leading-none truncate ${stat.color}`}
							>
								{stat.value}
							</p>
						</div>
					))}
				</div>

				{/* Charts row 1 — Velocity + Status */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Velocity chart */}
					<div className="lg:col-span-2 bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5">
						<h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0] mb-1">
							Task velocity
						</h3>
						<p className="text-[11px] text-slate-400 dark:text-[#555] mb-4">
							Tasks created vs completed over last 7 days
						</p>
						<ResponsiveContainer width="100%" height={220}>
							<LineChart
								data={velocityData}
								margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
								<XAxis
									dataKey="day"
									tick={{ fill: tickColor, fontSize: 10 }}
									axisLine={{ stroke: axisColor }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fill: tickColor, fontSize: 10 }}
									axisLine={{ stroke: axisColor }}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend wrapperStyle={{ fontSize: "11px", color: legendColor }} />
								<Line
									type="monotone"
									dataKey="created"
									name="Created"
									stroke="#6366f1"
									strokeWidth={2}
									dot={{ fill: "#6366f1", r: 3 }}
									activeDot={{ r: 5 }}
								/>
								<Line
									type="monotone"
									dataKey="completed"
									name="Completed"
									stroke="#10b981"
									strokeWidth={2}
									dot={{ fill: "#10b981", r: 3 }}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>

					{/* Status donut chart */}
					<div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5">
						<h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0] mb-1">
							Status breakdown
						</h3>
						<p className="text-[11px] text-slate-400 dark:text-[#555] mb-4">
							Distribution by status
						</p>
						<ResponsiveContainer width="100%" height={160}>
							<PieChart>
								<Pie
									data={statusData}
									cx="50%"
									cy="50%"
									innerRadius={45}
									outerRadius={70}
									paddingAngle={3}
									dataKey="value"
									fill="#6366f1"
								/>
								<Tooltip content={<CustomTooltip />} />
							</PieChart>
						</ResponsiveContainer>

						{/* Legend */}
						<div className="space-y-1.5 mt-2">
							{statusData.map((item) => (
								<div
									key={item.name}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<div
											className="w-2 h-2 rounded-full"
											style={{ background: item.fill }}
										/>
										<span className="text-[11px] text-slate-500 dark:text-[#888]">{item.name}</span>
									</div>
									<span className="text-[11px] font-medium text-slate-700 dark:text-[#ccc]">
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Charts row 2 — Priority + Projects */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Priority bar chart */}
					<div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5">
						<h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0] mb-1">
							Priority distribution
						</h3>
						<p className="text-[11px] text-slate-400 dark:text-[#555] mb-4">
							Tasks grouped by priority level
						</p>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart
								data={priorityData}
								margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={gridColor}
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									tick={{ fill: tickColor, fontSize: 11 }}
									axisLine={{ stroke: axisColor }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fill: tickColor, fontSize: 10 }}
									axisLine={{ stroke: axisColor }}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Bar
									dataKey="value"
									name="Tasks"
									radius={[4, 4, 0, 0]}
									shape={(props: BarShapeProps) => (
										<rect
											x={props.x}
											y={props.y}
											width={props.width}
											height={props.height}
											fill={priorityData[props.index]?.fill ?? "#6366f1"}
											rx={4}
											ry={4}
										/>
									)}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Projects breakdown */}
					<div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5">
						<h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0] mb-1">
							Project breakdown
						</h3>
						<p className="text-[11px] text-slate-400 dark:text-[#555] mb-4">
							Tasks per project with completion
						</p>

						{tasksByProject.length === 0 ? (
							<div className="flex items-center justify-center h-[200px]">
								<p className="text-[12px] text-slate-400 dark:text-[#444]">No projects yet</p>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={200}>
								<BarChart
									data={tasksByProject}
									margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke={gridColor}
										vertical={false}
									/>
									<XAxis
										dataKey="projectName"
										tick={{ fill: tickColor, fontSize: 10 }}
										axisLine={{ stroke: axisColor }}
										tickLine={false}
									/>
									<YAxis
										tick={{ fill: tickColor, fontSize: 10 }}
										axisLine={{ stroke: axisColor }}
										tickLine={false}
										allowDecimals={false}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend wrapperStyle={{ fontSize: "11px", color: legendColor }} />
									<Bar
										dataKey="total"
										name="Total"
										fill="#6366f1"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey="done"
										name="Completed"
										fill="#10b981"
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey="inProgress"
										name="In Progress"
										fill="#f59e0b"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
