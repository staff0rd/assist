import type { RestartTarget } from "../../../watch/restartRules";
import { restartTargets } from "../../../watch/restartTargets";

type PendingRestartsInput = {
	daemonVersion?: string;
	daemonStartCommit?: string;
	webStartCommit?: string;
	built: string;
	changedSince: (commit: string) => string[];
};

function targetsSince(
	commit: string | undefined,
	target: RestartTarget,
	changedSince: (commit: string) => string[],
): boolean {
	return (
		commit !== undefined &&
		restartTargets(changedSince(commit)).includes(target)
	);
}

export function pendingRestarts(input: PendingRestartsInput): RestartTarget[] {
	const { daemonVersion, built, changedSince } = input;
	const daemon =
		daemonVersion !== undefined &&
		((built !== "unknown" && daemonVersion !== built) ||
			targetsSince(input.daemonStartCommit, "daemon", changedSince));
	const web = targetsSince(input.webStartCommit, "webserver", changedSince);
	return [
		...(daemon ? (["daemon"] as const) : []),
		...(web ? (["webserver"] as const) : []),
	];
}
