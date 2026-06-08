import type { SessionInfo } from "./types";

type SessionType = "draft" | "next" | "bug" | "prompt" | "run";

export function sessionType(session: SessionInfo): SessionType {
	if (session.activity?.kind === "backlog") return "next";
	switch (session.commandType) {
		case "assist": {
			const cmd = session.assistArgs?.[0];
			if (cmd === "draft" || cmd === "bug" || cmd === "next") return cmd;
			return "prompt";
		}
		case "run":
			return "run";
		default:
			return "prompt";
	}
}
