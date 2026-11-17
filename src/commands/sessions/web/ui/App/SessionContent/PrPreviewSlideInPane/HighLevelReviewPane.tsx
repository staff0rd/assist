import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import type { SessionInfo } from "../../../types";
import { HighLevelReviewPaneView } from "./HighLevelReviewPane/HighLevelReviewPaneView";
import { useHighLevelStoredProgress } from "./HighLevelReviewPane/highLevelStoredProgress/useHighLevelStoredProgress";

export function HighLevelReviewPane({
	preview,
	session,
	sendInput,
	onDecision,
}: {
	preview: PrPreview;
	session?: SessionInfo | undefined;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const stored = useHighLevelStoredProgress(preview, session?.node);
	return (
		<HighLevelReviewPaneView
			key={stored.version}
			preview={preview}
			session={session}
			sendInput={sendInput}
			stored={stored}
			onDecision={onDecision}
		/>
	);
}
