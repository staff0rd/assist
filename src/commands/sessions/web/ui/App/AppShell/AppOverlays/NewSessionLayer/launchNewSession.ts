import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { AssistLaunchMeta } from "../../../../resumeSessionAction";
import type { NewSessionMode } from "./newSessionModes";
import { launchAssistMode } from "./launchAssistMode";
import { createArgsFor } from "./createArgsFor";

export type NewSessionLaunchers = {
	onCreateDesign: (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
		model?: string,
	) => void;
	onCreateHarness: (
		harness: string,
		prompt: string,
		cwd?: string,
		node?: string,
		open?: boolean,
		model?: string,
	) => void;
	onCreateAssist: (
		args: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
};

export type NewSessionLaunch = {
	mode: NewSessionMode;
	harness: HarnessKind;
	model?: string;
	prompt: string;
	cwd: string;
	node?: string;
	autoApprove?: boolean;
	open?: boolean;
};

export function launchNewSession(
	{
		mode,
		harness,
		model,
		prompt,
		cwd,
		node,
		autoApprove,
		open,
	}: NewSessionLaunch,
	launchers: NewSessionLaunchers,
) {
	const target = cwd || undefined;
	const createArgs = createArgsFor(node, open, model);
	if (mode === "prompt") {
		launchers.onCreateHarness(harness, prompt, target, ...createArgs);
		return;
	}
	if (mode === "design") {
		launchers.onCreateDesign(harness, prompt, target, ...createArgs);
		return;
	}
	launchAssistMode(
		{ mode, harness, model, prompt, cwd, node, autoApprove, open },
		launchers.onCreateAssist,
	);
}
