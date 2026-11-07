import type {
	PreviewDecision,
	PreviewDecisionFields,
	PreviewReviewEvent,
} from "./PreviewDecision";
import { toAnswers } from "./toAnswers";
import { toAttachments } from "./toAttachments";
import { toChecklist } from "./toChecklist";
import { toReviewComments } from "./toReviewComments";
import { toStartTarget } from "./toStartTarget";
import { toSelection } from "./toSelection";

const REVIEW_EVENTS: PreviewReviewEvent[] = [
	"APPROVE",
	"COMMENT",
	"REQUEST_CHANGES",
];

export type DecisionMessage = PreviewDecisionFields & {
	type?: string;
	requestId?: string;
	decision?: string;
	message?: string;
};

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
		autostart: msg.autostart === true,
		startOn: msg.autostart === true ? toStartTarget(msg.startOn) : undefined,
		selection: toSelection(msg.selection),
		checklist: toChecklist(msg.checklist),
		reviewEvent: REVIEW_EVENTS.find((event) => event === msg.reviewEvent),
		reviewComments: toReviewComments(msg.reviewComments),
		dismissed: msg.dismissed === true,
		restart: msg.restart === true,
		answers: toAnswers(msg.answers),
	};
}
