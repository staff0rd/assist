import type { AssistSendResult } from "../sendToAssist/isAssistSendMessage";
import { postAssistJson } from "../sendToAssist/postAssistJson";
import type { DocsFeedbackMessage } from "./isDocsFeedbackMessage";

function docsFeedbackPath(node: string | undefined): string {
	const path = "/api/sessions/docs-feedback";
	return node ? `${path}?node=${encodeURIComponent(node)}` : path;
}

export async function postDocsFeedback(
	server: string,
	{ type: _type, node, ...feedback }: DocsFeedbackMessage,
): Promise<AssistSendResult> {
	const result = await postAssistJson(server, docsFeedbackPath(node), feedback);
	if (!result.ok) return result;
	return {
		ok: true,
		message: result.data.message ?? "Sent to the docs session",
	};
}
