import type { ReactNode } from "react";
import type { PrPreview } from "../../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../../PrDecisionDetails";
import type { SessionInfo } from "../../../../../../types";

export type PrPreviewSlideInProps = {
	rendered: PrPreview | null;
	placeholder?: ReactNode;
	stackedShow?: PrPreview | undefined;
	session?: SessionInfo | undefined;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	open: boolean;
	onExited: () => void;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => boolean | void;
};
