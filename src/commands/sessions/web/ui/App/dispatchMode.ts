const ASSIST_MODE_ARGS = {
	"assist-draft": ["draft", "--once"],
	"assist-bug": ["bug", "--once"],
	"assist-refine": ["refine", "--once"],
} as const;

type AssistMode = keyof typeof ASSIST_MODE_ARGS;
export type SessionMode = "free" | AssistMode;

function isAssistMode(mode: SessionMode): mode is AssistMode {
	return mode in ASSIST_MODE_ARGS;
}

function getAssistArgs(mode: AssistMode, text?: string): string[] {
	const args: string[] = [...ASSIST_MODE_ARGS[mode]];
	const trimmed = text?.trim();
	if (trimmed) args.push(trimmed);
	return args;
}

export function dispatchMode(
	m: SessionMode,
	cwd: string,
	onCreateAssist: (args: string[], cwd?: string) => void,
	setMode: (m: SessionMode) => void,
	text?: string,
): void {
	if (isAssistMode(m) && cwd) {
		onCreateAssist(getAssistArgs(m, text), cwd);
		return;
	}
	setMode(m);
}

export const PLACEHOLDER = "Enter prompt...";
