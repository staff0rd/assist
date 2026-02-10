import type { ChatMessage, VttCue } from "../../types";
import { cleanText } from "../parseVtt";

export function cuesToChatMessages(cues: VttCue[]): ChatMessage[] {
	const messages: ChatMessage[] = [];

	for (const cue of cues) {
		const speaker = cue.speaker || "Unknown";
		const lastMessage = messages[messages.length - 1];

		if (lastMessage && lastMessage.speaker === speaker) {
			lastMessage.text += ` ${cue.text}`;
		} else {
			messages.push({ speaker, text: cue.text });
		}
	}

	return messages.map((msg) => ({
		...msg,
		text: cleanText(msg.text),
	}));
}

export function formatChatLog(messages: ChatMessage[]): string {
	return messages.map((msg) => `${msg.speaker}: ${msg.text}`).join("\n\n");
}
