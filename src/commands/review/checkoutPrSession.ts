import { randomUUID } from "node:crypto";
import { emitActivity } from "../../shared/emitActivity";
import { type SpawnClaudeOptions, spawnClaude } from "../../shared/spawnClaude";
import { checkoutPr } from "./checkoutPr";

export async function checkoutPrSession(
	number: string,
	prompt = "",
	permissionMode: SpawnClaudeOptions["permissionMode"] = "acceptEdits",
): Promise<void> {
	await checkoutPr(number);
	const claudeSessionId = randomUUID();
	emitActivity({ kind: "command", name: "review", claudeSessionId });
	const { done } = spawnClaude(prompt, {
		permissionMode,
		sessionId: claudeSessionId,
	});
	await done;
}
