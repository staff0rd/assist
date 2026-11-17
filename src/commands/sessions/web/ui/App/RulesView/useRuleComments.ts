import { useState } from "react";
import { pasteAndSubmit } from "../../../../shared/pasteAndSubmit";
import type { SessionInfo } from "../../types";
import { commentTarget } from "../commentTarget";
import { formatRuleComment, type RuleComment } from "./formatRuleComment";
import { formatScopeRuleRequest } from "./formatScopeRuleRequest";

type Sent = { to: string; subject: string };

export type RuleComments = {
	cwd: string | undefined;
	onComment?: ((comment: RuleComment) => void) | undefined;
	onAddRule?: ((flag: string, note: string) => void) | undefined;
	sessionName?: string | undefined;
	unavailable?: string | undefined;
	sent: Sent | null;
	clearSent: () => void;
};

export function useRuleComments(
	cwd: string,
	sessions: SessionInfo[],
	cardId: string | null,
	sendInput: (sessionId: string, data: string) => void,
): RuleComments {
	const [sent, setSent] = useState<Sent | null>(null);
	const { session, unavailable } = cardId
		? commentTarget(sessions.find((s) => s.id === cardId))
		: {
				session: undefined,
				unavailable: "Select a session card to comment on a rule.",
			};
	const send = (data: string, subject: string) => {
		if (!session) return;
		pasteAndSubmit(sendInput, session.id, data);
		setSent({ to: session.name, subject });
	};

	return {
		cwd,
		onComment: session
			? (comment) => send(formatRuleComment(comment), "Comment")
			: undefined,
		onAddRule: session
			? (flag, note) => send(formatScopeRuleRequest(flag, note), "Rule request")
			: undefined,
		sessionName: session?.name,
		unavailable,
		sent,
		clearSent: () => setSent(null),
	};
}
