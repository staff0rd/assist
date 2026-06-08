const ASSIST_MODES = {
	"assist-draft": { label: "draft", args: ["draft", "--once"] },
	"assist-bug": { label: "bug", args: ["bug", "--once"] },
	"assist-next": { label: "next", args: ["next", "--once"] },
} as const;

type AssistMode = keyof typeof ASSIST_MODES;
export type SessionMode = "free" | AssistMode;

function isAssistMode(mode: SessionMode): mode is AssistMode {
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

export const MODES: { value: AssistMode; label: string }[] = Object.entries(
	ASSIST_MODES,
).map(([value, { label }]) => ({
	value: value as AssistMode,
	label,
}));

export const PLACEHOLDER = "Enter prompt...";
