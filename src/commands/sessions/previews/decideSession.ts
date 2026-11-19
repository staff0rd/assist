import { sendToDaemon } from "../daemon/sendToDaemon";
import type { DecideOptions } from "./DecideOptions";
import { decisionFor } from "./decisionFor";
import { failWith } from "./failWith";
import { findDaemonSession } from "./findDaemonSession";

export async function decideSession(
	sessionId: string,
	options: DecideOptions,
): Promise<void> {
	try {
		const preview = (await findDaemonSession(sessionId)).pendingPrPreview;
		if (!preview)
			throw new Error(`Session ${sessionId} has no pending preview to decide`);
		const decision = decisionFor(preview, options);
		await sendToDaemon({
			type: "pr-decision",
			sessionId,
			requestId: preview.requestId,
			...decision,
		});
		console.log(
			`${decision.decision === "approve" ? "Approved" : "Rejected"} "${preview.title}" in session ${sessionId}.`,
		);
	} catch (error) {
		failWith(error);
	}
}
