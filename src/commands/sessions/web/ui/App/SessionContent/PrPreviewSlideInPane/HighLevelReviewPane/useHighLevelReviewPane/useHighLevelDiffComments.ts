import { useState } from "react";
import { commentTarget } from "../../../../commentTarget";
import { diffCommentSender } from "../../../../diffCommentSender";
import type { SessionInfo } from "../../../../../types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";

export function useHighLevelDiffComments(
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
): {
	comments: HighLevelDiffComments;
	sentTo: string | null;
	clearSent: () => void;
} {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const target = commentTarget(sendInput ? session : undefined);
	const live = target.session;

	return {
		comments: {
			cwd: session?.cwd,
			onComment:
				live && sendInput
					? diffCommentSender(live, sendInput, () => setSentTo(live.name))
					: undefined,
			unavailable: target.unavailable,
		},
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
