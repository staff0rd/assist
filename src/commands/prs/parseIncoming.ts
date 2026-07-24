import type { PrPreviewComment } from "../sessions/shared/SessionInfoBase";

export type PrDecision = {
	decision: "approve" | "reject";
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: string[];
};

type Incoming =
	| { kind: "decision"; decision: PrDecision }
	| { kind: "error"; message: string };

type IncomingMessage = {
	type?: string;
	requestId?: string;
	decision?: PrDecision["decision"];
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: string[];
	message?: string;
};

export function parseIncoming(
	line: string,
	requestId: string,
): Incoming | null {
	try {
		const msg = JSON.parse(line) as IncomingMessage;
		if (msg.type === "error" && (msg.message ?? "").includes("pr-preview"))
			return { kind: "error", message: msg.message ?? "pr-preview failed" };
		if (msg.type !== "pr-decision" || msg.requestId !== requestId) return null;
		if (msg.decision !== "approve" && msg.decision !== "reject") return null;
		return {
			kind: "decision",
			decision: {
				decision: msg.decision,
				reason: msg.reason,
				comments: Array.isArray(msg.comments) ? msg.comments : undefined,
				screenshots: Array.isArray(msg.screenshots)
					? msg.screenshots
					: undefined,
			},
		};
	} catch {
		return null;
	}
}
