import type { CSSProperties } from "react";

const ASSIST_MODES = {
	"assist-draft": { label: "\u25b6 /draft", args: ["draft"] },
	"assist-bug": { label: "\u25b6 /bug", args: ["bug"] },
	"assist-next": { label: "\u25b6 /next", args: ["next"] },
} as const;

type AssistMode = keyof typeof ASSIST_MODES;
export type SessionMode = "free" | AssistMode;

export function isAssistMode(mode: SessionMode): mode is AssistMode {
	return mode in ASSIST_MODES;
}

function getAssistArgs(mode: AssistMode): string[] {
	return [...ASSIST_MODES[mode].args];
}

export function dispatchMode(
	m: SessionMode,
	cwd: string,
	onCreateAssist: (args: string[], cwd?: string) => void,
	setMode: (m: SessionMode) => void,
): void {
	if (isAssistMode(m) && cwd) {
		onCreateAssist(getAssistArgs(m), cwd);
		return;
	}
	setMode(m);
}

export const MODES: { value: SessionMode; label: string }[] = [
	{ value: "free", label: "Free" },
	...Object.entries(ASSIST_MODES).map(([value, { label }]) => ({
		value: value as AssistMode,
		label,
	})),
];

export const PLACEHOLDER = "Enter prompt...";

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
