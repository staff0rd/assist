import { splitShellBlocks } from "../../commands/sessions/shared/splitShellBlocks";
import { userPromptRaw } from "../../commands/sessions/shared/userPromptRaw";
import type { ConversationEvent } from "./types";

/* why: a message sent with held shell results renders them as shell rows
 * ahead of the user's own text; `textless` means the entry carried no text. */
export function claudeShellEvents(
	entry: Record<string, unknown>,
	at?: string,
): { events: ConversationEvent[]; textless: boolean } {
	const raw = userPromptRaw(entry);
	const shell = raw === null ? null : splitShellBlocks(raw);
	if (!shell) return { events: [], textless: false };
	return {
		events: shell.shells.map((block) => ({ kind: "shell", ...block, at })),
		textless: !shell.text,
	};
}
