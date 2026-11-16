import Box from "@mui/material/Box";
import type { PrPreview } from "../../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../../PrDecisionDetails";
import type { SessionInfo } from "../../../../../../types";
import { miroDecisionDetails } from "../../../../miroDecisionDetails";
import { ShowPane } from "../../../../ShowPane";

export function StackedShowPane({
	show,
	session,
	sendInput,
	onDecision,
}: {
	show: PrPreview;
	session?: SessionInfo | undefined;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	return (
		<Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
			<ShowPane
				key={show.requestId}
				preview={show}
				session={session}
				sendInput={sendInput}
				onClose={() =>
					onDecision(show.requestId, "reject", miroDecisionDetails())
				}
			/>
		</Box>
	);
}
