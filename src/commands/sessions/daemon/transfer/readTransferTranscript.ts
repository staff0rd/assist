import { readFile } from "node:fs/promises";
import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import type { TransferPlan } from "../../shared/transferPlan";
import type { TransferredConversation } from "./TransferredConversation";

type TranscriptResult =
	| { ok: true; conversation: TransferredConversation | undefined }
	| { ok: false; error: string };

export async function readTransferTranscript(
	plan: TransferPlan,
): Promise<TranscriptResult> {
	if (plan.kind !== "prompt") return { ok: true, conversation: undefined };
	const id = plan.conversationId;
	try {
		const path = await harnessAdapter("claude").conversation.locate(id);
		if (!path) throw new Error(`no transcript found for ${id}`);
		return {
			ok: true,
			conversation: { id, transcript: await readFile(path, "utf8") },
		};
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		return { ok: false, error: `transcript delivery failed: ${reason}` };
	}
}
