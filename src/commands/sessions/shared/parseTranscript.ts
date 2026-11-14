import * as fs from "node:fs";
import { readTranscriptEchoes } from "../daemon/readTranscriptEchoes";
import { locateConversation } from "./locateConversation";
import {
	type TranscriptMessage,
	transcriptMessages,
} from "./transcriptMessages";

export async function parseTranscript(
	conversationId: string,
): Promise<TranscriptMessage[]> {
	const located = await locateConversation(conversationId);
	if (!located) return [];
	try {
		const raw = await fs.promises.readFile(located.filePath, "utf8");
		return transcriptMessages(
			located.reader,
			raw.split("\n"),
			await readTranscriptEchoes(conversationId),
		);
	} catch {
		return [];
	}
}
