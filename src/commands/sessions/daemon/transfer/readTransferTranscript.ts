import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import type { TransferredConversation } from "../../../../shared/harnessAdapters/TransferredConversation";
import type { TransferPlan } from "../../shared/transferPlan";

type TranscriptResult =
	| { ok: true; conversation: TransferredConversation | undefined }
	| { ok: false; error: string };

export async function readTransferTranscript(
	plan: TransferPlan,
): Promise<TranscriptResult> {
	if (plan.kind !== "prompt") return { ok: true, conversation: undefined };
	const { exportTranscript } = harnessAdapter(plan.harness).conversation;
	try {
		if (!exportTranscript)
			throw new Error(`${plan.harness} cannot export its transcript`);
		return {
			ok: true,
			conversation: await exportTranscript(plan.conversationId),
		};
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		return { ok: false, error: `transcript delivery failed: ${reason}` };
	}
}
