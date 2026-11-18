import { daemonLog } from "../daemonLog";
import type { SessionManager } from "../SessionManager";
import { spawnContextFrom } from "../spawnContextFrom";
import { spawnTransferredConversation } from "./spawnTransferredConversation";
import { parseTransferredConversation } from "./TransferredConversation";
import { parseTransferSnapshot } from "./TransferSnapshot";

export function spawnTransferredPrompt(
	m: SessionManager,
	d: Record<string, unknown>,
): Promise<string> | undefined {
	const snapshot = parseTransferSnapshot(d.transfer);
	const conversation = parseTransferredConversation(d.conversation);
	if (!snapshot || !conversation) return undefined;
	daemonLog(
		`create: transferred conversation ${conversation.id} (cwd=${(d.cwd as string) ?? ""}) trace=${(d.traceId as string) ?? "none"}`,
	);
	return spawnTransferredConversation(
		m.treeCtx(),
		m.discardSession,
		{
			cwd: d.cwd as string | undefined,
			conversation,
			snapshot,
			title: d.title as string | undefined,
			subtitle: d.subtitle as string | undefined,
			traceId: d.traceId as string | undefined,
		},
		spawnContextFrom(d),
	);
}
