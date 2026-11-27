import { connectToDaemon } from "../daemon/connectToDaemon";
import { currentClaudeTaskId } from "./currentClaudeTaskId";
import { readSocketLines } from "../daemon/readSocketLines";
import { parsePreviewDecision } from "./parsePreviewDecision";
import { previewCommandKey } from "./previewCommandKey";
import type { PreviewDecision } from "./PreviewDecision";
import type { PrPreview } from "./SessionInfoBase";

export type PreviewRequest = PrPreview & { sessionId: string };

export type PreviewOutcome =
	| PreviewDecision
	| "superseded"
	| { pendingPreview: string };

export function requestPreviewDecision(
	request: PreviewRequest,
): Promise<PreviewOutcome> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			let settled = false;
			const finish = (error?: Error, outcome?: PreviewOutcome) => {
				if (settled) return;
				settled = true;
				socket.destroy();
				if (error) reject(error);
				else resolve(outcome as PreviewOutcome);
			};
			readSocketLines(socket, (line) => {
				const incoming = parsePreviewDecision(line, request.requestId);
				if (!incoming) return;
				if (incoming.kind === "error") finish(new Error(incoming.message));
				else if (incoming.kind === "superseded")
					finish(undefined, "superseded");
				else if (incoming.kind === "pending")
					finish(undefined, { pendingPreview: incoming.pending });
				else finish(undefined, incoming.decision);
			});
			socket.on("error", (error) => finish(error));
			socket.on("close", () =>
				finish(new Error("daemon closed before a decision was made")),
			);
			socket.write(
				`${JSON.stringify({ type: "pr-preview", ...request, taskId: currentClaudeTaskId(), previewKey: previewCommandKey.value })}\n`,
			);
		}, reject);
	});
}
