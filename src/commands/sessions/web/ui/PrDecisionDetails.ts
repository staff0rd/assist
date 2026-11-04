import type { PreviewDecisionFields } from "../../shared/PreviewDecision";
import type { PreviewAttachment } from "../../shared/PreviewAttachment";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrPreviewChain } from "./PrPreviewChain";

export type PrDecisionDetails = PrPreviewChain &
	Pick<
		PreviewDecisionFields,
		| "reason"
		| "body"
		| "autostart"
		| "selection"
		| "checklist"
		| "reviewEvent"
		| "reviewComments"
		| "dismissed"
		| "restart"
		| "answers"
	> & {
		comments: PrPreviewComment[];
		screenshots: PreviewAttachment[];
	};
