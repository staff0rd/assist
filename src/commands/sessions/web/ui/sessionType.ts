import type { SessionType } from "../../shared/deriveHistoryFields";
import type { SessionInfo } from "./types";

export function sessionType(session: SessionInfo): SessionType {
	if (session.activity?.kind === "backlog") return "next";
	switch (session.commandType) {
		case "assist": {
			const cmd = session.assistArgs?.[0];
			if (cmd === "review-comments") return "review";
			if (
				cmd === "draft" ||
				cmd === "bug" ||
				cmd === "next" ||
				cmd === "refine" ||
				cmd === "review"
			)
				return cmd;
			return "prompt";
		}
		case "run":
			return "run";
		default:
			return "prompt";
	}
}
