import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import type { TranscriptMessage } from "./TranscriptMessage";

export function eventTranscriptMessages(
	event: ConversationEvent,
): TranscriptMessage[] {
	if (event.kind === "message") return [{ role: event.role, text: event.text }];
	if (event.kind === "tool")
		return [
			{
				role: "tool",
				tool: event.tool,
				target: event.target,
				...(event.description && { description: event.description }),
				...(event.label && { label: event.label }),
				...(event.fields && { fields: event.fields }),
				...(event.resultUrl && { resultUrl: event.resultUrl }),
			},
		];
	if (event.kind === "shell") {
		const { command, stdout, stderr } = event;
		return [{ role: "shell", command, stdout, stderr }];
	}
	if (event.kind === "interrupt") return [{ role: "interrupt" }];
	if (event.kind === "restart")
		return [{ role: "restart", killed: event.killed }];
	return [];
}
