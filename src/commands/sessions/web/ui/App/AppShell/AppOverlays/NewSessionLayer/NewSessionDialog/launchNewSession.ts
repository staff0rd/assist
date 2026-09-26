import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { dispatchMode } from "../../../../dispatchMode";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";

export type NewSessionLaunchers = {
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateDesign: (prompt: string, cwd?: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
};

export function launchNewSession(
	mode: NewSessionMode,
	harness: HarnessKind,
	prompt: string,
	cwd: string,
	launchers: NewSessionLaunchers,
) {
	const target = cwd || undefined;
	if (mode === "prompt") {
		if (harness === "claude") launchers.onCreate(prompt, target);
		else launchers.onCreateHarness(harness, prompt, target);
		return;
	}
	if (mode === "design") {
		launchers.onCreateDesign(prompt, target);
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
