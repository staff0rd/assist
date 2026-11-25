import type { ReactNode } from "react";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import { useReopeningHighLevelReview } from "../../useReopeningHighLevelReview";
import { PrPreviewSplit } from "./SessionPreviewSplit/PrPreviewSplit";
import { ReopeningPlaceholder } from "./SessionPreviewSplit/ReopeningPlaceholder";
import type { SessionInfo } from "../../../types";

export type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => boolean;

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
	const reopeningPr = useReopeningHighLevelReview(session?.id);
	return (
		<PrPreviewSplit
			placeholder={
				reopeningPr !== undefined && !session?.pendingPrPreview ? (
					<ReopeningPlaceholder prNumber={reopeningPr} />
				) : undefined
			}
			preview={session?.pendingPrPreview ?? session?.pendingShow ?? null}
			stackedShow={session?.pendingPrPreview ? session.pendingShow : undefined}
			session={session}
			sessionId={session?.id}
			cwd={session?.cwd}
			sendInput={sendInput}
			onDecision={(requestId, decision, details) =>
				session
					? sendPrDecision(session.id, requestId, decision, details)
					: false
			}
		>
			{children}
		</PrPreviewSplit>
	);
}
