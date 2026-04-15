import type { CSSProperties } from "react";

export type SessionMode = "free" | "/draft" | "/bug" | "/next-backlog-item";

export const MODES: { value: SessionMode; label: string }[] = [
	{ value: "free", label: "Free" },
	{ value: "/draft", label: "/draft" },
	{ value: "/bug", label: "/bug" },
	{ value: "/next-backlog-item", label: "/next" },
];

export const PLACEHOLDERS: Record<SessionMode, string> = {
	free: "Enter prompt...",
	"/draft": "Optional context for draft...",
	"/bug": "Optional bug description...",
	"/next-backlog-item": "",
};

export function buildPrompt(mode: SessionMode, text: string): string {
	if (mode === "free") return text;
	if (mode === "/next-backlog-item") return "/next-backlog-item";
	return text ? `${mode} ${text}` : mode;
}

export function modeButtonStyle(active: boolean): CSSProperties {
	return {
		padding: "5px 10px",
		fontSize: 13,
		border: "1px solid",
		borderColor: active ? "#007acc" : "#555",
		borderRadius: 3,
		background: active ? "#007acc" : "transparent",
		color: active ? "#fff" : "#ccc",
		cursor: "pointer",
		transition: "all 0.15s",
	};
}

export const inputStyle: CSSProperties = {
	flex: 1,
	padding: "6px 10px",
	background: "#3c3c3c",
	border: "1px solid #555",
	borderRadius: 4,
	color: "#d4d4d4",
	fontSize: 13,
	outline: "none",
};

export function setFocusBorder(
	e: React.FocusEvent<HTMLInputElement>,
	color: string,
) {
	e.currentTarget.style.borderColor = color;
}
