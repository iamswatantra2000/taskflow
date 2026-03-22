// components/features/ProfileDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateDisplayName, changePassword } from "@/lib/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	User,
	KeyRound,
	Sun,
	Moon,
	LogOut,
	ChevronRight,
	X,
	Check,
} from "lucide-react";

type Props = {
	user: {
		name?: string | null;
		email?: string | null;
	};
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// ——— Change Name Form ———
function ChangeNameForm({
	currentName,
	onDone,
}: {
	currentName: string;
	onDone: () => void;
}) {
	const [name, setName] = useState(currentName);
	const [loading, setLoading] = useState(false);

	
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (name.trim() === currentName) { onDone(); return }
  setLoading(true)
  try {
    const fd = new FormData()
    fd.set("name", name)
    await updateDisplayName(fd)
    toast.success("Name updated!")
    onDone()
    // Force full page reload to refresh session data
    window.location.href = "/"
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to update name")
  } finally {
    setLoading(false)
  }
}

	return (
		<form onSubmit={handleSubmit} className="p-3 space-y-3">
			<div className="flex items-center gap-2 mb-1">
				<button
					type="button"
					onClick={onDone}
					className="text-[#555] hover:text-[#999] transition-colors"
				>
					<X size={13} />
				</button>
				<span className="text-[12px] font-medium text-[#e0e0e0]">
					Change name
				</span>
			</div>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
				className="w-full bg-[#0d0d0d] dark:bg-[#0d0d0d] border border-[#2a2a2a] rounded-[7px] px-3 py-1.5 text-[12px] text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
			/>
			<button
				type="submit"
				disabled={loading || !name.trim()}
				className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[12px] font-medium py-1.5 rounded-[7px] transition-colors"
			>
				{loading ? "Saving..." : "Save name"}
			</button>
		</form>
	);
}

// ——— Change Password Form ———
function ChangePasswordForm({ onDone }: { onDone: () => void }) {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (next !== confirm) {
			toast.error("New passwords do not match");
			return;
		}
		setLoading(true);
		try {
			const fd = new FormData();
			fd.set("currentPassword", current);
			fd.set("newPassword", next);
			await changePassword(fd);
			toast.success("Password changed!");
			onDone();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to change password",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="p-3 space-y-2.5">
			<div className="flex items-center gap-2 mb-1">
				<button
					type="button"
					onClick={onDone}
					className="text-[#555] hover:text-[#999] transition-colors"
				>
					<X size={13} />
				</button>
				<span className="text-[12px] font-medium text-[#e0e0e0]">
					Change password
				</span>
			</div>

			{[
				{ label: "Current password", value: current, setValue: setCurrent },
				{ label: "New password", value: next, setValue: setNext },
				{ label: "Confirm new", value: confirm, setValue: setConfirm },
			].map(({ label, value, setValue }) => (
				<div key={label}>
					{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="text-[11px] text-[#555] block mb-1">{label}</label>
					<input
						type="password"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						required
						placeholder="••••••••"
						className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[7px] px-3 py-1.5 text-[12px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 transition-colors"
					/>
				</div>
			))}

			{/* Password match indicator */}
			{confirm.length > 0 && (
				<p
					className={`text-[11px] flex items-center gap-1 ${
						next === confirm ? "text-emerald-400" : "text-red-400"
					}`}
				>
					{next === confirm ? (
						<>
							<Check size={10} /> Passwords match
						</>
					) : (
						<>
							<X size={10} /> Passwords do not match
						</>
					)}
				</p>
			)}

			<button
				type="submit"
				disabled={loading || next !== confirm || !current || !next}
				className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[12px] font-medium py-1.5 rounded-[7px] transition-colors"
			>
				{loading ? "Saving..." : "Change password"}
			</button>
		</form>
	);
}

// ——— Main dropdown ———
export function ProfileDropdown({ user }: Props) {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<"menu" | "name" | "password">("menu");
	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
				setView("menu");
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	function close() {
		setOpen(false);
		setView("menu");
	}

	const isDark = theme === "dark";

	return (
		<div className="relative" ref={ref}>
			{/* Avatar trigger */}
			<button
				type="button"
				onClick={() => {
					setOpen(!open);
					setView("menu");
				}}
				className="focus:outline-none"
			>
				<Avatar className="h-7 w-7 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500 transition-all">
					<AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 text-[11px]">
						{getInitials(user.name ?? "User")}
					</AvatarFallback>
				</Avatar>
			</button>

			{/* Dropdown */}
			{open && (
				<div className="absolute right-0 top-9 w-[240px] bg-[#161616] border border-[#2a2a2a] rounded-[12px] shadow-2xl z-50 overflow-hidden">
					{view === "menu" && (
						<>
							{/* Profile header */}
							<div className="p-3 border-b border-[#222]">
								<div className="flex items-center gap-3">
									<Avatar className="h-9 w-9">
										<AvatarFallback className="text-[13px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
											{getInitials(user.name ?? "User")}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="text-[13px] font-medium text-[#f0f0f0] truncate">
											{user.name}
										</p>
										<p className="text-[11px] text-[#555] truncate">
											{user.email}
										</p>
									</div>
								</div>
							</div>

							{/* Menu items */}
							<div className="p-1.5 space-y-0.5">
								{/* Change name */}
								<button
									type="button"
									onClick={() => setView("name")}
									className="w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] hover:bg-[#1f1f1f] transition-colors group"
								>
									<div className="flex items-center gap-2.5">
										<User size={13} className="text-[#555]" />
										<span className="text-[12px] text-[#ccc]">Change name</span>
									</div>
									<ChevronRight
										size={12}
										className="text-[#444] group-hover:text-[#666] transition-colors"
									/>
								</button>

								{/* Change password */}
								<button
									type="button"
									onClick={() => setView("password")}
									className="w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] hover:bg-[#1f1f1f] transition-colors group"
								>
									<div className="flex items-center gap-2.5">
										<KeyRound size={13} className="text-[#555]" />
										<span className="text-[12px] text-[#ccc]">
											Change password
										</span>
									</div>
									<ChevronRight
										size={12}
										className="text-[#444] group-hover:text-[#666] transition-colors"
									/>
								</button>

								{/* Theme toggle */}
								<button
									type="button"
									onClick={() => setTheme(isDark ? "light" : "dark")}
									className="w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] hover:bg-[#1f1f1f] transition-colors"
								>
									<div className="flex items-center gap-2.5">
										{isDark ? (
											<Sun size={13} className="text-[#555]" />
										) : (
											<Moon size={13} className="text-[#555]" />
										)}
										<span className="text-[12px] text-[#ccc]">
											{isDark ? "Light mode" : "Dark mode"}
										</span>
									</div>
									{/* Toggle pill */}
									<div
										className={`w-8 h-4 rounded-full transition-colors relative ${
											isDark ? "bg-[#2a2a2a]" : "bg-indigo-600"
										}`}
									>
										<div
											className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
												isDark ? "left-0.5" : "left-4"
											}`}
										/>
									</div>
								</button>
							</div>

							{/* Divider + sign out */}
							<div className="p-1.5 border-t border-[#1f1f1f]">
								<button
									type="button"
									onClick={() => signOut({ callbackUrl: "/login" })}
									className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] hover:bg-red-950 transition-colors group"
								>
									<LogOut
										size={13}
										className="text-[#555] group-hover:text-red-400 transition-colors"
									/>
									<span className="text-[12px] text-[#888] group-hover:text-red-400 transition-colors">
										Sign out
									</span>
								</button>
							</div>
						</>
					)}

					{view === "name" && (
						<ChangeNameForm
							currentName={user.name ?? ""}
							onDone={() => setView("menu")}
						/>
					)}

					{view === "password" && (
						<ChangePasswordForm onDone={() => setView("menu")} />
					)}
				</div>
			)}
		</div>
	);
}
