import type {
	PreviewChecklistItem,
	PreviewReviewComment,
	PreviewReviewEvent,
	PreviewSelection,
} from "../../shared/PreviewDecision";
import type { PreviewAttachment } from "../../shared/PreviewAttachment";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrPreviewChain } from "./PrPreviewChain";

export type PrDecisionDetails = PrPreviewChain & {
	comments: PrPreviewComment[];
	screenshots: PreviewAttachment[];
	body?: string;
	autostart?: boolean;
	selection?: PreviewSelection;
	checklist?: PreviewChecklistItem[];
	reviewEvent?: PreviewReviewEvent;
	reviewComments?: PreviewReviewComment[];
	dismissed?: boolean;
	answers?: Record<string, string>;
};
