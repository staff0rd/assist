import type {
	PreviewChecklistItem,
	PreviewDecision,
	PreviewDecisionFields,
	PreviewSelection,
} from "./PreviewDecision";

export type DecisionMessage = PreviewDecisionFields & {
	type?: string;
	requestId?: string;
	decision?: string;
	message?: string;
};

function toSelection(value: unknown): PreviewSelection | undefined {
	const selection = value as PreviewSelection | undefined;
	if (
		typeof selection?.topLeft !== "string" ||
		typeof selection.bottomRight !== "string"
	)
		return undefined;
	return { topLeft: selection.topLeft, bottomRight: selection.bottomRight };
}

function toChecklist(value: unknown): PreviewChecklistItem[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.flatMap((entry) => {
		const { id, ticked, comment } = (entry ?? {}) as Record<string, unknown>;
		if (typeof id !== "string") return [];
		return [
			{
				id,
				ticked: ticked === true,
				...(typeof comment === "string" && comment !== "" ? { comment } : {}),
			},
		];
	});
}

export function toPreviewDecision(
	msg: DecisionMessage,
): PreviewDecision | null {
	if (msg.decision !== "approve" && msg.decision !== "reject") return null;
	return {
		decision: msg.decision,
		reason: msg.reason,
		comments: Array.isArray(msg.comments) ? msg.comments : undefined,
		screenshots: Array.isArray(msg.screenshots) ? msg.screenshots : undefined,
		body: typeof msg.body === "string" ? msg.body : undefined,
		reviewAfter: msg.reviewAfter === true,
		announceAfter: msg.announceAfter === true,
		draft: typeof msg.draft === "boolean" ? msg.draft : undefined,
		autoMerge: msg.autoMerge === true,
		selection: toSelection(msg.selection),
		checklist: toChecklist(msg.checklist),
	};
}
