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

export type PreviewDecisionFields = {
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: string[];
	body?: string;
	reviewAfter?: boolean;
	announceAfter?: boolean;
	draft?: boolean;
	autoMerge?: boolean;
	selection?: PreviewSelection;
	checklist?: PreviewChecklistItem[];
};

export type PreviewDecision = PreviewDecisionFields & {
	decision: "approve" | "reject";
};
