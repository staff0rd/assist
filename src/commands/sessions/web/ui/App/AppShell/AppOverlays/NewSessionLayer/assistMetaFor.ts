import type { AssistLaunchMeta } from "../../../../createSessionAction";
import { autoStartLabel, type NewSessionMode } from "./newSessionModes";

export function assistMetaFor(
	mode: NewSessionMode,
	node?: string,
	autoApprove?: boolean,
): [AssistLaunchMeta?] {
	const autoStart = autoApprove === true && autoStartLabel(mode) !== undefined;
	if (!node && !autoStart) return [];
	return [{ ...(node && { node }), ...(autoStart && { autoApprove: true }) }];
}
