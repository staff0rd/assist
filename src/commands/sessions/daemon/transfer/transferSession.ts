import { newTraceId } from "../../shared/newTraceId";
import { transferPlan } from "../../shared/transferPlan";
import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { queueTransfer } from "./queueTransfer";
import { refuseTransfer } from "./refuseTransfer";
import { snapshotAndHandOff } from "./snapshotAndHandOff";
import type { TransferDeps } from "./TransferDeps";
import { transferRefusal } from "./transferRefusal";

type TransferRequest = {
	sessionId: string;
	target: string;
	cwd?: string;
	phaseEnded?: boolean;
};

export async function transferSession(
	client: SessionClient,
	deps: TransferDeps,
	{ sessionId: id, target, cwd, phaseEnded }: TransferRequest,
): Promise<void> {
	const s = deps.session(id);
	const refused = transferRefusal(s, target, deps.links);
	const plan = s && transferPlan(s);
	if (refused || !s || !plan)
		return refuseTransfer(client, id, refused ?? "unknown session");
	if (s.status === "running" && !phaseEnded)
		return queueTransfer(client, deps.notify, s, target, cwd);
	const traceId = newTraceId();
	daemonLog(
		`session ${id} transfer to ${target} (cwd=${cwd ?? "default"}) trace=${traceId}: snapshotting tree`,
	);
	s.transfer = { target, stage: "snapshotting" };
	deps.notify();
	await snapshotAndHandOff(client, deps, s, { plan, target, cwd, traceId });
}
