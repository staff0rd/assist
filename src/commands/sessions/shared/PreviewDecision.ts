import type { PreviewAttachment } from "./PreviewAttachment";
import type { PrPreviewComment } from "./SessionInfoBase";

export type PreviewSelection = {
	topLeft: string;
	bottomRight: string;
};

export type PreviewChecklistItem = {
	id: string;
	ticked: boolean;
	comment?: string;
};

export type PreviewReviewEvent = "APPROVE" | "COMMENT" | "REQUEST_CHANGES";

export type PreviewReviewSide = "LEFT" | "RIGHT";

export type PreviewReviewComment = {
	path: string;
	startLine: number;
	endLine: number;
	quote: string;
	note: string;
	startSide?: PreviewReviewSide;
	side?: PreviewReviewSide;
};

export type PreviewDecisionFields = {
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: PreviewAttachment[];
	body?: string;
	reviewAfter?: boolean;
	announceAfter?: boolean;
	draft?: boolean;
	autoMerge?: boolean;
	autostart?: boolean;
	selection?: PreviewSelection;
	checklist?: PreviewChecklistItem[];
	reviewEvent?: PreviewReviewEvent;
	reviewComments?: PreviewReviewComment[];
	dismissed?: boolean;
	answers?: Record<string, string>;
};

export type PreviewDecision = PreviewDecisionFields & {
	decision: "approve" | "reject";
};
