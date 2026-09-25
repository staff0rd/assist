import type { PrDecisionDetails } from "../../../../../../../../../../PrDecisionDetails";

export type PrPaneOptions = {
	requestId: string;
	sessionId: string | undefined;
	cwd: string | undefined;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
	isPr: boolean;
	screenshots: boolean;
	screenshotScope: string | undefined;
	resolvedDraft: boolean;
	initialBody: string;
	editable: boolean;
};
