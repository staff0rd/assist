import { type SessionClient, sendTo } from "./broadcast";

const replyType = "reopen-high-level-review-result";

export type ReopenReply = { ok: true } | { ok: false; error: string };

export function replyOnce(client: SessionClient) {
	let replied = false;
	return (reply: ReopenReply) => {
		if (replied) return;
		replied = true;
		sendTo(client, { type: replyType, ...reply });
	};
}
