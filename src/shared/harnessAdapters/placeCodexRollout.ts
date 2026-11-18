import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { daemonLog } from "../../commands/sessions/daemon/daemonLog";
import { codexSessionsDir } from "../../commands/sessions/shared/codex/codexSessionsDir";
import { relocateCodexRollout } from "./relocateCodexRollout";
import type { TransferredConversation } from "./TransferredConversation";

export async function placeCodexRollout(
	conversation: TransferredConversation,
	cwd: string,
): Promise<string> {
	const name = conversation.path?.at(-1);
	if (
		!name?.startsWith("rollout-") ||
		!name.endsWith(`-${conversation.id}.jsonl`)
	)
		throw new Error(`no Codex rollout file name for ${conversation.id}`);
	const dest = join(codexSessionsDir(), ...(conversation.path ?? []));
	await mkdir(dirname(dest), { recursive: true });
	await writeFile(dest, relocateCodexRollout(conversation.transcript, cwd));
	daemonLog(
		`Codex rollout ${conversation.id} placed at ${dest} so ${cwd} can resume it`,
	);
	return dest;
}
