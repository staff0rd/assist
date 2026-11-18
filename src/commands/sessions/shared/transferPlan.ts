import { backlogRunArgs } from "./backlogRunArgs";
import type { CommandType } from "./SessionInfoBase";
import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import type { HarnessKind } from "../../../shared/harnesses";

type TransferCandidate = {
	commandType?: CommandType;
	harness?: HarnessKind;
	assistArgs?: string[];
	claudeSessionId?: string;
};

export type TransferPlan =
	| { kind: "backlog-run"; args: string[] }
	| { kind: "prompt"; conversationId: string };

export const TRANSFER_UNSUPPORTED =
	"only backlog run and resumable prompt sessions can be transferred";

export function transferPlan(
	session: TransferCandidate,
): TransferPlan | undefined {
	const args = backlogRunArgs(session);
	if (args) return { kind: "backlog-run", args };
	if (session.commandType !== "claude" || session.assistArgs) return undefined;
	if (!harnessCapability(session.harness, "conversation.transfer").supported)
		return undefined;
	if (!session.claudeSessionId) return undefined;
	return { kind: "prompt", conversationId: session.claudeSessionId };
}
