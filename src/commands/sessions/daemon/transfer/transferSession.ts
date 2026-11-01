import { newTraceId } from "../../shared/newTraceId";
import { backlogRunArgs } from "../../shared/backlogRunArgs";
import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { launchOnTarget } from "./launchOnTarget";
import { settleTransfer } from "./settleTransfer";
import type { TransferDeps } from "./TransferDeps";
import { heldWorkRefusal, transferRefusal } from "./transferRefusal";

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
	if (refused || !s) return refuse(client, id, refused ?? "unknown session");
	const held = await heldWorkRefusal(s);
	if (held) return refuse(client, id, held);
	const traceId = newTraceId();
	daemonLog(
		`session ${id} transfer to ${target} (cwd=${cwd ?? "default"}) trace=${traceId}: stopping source`,
	);
	s.transfer = { target };
	deps.stop(id);
	deps.notify();
	const outcome = await launchOnTarget(deps.links.route, {
		type: "create-assist",
		assistArgs: backlogRunArgs(s),
		cwd,
		node: target,
		title: s.title,
		subtitle: s.subtitle,
		traceId,
	});
	settleTransfer(client, deps, s, outcome, traceId);
}
