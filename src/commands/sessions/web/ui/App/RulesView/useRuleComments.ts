import { useState } from "react";
import { pasteAndSubmit } from "../../../../shared/pasteAndSubmit";
import type { SessionInfo } from "../../types";
import { commentTarget } from "../commentTarget";
import { formatRuleComment, type RuleComment } from "./formatRuleComment";

export type RuleComments = {
	cwd: string | undefined;
	onComment?: ((comment: RuleComment) => void) | undefined;
	unavailable?: string | undefined;
	sentTo: string | null;
	clearSent: () => void;
};

export function useRuleComments(
	cwd: string,
	sessions: SessionInfo[],
	cardId: string | null,
	sendInput: (sessionId: string, data: string) => void,
): RuleComments {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { session, unavailable } = cardId
		? commentTarget(sessions.find((s) => s.id === cardId))
		: {
				session: undefined,
				unavailable: "Select a session card to comment on a rule.",
			};

	return {
		cwd,
		onComment: session
			? (comment) => {
					pasteAndSubmit(sendInput, session.id, formatRuleComment(comment));
					setSentTo(session.name);
				}
			: undefined,
		unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
