import { resumeSession } from "../resumeSession";
import type { SpawnContext } from "../types";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../../shared/harnesses";
import { spawnRestored } from "./spawnRestored";
import type { TransferredConversation } from "../../../../shared/harnessAdapters/TransferredConversation";
import type { TransferSnapshot } from "./TransferSnapshot";

type TransferredPrompt = {
	cwd: string | undefined;
	harness: HarnessKind;
	conversation: TransferredConversation;
	snapshot: TransferSnapshot;
	title?: string;
	subtitle?: string;
	traceId?: string;
};

export function spawnTransferredConversation(
	ctx: TreeSpawnContext,
	discard: (id: string) => void,
	{
		cwd,
		harness,
		conversation,
		snapshot,
		title,
		subtitle,
		traceId,
	}: TransferredPrompt,
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
					harness,
				),
				title,
				subtitle,
			}),
			snapshot,
			traceId,
			afterRestore: async (path) => {
				const { importTranscript } = harnessAdapter(harness).conversation;
				if (!importTranscript)
					throw new Error(`${harness} cannot import a transferred transcript`);
				await importTranscript(conversation, path);
			},
		},
		context,
	);
}
