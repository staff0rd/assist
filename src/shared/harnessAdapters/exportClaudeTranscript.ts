import { readFile } from "node:fs/promises";
import { findSessionJsonlPath } from "../../commands/sessions/shared/findSessionJsonlPath";
import type { TransferredConversation } from "./TransferredConversation";

export async function exportClaudeTranscript(
	id: string,
): Promise<TransferredConversation> {
	const path = await findSessionJsonlPath(id);
	if (!path) throw new Error(`no transcript found for ${id}`);
	return { id, transcript: await readFile(path, "utf8") };
}
