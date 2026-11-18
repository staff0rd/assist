import { backlogRunArgs } from "./backlogRunArgs";
import type { CommandType } from "./SessionInfoBase";
import { sessionConversationTarget } from "./sessionConversationTarget";
import { resolveHarness } from "../../../shared/harnessAdapters/harnessLabel";
import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import type { HarnessKind } from "../../../shared/harnesses";

type TransferCandidate = {
	commandType?: CommandType;
	harness?: HarnessKind;
	assistArgs?: string[];
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export type TransferPlan =
	| { kind: "backlog-run"; args: string[] }
	| { kind: "prompt"; conversationId: string; harness: HarnessKind };

export const TRANSFER_UNSUPPORTED =
	"only backlog run and resumable prompt sessions can be transferred";

export function transferPlan(
	session: TransferCandidate,
): TransferPlan | undefined {
	const args = backlogRunArgs(session);
	if (args) return { kind: "backlog-run", args };
	if (session.commandType !== "claude" || session.assistArgs) return undefined;
	const harness = resolveHarness(session.harness);
	if (!harnessCapability(harness, "conversation.transfer").supported)
		return undefined;
	const target = sessionConversationTarget(session);
	if (!target) return undefined;
	return { kind: "prompt", conversationId: target.conversationId, harness };
}
