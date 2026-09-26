import { useState } from "react";
import { addRuleSender } from "../../../../addRuleSender";
import { fileCommentSender } from "../../../../fileCommentSender";
import { fileCommentTarget } from "./useFileComments/fileCommentTarget";
import type { AddRuleRequest } from "../../../../formatAddRuleCommand";
import type { FileComment } from "../../../../formatFileComment";
import type { SessionInfo } from "../../../../../types";

export type FileComments = {
	onComment?: ((comment: FileComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
	sentTo: string | null;
	clearSent: () => void;
};

export function useFileComments(
	sessions: SessionInfo[],
	cardId: string | null,
	sendInput: (sessionId: string, data: string) => void,
): FileComments {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { session, unavailable } = fileCommentTarget(sessions, cardId);
	const noteSent = () => setSentTo(session?.name ?? null);

	return {
		onComment: session
			? fileCommentSender(session, sendInput, noteSent)
			: undefined,
		onAddRule: session
			? addRuleSender(session, sendInput, noteSent)
			: undefined,
		unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
