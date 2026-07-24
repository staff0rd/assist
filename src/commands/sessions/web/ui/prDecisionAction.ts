import type { PrPreviewComment } from "../../shared/SessionInfoBase";

type SendFn = (msg: object) => void;

export function prDecisionAction(send: SendFn) {
	return (
		sessionId: string,
		requestId: string,
		decision: "approve" | "reject",
		reason?: string,
		comments?: PrPreviewComment[],
		screenshots?: string[],
	) =>
		send({
			type: "pr-decision",
			sessionId,
			requestId,
			decision,
			reason,
			comments,
			screenshots,
		});
}
