import type { AssistLaunchMeta } from "../../../../resumeSessionAction";
import { autoStartLabel, type NewSessionMode } from "./newSessionModes";

export function assistMetaFor(
	mode: NewSessionMode,
	node?: string,
	autoApprove?: boolean,
	open?: boolean,
): [AssistLaunchMeta?] {
	const autoStart = autoApprove === true && autoStartLabel(mode) !== undefined;
	if (!node && !autoStart && !open) return [];
	return [
		{
			...(node && { node }),
			...(autoStart && { autoApprove: true }),
			...(open && { open: true }),
		},
	];
}
