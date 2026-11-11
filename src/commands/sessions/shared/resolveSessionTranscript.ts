import { readTranscriptHead } from "../summarise/readTranscriptHead";
import { locateConversation } from "./locateConversation";
import { transcriptMessages } from "./transcriptMessages";

const MAX_PROMPT_LENGTH = 80;

type SessionTranscript = {
	path: string;
	prompt?: string;
};

export async function resolveSessionTranscript(
	conversationId: string,
): Promise<SessionTranscript | undefined> {
	const located = await locateConversation(conversationId);
	if (!located) return undefined;
	const { reader, filePath } = located;
	const head = readTranscriptHead(filePath, reader.headBytes) ?? "";
	const opener = transcriptMessages(reader, head.split("\n")).find(
		(message) => message.role === "user",
	);
	return {
		path: filePath,
		prompt:
			opener?.role === "user" && opener.text
				? opener.text.slice(0, MAX_PROMPT_LENGTH)
				: undefined,
	};
}
