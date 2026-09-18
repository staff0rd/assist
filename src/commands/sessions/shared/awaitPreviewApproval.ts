import type { PreviewDecision } from "./PreviewDecision";
import { reportPreviewRejection } from "./reportPreviewRejection";
import {
	type PreviewRequest,
	requestPreviewDecision,
} from "./requestPreviewDecision";

type PreviewApprovalOptions = {
	saveEditedBody?: (body: string) => void;
	rejectionAdvice?: string;
	rejectIsOutcome?: boolean;
};

export async function awaitPreviewApproval(
	subject: string,
	request: PreviewRequest,
	options: PreviewApprovalOptions = {},
): Promise<PreviewDecision> {
	console.log("Awaiting your approval in the assist web UI preview pane…");

	let decision: PreviewDecision;
	try {
		decision = await requestPreviewDecision(request);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}

	if (decision.body !== undefined) options.saveEditedBody?.(decision.body);
	if (decision.decision === "reject" && !options.rejectIsOutcome)
		reportPreviewRejection(subject, decision, options.rejectionAdvice);

	return decision;
}
