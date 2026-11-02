import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { AssistLaunchMeta } from "../../../../createSessionAction";
import { dispatchMode } from "../../../dispatchMode";
import {
	autoStartLabel,
	type NewSessionMode,
	newSessionModes,
} from "./newSessionModes";

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
	autoApprove?: boolean;
};

function assistMetaFor(
	mode: NewSessionMode,
	node?: string,
	autoApprove?: boolean,
): [AssistLaunchMeta?] {
	const autoStart = autoApprove === true && autoStartLabel(mode) !== undefined;
	if (!node && !autoStart) return [];
	return [{ ...(node && { node }), ...(autoStart && { autoApprove: true }) }];
}

export function launchNewSession(
	{ mode, harness, prompt, cwd, node, autoApprove }: NewSessionLaunch,
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
	const assistMeta = assistMetaFor(mode, node, autoApprove);
	dispatchMode(
		newSessionModes[mode].sessionMode,
		cwd,
		(args, assistCwd) =>
			launchers.onCreateAssist(args, assistCwd, ...assistMeta),
		() => {},
		prompt,
	);
}
