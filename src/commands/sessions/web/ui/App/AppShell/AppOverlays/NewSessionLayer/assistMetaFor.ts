import type { AssistLaunchMeta } from "../../../../resumeSessionAction";
import { autoStartLabel, type NewSessionMode } from "./newSessionModes";

type AssistMetaFlags = {
	node?: string;
	autoApprove?: boolean;
	open?: boolean;
	yolo?: boolean;
};

export function assistMetaFor(
	mode: NewSessionMode,
	{ node, autoApprove, open, yolo }: AssistMetaFlags,
): [AssistLaunchMeta?] {
	const autoStart = autoApprove === true && autoStartLabel(mode) !== undefined;
	if (!node && !autoStart && !open && !yolo) return [];
	return [
		{
			...(node && { node }),
			...(autoStart && { autoApprove: true }),
			...(open && { open: true }),
			...(yolo && { yolo: true }),
		},
	];
}
