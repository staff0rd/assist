import { connectToDaemon } from "../daemon/connectToDaemon";
import { readSocketLines } from "../daemon/readSocketLines";
import { parsePreviewDecision } from "./parsePreviewDecision";
import type { PreviewDecision } from "./PreviewDecision";
import type { PrPreview } from "./SessionInfoBase";

export type PreviewRequest = PrPreview & { sessionId: string };

export function requestPreviewDecision(
	request: PreviewRequest,
): Promise<PreviewDecision> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			let settled = false;
			const finish = (error?: Error, decision?: PreviewDecision) => {
				if (settled) return;
				settled = true;
				socket.destroy();
				if (error) reject(error);
				else resolve(decision as PreviewDecision);
			};
			readSocketLines(socket, (line) => {
				const incoming = parsePreviewDecision(line, request.requestId);
				if (!incoming) return;
				if (incoming.kind === "error") finish(new Error(incoming.message));
				else finish(undefined, incoming.decision);
			});
			socket.on("error", (error) => finish(error));
			socket.on("close", () =>
				finish(new Error("daemon closed before a decision was made")),
			);
			socket.write(`${JSON.stringify({ type: "pr-preview", ...request })}\n`);
		}, reject);
	});
}
