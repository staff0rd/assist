import { connectToDaemon } from "../sessions/daemon/connectToDaemon";
import { readSocketLines } from "../sessions/daemon/readSocketLines";
import { type PrDecision, parseIncoming } from "./parseIncoming";

type PrPreviewRequest = {
	sessionId: string;
	requestId: string;
	title: string;
	body: string;
	prNumber: number | null;
};

export function requestPrDecision(
	request: PrPreviewRequest,
): Promise<PrDecision> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			let settled = false;
			const finish = (error?: Error, decision?: PrDecision) => {
				if (settled) return;
				settled = true;
				socket.destroy();
				if (error) reject(error);
				else resolve(decision as PrDecision);
			};
			readSocketLines(socket, (line) => {
				const incoming = parseIncoming(line, request.requestId);
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
