import { useState } from "react";

export function useColorMode() {
	const [mode, setMode] = useState<"light" | "dark">(() => {
		try {
			return (localStorage.getItem("theme-mode") as "light" | "dark") ?? "dark";
		} catch {
			return "dark";
		}
	});
	const toggle = () =>
		setMode((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			try {
				localStorage.setItem("theme-mode", next);
			} catch {}
			return next;
		});
	return { mode, toggle } as const;
}
