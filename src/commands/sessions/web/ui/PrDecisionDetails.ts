import type {
	PreviewChecklistItem,
	PreviewSelection,
} from "../../shared/PreviewDecision";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrPreviewChain } from "./PrPreviewChain";

export type PrDecisionDetails = PrPreviewChain & {
	comments: PrPreviewComment[];
	screenshots: string[];
	body?: string;
	selection?: PreviewSelection;
	checklist?: PreviewChecklistItem[];
};
