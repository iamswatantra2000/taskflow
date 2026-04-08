// components/features/BoardFilters.tsx
"use client";

import { useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";

export type FilterState = {
	priority: string[];
	search: string;
};

type Props = {
	onFilterChange: (filters: FilterState) => void;
	compact?: boolean; // icon-only mode for mobile
};

export function BoardFilters({ onFilterChange, compact = false }: Props) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [priorities, setPriorities] = useState<string[]>([]);
	const [searchOpen, setSearchOpen] = useState(false);

	const priorities_list = ["LOW", "MEDIUM", "HIGH", "URGENT"];

	const priorityLabels: Record<string, string> = {
		LOW: "Low",
		MEDIUM: "Medium",
		HIGH: "High",
		URGENT: "Urgent",
	};

	const priorityColors: Record<string, string> = {
		LOW: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
		MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
		HIGH: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
		URGENT: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
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
		setSearchOpen(false);
		onFilterChange({ priority: [], search: "" });
	}

	const activeCount = priorities.length + (search ? 1 : 0);

	// ——— Compact / icon-only mode (mobile action bar) ———
	if (compact) {
		return (
			<div className="relative flex items-center gap-1.5">

				{/* Search icon button */}
				<button
					type="button"
					onClick={() => {
						setSearchOpen(!searchOpen);
						if (searchOpen) handleSearch("");
					}}
					className={`w-8 h-8 flex items-center justify-center rounded-[7px] border transition-colors ${
						search
							? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400"
							: "border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-slate-300 dark:hover:border-[#3a3a3a] hover:text-slate-900 dark:hover:text-[#ccc]"
					}`}
				>
					{search ? <X size={13} /> : <Search size={13} />}
				</button>

				{/* Expandable search input */}
				{searchOpen && (
					<input
						// biome-ignore lint/a11y/noAutofocus: intentional
						autoFocus
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search tasks..."
						className="w-[140px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[7px] px-2.5 py-1.5 text-[12px] text-[var(--tf-text-primary)] placeholder-slate-300 dark:placeholder-[#444] outline-none focus:border-[var(--tf-accent)] transition-all"
					/>
				)}

				{/* Filter icon button */}
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className={`w-8 h-8 flex items-center justify-center rounded-[7px] border transition-colors relative ${
						priorities.length > 0
							? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400"
							: "border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-slate-300 dark:hover:border-[#3a3a3a] hover:text-slate-900 dark:hover:text-[#ccc]"
					}`}
				>
					<SlidersHorizontal size={13} />
					{priorities.length > 0 && (
						<span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
							{priorities.length}
						</span>
					)}
				</button>

				{/* Clear all — only when anything is active */}
				{activeCount > 0 && (
					<button
						type="button"
						onClick={clearAll}
						className="w-8 h-8 flex items-center justify-center rounded-[7px] border border-[var(--tf-border)] text-[var(--tf-text-tertiary)] hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900 transition-colors"
					>
						<X size={13} />
					</button>
				)}

				{/* Filter dropdown — horizontal */}
				{open && (
					<div className="absolute top-10 left-0 bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[8px] px-2 py-1.5 z-50 shadow-lg flex items-center gap-1">
						{priorities_list.map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => togglePriority(p)}
								className={`text-[11px] font-medium px-2 py-0.5 rounded-[5px] border transition-all ${
									priorities.includes(p)
										? priorityColors[p]
										: "border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-slate-300 dark:hover:border-white/20"
								}`}
							>
								{priorityLabels[p]}
							</button>
						))}
					</div>
				)}
			</div>
		);
	}

	// ——— Default / full mode (desktop topbar) ———
	return (
		<div className="relative">
			<div className="flex items-center gap-2">
				{/* Search input */}
				<div className="relative">
					<input
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search..."
						className="w-[180px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[7px] px-3 py-1.5 text-[12px] text-[var(--tf-text-primary)] placeholder-slate-300 dark:placeholder-[#444] outline-none focus:border-[var(--tf-accent)] transition-colors"
					/>
					{search && (
						<button
							type="button"
							onClick={() => handleSearch("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#999]"
						>
							<X size={11} />
						</button>
					)}
				</div>

				{/* Filter button */}
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className={`flex items-center gap-1.5 h-7 px-3 text-[12px] rounded-[7px] border transition-colors ${
						activeCount > 0
							? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400"
							: "bg-transparent border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-slate-300 dark:hover:border-[#3a3a3a] hover:text-slate-900 dark:hover:text-[#ccc]"
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
					<button
						type="button"
						onClick={clearAll}
						className="text-[11px] text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#999] transition-colors flex items-center gap-1"
					>
						<X size={10} />
						Clear
					</button>
				)}
			</div>

			{/* Filter dropdown — horizontal */}
			{open && (
				<div className="absolute top-10 right-0 bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[8px] px-2 py-1.5 z-50 shadow-lg flex items-center gap-1">
					{priorities_list.map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => togglePriority(p)}
							className={`text-[11px] font-medium px-2 py-0.5 rounded-[5px] border transition-all ${
								priorities.includes(p)
									? priorityColors[p]
									: "border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:border-slate-300 dark:hover:border-white/20"
							}`}
						>
							{priorityLabels[p]}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
