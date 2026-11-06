import type { PreviewAttachment } from "../../../../../../shared/PreviewAttachment";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import type { PrChainDefaults } from "./usePrPane/usePrDecision/initialPrChain";

export type PrPaneOptions = {
	requestId: string;
	supersedes: string | undefined;
	sessionId: string | undefined;
	cwd: string | undefined;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
	isPr: boolean;
	screenshots: boolean;
	screenshotScope: string | undefined;
	seededScreenshots: PreviewAttachment[];
	chainDefaults: PrChainDefaults;
	initialBody: string;
	editable: boolean;
};
