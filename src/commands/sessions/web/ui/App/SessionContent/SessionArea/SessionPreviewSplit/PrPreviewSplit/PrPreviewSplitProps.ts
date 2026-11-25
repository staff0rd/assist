import type { ReactNode } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../PrDecisionDetails";
import type { SessionInfo } from "../../../../../types";

export type PrPreviewSplitProps = {
	preview: PrPreview | null;
	stackedShow?: PrPreview | undefined;
	session?: SessionInfo | undefined;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => boolean | void;
	placeholder?: ReactNode;
	children: ReactNode;
};
