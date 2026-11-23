import {
	type AutopilotFetchResult,
	fetchAutopilotStatus,
} from "./fetchAutopilotStatus";

type AutopilotTarget = { cwd: string; node?: string };

export type ResolvedAutopilotStatus = AutopilotFetchResult & {
	target: AutopilotTarget;
	/** The node that runs the schedule, when the page reads it from there. */
	via?: string;
};

/* why: each node keeps its own tick record, so a node that doesn't run the
 * schedule has nothing live to show; read and control the scheduling node's. */
export async function resolveAutopilotStatus(
	viewing: AutopilotTarget,
	localNode: string | undefined,
	cloneOn: (cwd: string, node: string) => string | undefined,
): Promise<ResolvedAutopilotStatus> {
	const local = await fetchAutopilotStatus(viewing.cwd, viewing.node);
	const status = local.status;
	if (!status?.node || status.scheduledHere)
		return { ...local, target: viewing };
	const scheduler = status.node;
	const cwd = cloneOn(viewing.cwd, scheduler);
	const unreachable = (reason: string) => ({
		...local,
		target: viewing,
		error: `Autopilot for this repo runs on ${scheduler}; showing this node's copy because ${reason}.`,
	});
	if (!cwd) return unreachable(`this repo has no known clone on ${scheduler}`);
	const node = scheduler === localNode ? undefined : scheduler;
	const remote = await fetchAutopilotStatus(cwd, node);
	if (!remote.status)
		return unreachable(remote.error ?? `${scheduler} has no schedule for it`);
	return { ...remote, target: { cwd, node }, via: scheduler };
}
