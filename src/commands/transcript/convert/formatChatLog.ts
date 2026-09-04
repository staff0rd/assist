import type { ChatMessage, VttCue } from "../types";
import { formatClock } from "./formatTimestamp";
import { cleanText } from "./parseVtt";

type ChatLogOptions = {
	timestamps?: boolean;
};

export function cuesToChatMessages(cues: VttCue[]): ChatMessage[] {
	const messages: ChatMessage[] = [];

	for (const cue of cues) {
		const speaker = cue.speaker || "Unknown";
		const lastMessage = messages[messages.length - 1];

		if (lastMessage && lastMessage.speaker === speaker) {
			lastMessage.text += ` ${cue.text}`;
		} else {
			messages.push({ speaker, text: cue.text, startMs: cue.startMs });
		}
	}

	return messages.map((msg) => ({
		...msg,
		text: cleanText(msg.text),
	}));
}

export function formatChatLog(
	messages: ChatMessage[],
	options: ChatLogOptions = {},
): string {
	return messages
		.map((msg) => {
			const prefix = options.timestamps ? `[${formatClock(msg.startMs)}] ` : "";
			return `${prefix}${msg.speaker}: ${msg.text}`;
		})
		.join("\n\n");
}
