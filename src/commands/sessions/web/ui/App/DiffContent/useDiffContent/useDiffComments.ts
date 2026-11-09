import { useState } from "react";
import { addRuleSender } from "../../addRuleSender";
import { diffCommentSender } from "../../diffCommentSender";
import {
	type DiffCommentSource,
	diffCommentTarget,
} from "./useDiffComments/diffCommentTarget";
import { fileCommentSender } from "../../fileCommentSender";
import type { AddRuleRequest } from "../../formatAddRuleCommand";
import type { DiffComment } from "../../formatDiffComment";
import type { FileComment } from "../../formatFileComment";
import type { SessionInfo } from "../../../types";

export function useDiffComments(
	sessions: SessionInfo[],
	source: DiffCommentSource,
	sendInput: (sessionId: string, data: string) => void,
): {
	onComment?: (comment: DiffComment) => void;
	onFileComment?: (comment: FileComment) => void;
	onAddRule?: (request: AddRuleRequest) => void;
	unavailable?: string;
	sentTo: string | null;
	clearSent: () => void;
} {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { session, unavailable } = diffCommentTarget(sessions, source);

	return {
		onComment: session
			? diffCommentSender(session, sendInput, () => setSentTo(session.name))
			: undefined,
		onFileComment: session
			? fileCommentSender(session, sendInput, () => setSentTo(session.name))
			: undefined,
		onAddRule: session
			? addRuleSender(session, sendInput, () => setSentTo(session.name))
			: undefined,
		unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
