const ASSIST_MODES = {
	"assist-draft": {
		label: "draft",
		args: ["draft", "--once"],
		prompt: true,
		nav: true,
	},
	"assist-bug": {
		label: "bug",
		args: ["bug", "--once"],
		prompt: true,
		nav: true,
	},
	"assist-next": {
		label: "next",
		args: ["next", "--once"],
		prompt: false,
		nav: true,
	},
	"assist-refine": {
		label: "refine",
		args: ["refine", "--once"],
		prompt: true,
		nav: false,
	},
} as const;

type AssistMode = keyof typeof ASSIST_MODES;
export type SessionMode = "free" | AssistMode;

function isAssistMode(mode: SessionMode): mode is AssistMode {
	return mode in ASSIST_MODES;
}

function getAssistArgs(mode: AssistMode, text?: string): string[] {
	const args: string[] = [...ASSIST_MODES[mode].args];
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

export const MODES: {
	value: AssistMode;
	label: string;
	prompt: boolean;
	nav: boolean;
}[] = Object.entries(ASSIST_MODES).map(([value, { label, prompt, nav }]) => ({
	value: value as AssistMode,
	label,
	prompt,
	nav,
}));

export const PLACEHOLDER = "Enter prompt...";
