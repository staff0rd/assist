import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../../shared/db/getDb";
import { readInboxLastScan } from "../../../../shared/db/readInboxLastScan";
import { respondJson } from "../../../../shared/web";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";

type StatusReply = {
	scanning: boolean;
	intervalMinutes: number | null;
	lastError: string | null;
};

export async function inboxStatus(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const [reply, lastScanAt] = await Promise.all([
		requestDaemonReply<StatusReply>({ type: "inbox-status" }, "inbox-status"),
		readInboxLastScan(await getDb()),
	]);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	respondJson(res, 200, {
		scanning: reply.scanning,
		intervalMinutes: reply.intervalMinutes,
		lastError: reply.lastError,
		lastScanAt: lastScanAt?.toISOString() ?? null,
	});
}
