// components/features/BoardFilters.tsx
"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export type FilterState = {
	priority: string[];
	search: string;
};

type Props = {
	onFilterChange: (filters: FilterState) => void;
};

export function BoardFilters({ onFilterChange }: Props) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [priorities, setPriorities] = useState<string[]>([]);

	const priorities_list = ["LOW", "MEDIUM", "HIGH", "URGENT"];

	const priorityLabels: Record<string, string> = {
		LOW: "Low",
		MEDIUM: "Medium",
		HIGH: "High",
		URGENT: "Urgent",
	};

	const priorityColors: Record<string, string> = {
		LOW: "bg-emerald-950 text-emerald-400 border-emerald-900",
		MEDIUM: "bg-amber-950 text-amber-400 border-amber-900",
		HIGH: "bg-red-950 text-red-400 border-red-900",
		URGENT: "bg-red-950 text-red-400 border-red-900",
	};

	function togglePriority(p: string) {
		const next = priorities.includes(p)
			? priorities.filter((x) => x !== p)
			: [...priorities, p];
		setPriorities(next);
		onFilterChange({ priority: next, search });
	}

	function handleSearch(value: string) {
		setSearch(value);
		onFilterChange({ priority: priorities, search: value });
	}

	function clearAll() {
		setPriorities([]);
		setSearch("");
		onFilterChange({ priority: [], search: "" });
	}

	const activeCount = priorities.length + (search ? 1 : 0);

	return (
		<div className="relative">
			<div className="flex items-center gap-2">
				{/* Search input */}
				<div className="relative">
					<input
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search..."
						className="w-[110px] sm:w-[180px] bg-[#111] border border-[#2a2a2a] rounded-[7px] px-3 py-1.5 text-[12px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 transition-colors"
					/>
					{search && (
						// biome-ignore lint/a11y/useButtonType: <explanation>
						<button
							onClick={() => handleSearch("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999]"
						>
							<X size={11} />
						</button>
					)}
				</div>

				{/* Filter button */}
				{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
				<button
					onClick={() => setOpen(!open)}
					className={`flex items-center gap-1.5 h-7 px-3 text-[12px] rounded-[7px] border transition-colors ${
						activeCount > 0
							? "bg-indigo-950 border-indigo-800 text-indigo-400"
							: "bg-transparent border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a] hover:text-[#ccc]"
					}`}
				>
					<SlidersHorizontal size={12} />
					Filter
					{activeCount > 0 && (
						<span className="bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
							{activeCount}
						</span>
					)}
				</button>

				{/* Clear all */}
				{activeCount > 0 && (
					// biome-ignore lint/a11y/useButtonType: <explanation>
					<button
						onClick={clearAll}
						className="text-[11px] text-[#555] hover:text-[#999] transition-colors flex items-center gap-1"
					>
						<X size={10} />
						Clear
					</button>
				)}
			</div>

			{/* Filter dropdown */}
			{open && (
				<div className="absolute top-10 right-0 bg-[#161616] border border-[#2a2a2a] rounded-[10px] p-3 z-50 w-[200px] shadow-xl">
					<p className="text-[11px] font-medium text-[#555] uppercase tracking-wider mb-2">
						Priority
					</p>
					<div className="space-y-1">
						{priorities_list.map((p) => (
							// biome-ignore lint/a11y/useButtonType: <explanation>
							<button
								key={p}
								onClick={() => togglePriority(p)}
								className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[6px] transition-colors ${
									priorities.includes(p) ? "bg-[#1e1e2e]" : "hover:bg-[#1f1f1f]"
								}`}
							>
								<span
									className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] border ${priorityColors[p]}`}
								>
									{priorityLabels[p]}
								</span>
								{priorities.includes(p) && (
									<span className="text-indigo-400 text-[10px]">✓</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
