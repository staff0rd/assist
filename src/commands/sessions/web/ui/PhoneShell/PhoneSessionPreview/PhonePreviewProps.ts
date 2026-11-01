import type { PrPreview } from "../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../PrDecisionDetails";
import type { SessionInfo } from "../../types";

export type PhonePreviewProps = {
	preview: PrPreview;
	session: SessionInfo;
	keyboardOpen: boolean;
	sendInput: (sessionId: string, data: string) => void;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
};
