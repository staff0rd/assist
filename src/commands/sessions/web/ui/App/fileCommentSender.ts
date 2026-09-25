import { type FileComment, formatFileComment } from "./formatFileComment";
import { pasteAndSubmit } from "./pasteAndSubmit";
import type { SessionInfo } from "../types";

export function fileCommentSender(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	onSent: () => void,
): (comment: FileComment) => void {
	return (comment) => {
		pasteAndSubmit(sendInput, session.id, formatFileComment(comment));
		onSent();
	};
}
