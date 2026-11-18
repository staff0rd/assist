import { readFile } from "node:fs/promises";
import { relative, sep } from "node:path";
import { codexSessionsDir } from "../../commands/sessions/shared/codex/codexSessionsDir";
import { findCodexRolloutPath } from "../../commands/sessions/shared/codex/findCodexRolloutPath";
import type { TransferredConversation } from "./TransferredConversation";

export async function exportCodexRollout(
	id: string,
): Promise<TransferredConversation> {
	const file = await findCodexRolloutPath(id);
	if (!file) throw new Error(`no Codex rollout found for ${id}`);
	return {
		id,
		transcript: await readFile(file, "utf8"),
		path: relative(codexSessionsDir(), file).split(sep),
	};
}
