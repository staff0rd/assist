import { newTraceId } from "../../shared/newTraceId";
import { backlogRunArgs } from "../../shared/backlogRunArgs";
import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { handOffToTarget } from "./handOffToTarget";
import type { TransferDeps } from "./TransferDeps";
import { transferRefusal } from "./transferRefusal";
import { snapshotOrFail } from "./snapshotOrFail";

type TransferRequest = {
	sessionId: string;
	target: string;
	cwd?: string;
};

function refuse(client: SessionClient, id: string, message: string): void {
	daemonLog(`session ${id} transfer refused: ${message}`);
	sendTo(client, { type: "error", message: `Transfer refused: ${message}` });
}

export async function transferSession(
	client: SessionClient,
	deps: TransferDeps,
	{ sessionId: id, target, cwd }: TransferRequest,
): Promise<void> {
	const s = deps.session(id);
	const refused = transferRefusal(s, target, deps.links);
	const args = s && backlogRunArgs(s);
	if (refused || !s || !args)
		return refuse(client, id, refused ?? "unknown session");
	const traceId = newTraceId();
	daemonLog(
		`session ${id} transfer to ${target} (cwd=${cwd ?? "default"}) trace=${traceId}: snapshotting tree`,
	);
	s.transfer = { target };
	deps.notify();
	const pushed = await snapshotOrFail(s, args, traceId);
	if (!pushed.ok) {
		s.transfer = { target, error: pushed.error };
		deps.notify();
		return refuse(client, id, pushed.error);
	}
	await handOffToTarget(client, deps, s, {
		args,
		target,
		cwd,
		traceId,
		snapshot: pushed.snapshot,
	});
}
