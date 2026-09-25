import type { PrPreview } from "../../../../../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../../../../../PrDecisionDetails";

export type PrPreviewPaneProps = {
	preview: PrPreview;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
};
