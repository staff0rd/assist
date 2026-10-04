import type {
	PreviewChecklistItem,
	PreviewSelection,
} from "../../shared/PreviewDecision";
import type { PreviewAttachment } from "../../shared/PreviewAttachment";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrPreviewChain } from "./PrPreviewChain";

export type PrDecisionDetails = PrPreviewChain & {
	comments: PrPreviewComment[];
	screenshots: PreviewAttachment[];
	body?: string;
	selection?: PreviewSelection;
	checklist?: PreviewChecklistItem[];
};
