import { randomUUID } from "node:crypto";
import { isAgentHarness } from "../../../lib/isAgentHarness";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { formatItemId } from "../formatItemId";
import { renderPhaseSection } from "../renderPhaseSection";
import type { BacklogItem } from "../types";

type ProposedPhase = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
};

export async function reviewProposedPhase(
	item: BacklogItem,
	phaseIdx: number,
	phase: ProposedPhase,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!isAgentHarness() || process.env.ASSIST_SESSION !== "1" || !sessionId)
		return;

	await awaitPreviewApproval("Backlog phase preview", {
		sessionId,
		requestId: randomUUID(),
		title: `Add a phase to ${formatItemId(item.id)}: ${item.name}`,
		body: renderPhaseSection(phase, phaseIdx),
		prNumber: null,
		kind: "backlog-item",
		itemType: item.type,
	});
}
