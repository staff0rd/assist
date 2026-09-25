import { dispatchMode } from "../../../../dispatchMode";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";

export function launchNewSession(
	mode: NewSessionMode,
	prompt: string,
	cwd: string,
	launchers: {
		onCreate: (prompt: string, cwd?: string) => void;
		onCreateAssist: (args: string[], cwd?: string) => void;
	},
) {
	if (mode === "prompt") {
		launchers.onCreate(prompt, cwd || undefined);
		return;
	}
	dispatchMode(
		newSessionModes[mode].sessionMode,
		cwd,
		launchers.onCreateAssist,
		() => {},
		prompt,
	);
}
