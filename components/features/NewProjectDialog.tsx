// components/features/NewProjectDialog.tsx
"use client";

import { useState, useRef } from "react";
import { createProject } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const COLORS = [
	"#6366f1",
	"#8b5cf6",
	"#ec4899",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
];

export function NewProjectDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [color, setColor] = useState(COLORS[0]);
	const formRef = useRef<HTMLFormElement>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const fd = new FormData(formRef.current!);
			fd.set("color", color);
			await createProject(fd);
			toast.success("Project created!");
			setOpen(false);
			formRef.current?.reset();
			setColor(COLORS[0]);
			router.refresh();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to create project",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<div
					className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5 rounded"
					title="New project"
				>
					<Plus size={12} />
				</div>
			</DialogTrigger>
			<DialogContent className="bg-card border-border max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-[15px] font-semibold">
						New project
					</DialogTitle>
				</DialogHeader>

				<form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-2">
					<div className="space-y-1.5">
						{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="text-[12px] font-medium text-muted-foreground">
							Project name
						</label>
						<input
							name="name"
							placeholder="e.g. Website redesign"
							required
							autoFocus
							className="w-full bg-background border border-border rounded-[8px] px-3 py-2 text-[13px] text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>

					<div className="space-y-1.5">
						{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="text-[12px] font-medium text-muted-foreground">
							Description{" "}
							<span className="text-muted-foreground/50">(optional)</span>
						</label>
						<textarea
							name="description"
							placeholder="What is this project about?"
							rows={2}
							className="w-full bg-background border border-border rounded-[8px] px-3 py-2 text-[13px] text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
						/>
					</div>

					<div className="space-y-1.5">
						{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="text-[12px] font-medium text-muted-foreground">
							Color
						</label>
						<div className="flex items-center gap-2 flex-wrap">
							{COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setColor(c)}
									className="w-6 h-6 rounded-full transition-transform hover:scale-110 relative"
									style={{ background: c }}
								>
									{color === c && (
										<span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
											✓
										</span>
									)}
								</button>
							))}
						</div>
					</div>

					<div className="flex items-center justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="h-8 px-3.5 text-[12px] font-medium text-slate-500 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#888] bg-slate-50 dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-[#161616] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15 rounded-[8px] shadow-[0_3px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_3px_0_0_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-none transition-all duration-100"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="h-8 px-3.5 text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white border border-indigo-700/80 rounded-[8px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100"
						>
							{loading ? "Creating..." : "Create project"}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
