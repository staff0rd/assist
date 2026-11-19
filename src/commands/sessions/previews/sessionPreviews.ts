import { failWith } from "./failWith";
import { findDaemonSession } from "./findDaemonSession";
import { formatPreview } from "./formatPreview";

export async function sessionPreviews(
	sessionId: string,
	options: { json?: boolean },
): Promise<void> {
	try {
		const preview = (await findDaemonSession(sessionId)).pendingPrPreview;
		if (options.json) {
			console.log(JSON.stringify(preview ?? null, null, 2));
			return;
		}
		if (!preview) {
			console.log(`Session ${sessionId} has no pending preview.`);
			return;
		}
		for (const line of formatPreview(preview)) console.log(line);
	} catch (error) {
		failWith(error);
	}
}
