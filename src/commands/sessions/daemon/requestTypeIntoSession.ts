import { randomUUID } from "node:crypto";
import { readDaemonMessage } from "./readDaemonMessage";
import type { TypePromptReply } from "./typePromptReply";
import { withDaemonConnection } from "./withDaemonConnection";

const TYPE_TIMEOUT_MS = 10_000;

type TypeRequest = {
	type: "type-prompt" | "type-keys";
	sessionId: string;
	text: string;
};

export function requestTypeIntoSession(
	request: TypeRequest,
): Promise<TypePromptReply> {
	return withDaemonConnection((socket, lines) => {
		const requestId = randomUUID();
		const reply = readDaemonMessage<TypePromptReply>(
			lines,
			TYPE_TIMEOUT_MS,
			{ ok: false, message: "Timed out waiting for the sessions daemon" },
			(data) =>
				data.type === "type-prompt-result" && data.requestId === requestId
					? { ok: data.ok === true, message: String(data.message ?? "") }
					: undefined,
		);
		socket.write(`${JSON.stringify({ ...request, requestId })}\n`);
		return reply;
	});
}
