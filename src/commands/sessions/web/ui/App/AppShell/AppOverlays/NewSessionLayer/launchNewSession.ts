import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { AssistLaunchMeta } from "../../../../createSessionAction";
import { dispatchMode } from "../../../dispatchMode";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";
import { assistMetaFor } from "./assistMetaFor";
import { createArgsFor } from "./createArgsFor";

export type NewSessionLaunchers = {
	onCreate: (
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
	) => void;
	onCreateDesign: (
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
	) => void;
	onCreateHarness: (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
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
	autoApprove?: boolean;
	open?: boolean;
};

export function launchNewSession(
	{ mode, harness, prompt, cwd, node, autoApprove, open }: NewSessionLaunch,
	launchers: NewSessionLaunchers,
) {
	const target = cwd || undefined;
	const createArgs = createArgsFor(node, open);
	if (mode === "prompt") {
		if (harness === "claude") launchers.onCreate(prompt, target, ...createArgs);
		else launchers.onCreateHarness(harness, prompt, target, ...createArgs);
		return;
	}
	if (mode === "design") {
		launchers.onCreateDesign(prompt, target, ...createArgs);
		return;
	}
	const assistMeta = assistMetaFor(mode, node, autoApprove, open);
	dispatchMode(
		newSessionModes[mode].sessionMode,
		cwd,
		(args, assistCwd) =>
			launchers.onCreateAssist(args, assistCwd, ...assistMeta),
		() => {},
		prompt,
	);
}
