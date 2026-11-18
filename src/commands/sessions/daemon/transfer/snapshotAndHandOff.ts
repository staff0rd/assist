import type { TransferPlan } from "../../shared/transferPlan";
import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { failTransfer } from "./failTransfer";
import { handOffToTarget } from "./handOffToTarget";
import { readTransferTranscript } from "./readTransferTranscript";
import type { TransferDeps } from "./TransferDeps";
import { transferLaunchRequest } from "./transferLaunchRequest";
import { promptTransferKey } from "./TransferSnapshot";
import { snapshotOrFail } from "./snapshotOrFail";

type Move = {
	plan: TransferPlan;
	target: string;
	cwd: string | undefined;
	traceId: string;
};

function snapshotKey(deps: TransferDeps, s: Session, plan: TransferPlan) {
	return plan.kind === "backlog-run"
		? plan.args[2]
		: promptTransferKey(deps.links.localNode(), s.id);
}

export async function snapshotAndHandOff(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	{ plan, target, cwd, traceId }: Move,
): Promise<void> {
	const transcript = await readTransferTranscript(plan);
	if (!transcript.ok)
		return failTransfer(client, deps, s, target, transcript.error);
	const pushed = await snapshotOrFail(s, snapshotKey(deps, s, plan), traceId);
	if (!pushed.ok) return failTransfer(client, deps, s, target, pushed.error);
	await handOffToTarget(client, deps, s, {
		target,
		traceId,
		request: transferLaunchRequest(s, plan, {
			target,
			cwd,
			traceId,
			snapshot: pushed.snapshot,
			conversation: transcript.conversation,
		}),
	});
}
