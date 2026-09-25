import {
	type DiffComment,
	formatDiffComment,
} from "../../../formatDiffComment";
import { pasteAndSubmit } from "../../../pasteAndSubmit";
import type { SessionInfo } from "../../../../types";

export function diffCommentSender(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	onSent: () => void,
): (comment: DiffComment) => void {
	return (comment) => {
		pasteAndSubmit(sendInput, session.id, formatDiffComment(comment));
		onSent();
	};
}
