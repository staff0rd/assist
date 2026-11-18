import { resumeSession } from "../resumeSession";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { placeClaudeTranscript } from "./placeClaudeTranscript";
import { spawnRestored } from "./spawnRestored";
import type { TransferredConversation } from "./TransferredConversation";
import type { TransferSnapshot } from "./TransferSnapshot";

type TransferredPrompt = {
	cwd: string | undefined;
	conversation: TransferredConversation;
	snapshot: TransferSnapshot;
	title?: string;
	subtitle?: string;
	traceId?: string;
};

export function spawnTransferredConversation(
	ctx: TreeSpawnContext,
	discard: (id: string) => void,
	{ cwd, conversation, snapshot, title, subtitle, traceId }: TransferredPrompt,
	context?: SpawnContext,
): Promise<string> {
	return spawnRestored(
		ctx,
		discard,
		{
			cwd,
			create: (sid, resolvedCwd) => ({
				...resumeSession(
					sid,
					conversation.id,
					resolvedCwd ?? cwd ?? "",
					title,
					true,
					"claude",
				),
				title,
				subtitle,
			}),
			snapshot,
			traceId,
			afterRestore: async (path) => {
				await placeClaudeTranscript(conversation, path);
			},
		},
		context,
	);
}
