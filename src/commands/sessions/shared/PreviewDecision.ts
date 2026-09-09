import type { PrPreviewComment } from "./SessionInfoBase";

export type PreviewSelection = {
	topLeft: string;
	bottomRight: string;
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
};

export type PreviewDecision = PreviewDecisionFields & {
	decision: "approve" | "reject";
};
