import type { ReactNode } from "react";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import { PrPreviewSplit } from "./SessionPreviewSplit/PrPreviewSplit";
import type { SessionInfo } from "../../../types";

export type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function SessionPreviewSplit({
	session,
	sendPrDecision,
	sendInput,
	children,
}: {
	session: SessionInfo | undefined;
	sendPrDecision: SendPrDecision;
	sendInput: (sessionId: string, data: string) => void;
	children: ReactNode;
}) {
	return (
		<PrPreviewSplit
			preview={session?.pendingPrPreview ?? null}
			sessionId={session?.id}
			cwd={session?.cwd}
			sendInput={sendInput}
			onDecision={(requestId, decision, details) => {
				if (session) sendPrDecision(session.id, requestId, decision, details);
			}}
		>
			{children}
		</PrPreviewSplit>
	);
}
