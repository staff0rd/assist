import type { PreviewAttachment } from "./PreviewAttachment";
import type {
	PreviewDecision,
	PreviewDecisionFields,
	PreviewSelection,
} from "./PreviewDecision";
import { toChecklist } from "./toChecklist";

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

function toAttachments(value: unknown): PreviewAttachment[] | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.flatMap((entry) => {
		const { path, alt } = (entry ?? {}) as Record<string, unknown>;
		if (typeof path !== "string" || path === "") return [];
		return [{ path, alt: typeof alt === "string" ? alt : "" }];
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
		screenshots: toAttachments(msg.screenshots),
		body: typeof msg.body === "string" ? msg.body : undefined,
		reviewAfter: msg.reviewAfter === true,
		announceAfter: msg.announceAfter === true,
		draft: typeof msg.draft === "boolean" ? msg.draft : undefined,
		autoMerge: msg.autoMerge === true,
		selection: toSelection(msg.selection),
		checklist: toChecklist(msg.checklist),
	};
}
