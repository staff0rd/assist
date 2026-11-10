import { dispatchMode } from "../../../dispatchMode";
import { assistMetaFor } from "./assistMetaFor";
import type { NewSessionLaunch, NewSessionLaunchers } from "./launchNewSession";
import { newSessionModes } from "./newSessionModes";

export function launchAssistMode(
	{
		mode,
		harness,
		prompt,
		cwd,
		node,
		autoApprove,
		open,
	}: NewSessionLaunch & { mode: "draft" | "bug" },
	onCreateAssist: NewSessionLaunchers["onCreateAssist"],
) {
	const assistMeta = assistMetaFor(mode, node, autoApprove, open);
	dispatchMode(
		newSessionModes[mode].sessionMode,
		cwd,
		(args, assistCwd) =>
			onCreateAssist(
				[...args.slice(0, 2), "--harness", harness, ...args.slice(2)],
				assistCwd,
				...assistMeta,
			),
		() => {},
		prompt,
	);
}
