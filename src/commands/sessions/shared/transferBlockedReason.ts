import type { CommandType } from "./SessionInfoBase";
import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import type { HarnessKind } from "../../../shared/harnesses";

type PromptSession = {
	commandType?: CommandType;
	harness?: HarnessKind;
	assistArgs?: string[];
};

export function transferBlockedReason(
	session: PromptSession,
): string | undefined {
	if (session.commandType !== "claude" || session.assistArgs) return undefined;
	const status = harnessCapability(session.harness, "conversation.transfer");
	return status.supported ? undefined : status.reason;
}
