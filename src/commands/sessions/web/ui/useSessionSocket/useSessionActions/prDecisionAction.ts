import type { PrDecisionDetails } from "../../PrDecisionDetails";

type SendFn = (msg: object) => void;

export function prDecisionAction(send: SendFn) {
	return (
		sessionId: string,
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) =>
		send({
			type: "pr-decision",
			sessionId,
			requestId,
			decision,
			...details,
		});
}
