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
