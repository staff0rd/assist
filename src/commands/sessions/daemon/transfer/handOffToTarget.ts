import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { launchOnTarget } from "./launchOnTarget";
import { settleTransfer } from "./settleTransfer";
import type { TransferDeps } from "./TransferDeps";

type HandOff = {
	target: string;
	traceId: string;
	request: Record<string, unknown>;
};

export async function handOffToTarget(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	{ target, traceId, request }: HandOff,
): Promise<void> {
	daemonLog(
		`session ${s.id} transfer to ${target} trace=${traceId}: launching on target`,
	);
	s.transfer = { target, stage: "launching" };
	deps.notify();
	const outcome = await launchOnTarget(deps.links, request);
	settleTransfer(client, deps, s, outcome, traceId);
}
