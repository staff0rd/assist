import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { launchOnTarget } from "./launchOnTarget";
import { settleTransfer } from "./settleTransfer";
import type { TransferDeps } from "./TransferDeps";
import type { TransferSnapshot } from "./TransferSnapshot";

type HandOff = {
	args: string[];
	target: string;
	cwd: string | undefined;
	traceId: string;
	snapshot: TransferSnapshot | undefined;
};

export async function handOffToTarget(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	{ args, target, cwd, traceId, snapshot }: HandOff,
): Promise<void> {
	daemonLog(
		`session ${s.id} transfer to ${target} trace=${traceId}: launching on target`,
	);
	s.transfer = { target, stage: "launching" };
	deps.notify();
	const outcome = await launchOnTarget(deps.links, {
		type: "create-assist",
		assistArgs: args,
		cwd,
		node: target,
		title: s.title,
		subtitle: s.subtitle,
		traceId,
		transfer: snapshot,
	});
	settleTransfer(client, deps, s, outcome, traceId);
}
