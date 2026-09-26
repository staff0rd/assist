import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { AssistLaunchMeta } from "../../../../createSessionAction";
import { dispatchMode } from "../../../dispatchMode";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";

export type NewSessionLaunchers = {
	onCreate: (prompt: string, cwd?: string, node?: string) => void;
	onCreateDesign: (prompt: string, cwd?: string, node?: string) => void;
	onCreateHarness: (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
	) => void;
	onCreateAssist: (
		args: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
};

type NewSessionLaunch = {
	mode: NewSessionMode;
	harness: HarnessKind;
	prompt: string;
	cwd: string;
	node?: string;
};

export function launchNewSession(
	{ mode, harness, prompt, cwd, node }: NewSessionLaunch,
	launchers: NewSessionLaunchers,
) {
	const target = cwd || undefined;
	const onNode: [string?] = node ? [node] : [];
	if (mode === "prompt") {
		if (harness === "claude") launchers.onCreate(prompt, target, ...onNode);
		else launchers.onCreateHarness(harness, prompt, target, ...onNode);
		return;
	}
	if (mode === "design") {
		launchers.onCreateDesign(prompt, target, ...onNode);
		return;
	}
	const assistMeta: [AssistLaunchMeta?] = node ? [{ node }] : [];
	dispatchMode(
		newSessionModes[mode].sessionMode,
		cwd,
		(args, assistCwd) =>
			launchers.onCreateAssist(args, assistCwd, ...assistMeta),
		() => {},
		prompt,
	);
}
