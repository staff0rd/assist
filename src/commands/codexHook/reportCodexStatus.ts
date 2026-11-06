import { setSessionStatus } from "../sessions/setSessionStatus";
import { codexStatusFor } from "./codexStatusFor";

export async function reportCodexStatus(
	event: string,
	autoDecided: boolean,
): Promise<void> {
	const report = codexStatusFor(event, autoDecided);
	if (!report) return;
	await setSessionStatus(report.status, {
		source: report.source,
		ack: true,
		readsClaudeHookInput: false,
	});
}
