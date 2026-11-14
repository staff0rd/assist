import type { PreviewDecision } from "./PreviewDecision";
import { deferToDaemon } from "./deferToDaemon";
import { exitNoPreview } from "./exitNoPreview";
import { reportPreviewRejection } from "./reportPreviewRejection";
import { supersededPreviewMessage } from "./supersededPreviewMessage";
import {
	type PreviewOutcome,
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
	if (await deferToDaemon()) process.exit(0);
	console.log("Awaiting your approval in the assist web UI preview pane…");

	let outcome: PreviewOutcome;
	try {
		outcome = await requestPreviewDecision(request);
	} catch (error) {
		exitNoPreview(error);
	}

	if (outcome === "superseded") {
		console.log(supersededPreviewMessage);
		process.exit(0);
	}

	if (outcome.body !== undefined) options.saveEditedBody?.(outcome.body);
	if (outcome.decision === "reject" && !options.rejectIsOutcome)
		reportPreviewRejection(subject, outcome, options.rejectionAdvice);

	return outcome;
}
