import { connectToDaemon } from "../sessions/daemon/connectToDaemon";
import { readSocketLines } from "../sessions/daemon/readSocketLines";

type PrDecision = { decision: "approve" | "reject"; reason?: string };

type PrPreviewRequest = {
	sessionId: string;
	requestId: string;
	title: string;
	body: string;
	prNumber: number | null;
};

type Incoming =
	| { kind: "decision"; decision: PrDecision }
	| { kind: "error"; message: string };

function parseIncoming(line: string, requestId: string): Incoming | null {
	try {
		const msg = JSON.parse(line) as {
			type?: string;
			requestId?: string;
			decision?: PrDecision["decision"];
			reason?: string;
			message?: string;
		};
		if (msg.type === "error" && (msg.message ?? "").includes("pr-preview"))
			return { kind: "error", message: msg.message ?? "pr-preview failed" };
		if (msg.type !== "pr-decision" || msg.requestId !== requestId) return null;
		if (msg.decision !== "approve" && msg.decision !== "reject") return null;
		return {
			kind: "decision",
			decision: { decision: msg.decision, reason: msg.reason },
		};
	} catch {
		return null;
	}
}

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
