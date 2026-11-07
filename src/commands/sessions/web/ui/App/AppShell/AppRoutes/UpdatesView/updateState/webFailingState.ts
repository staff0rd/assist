import type { WebFailure } from "../../../NodeUpdateEntry";
import type { UpdateState } from "../UpdateStateKind";

function daemonSummary({ daemon }: WebFailure): string {
	if (!daemon) return "daemon link did not answer";
	const built =
		daemon.built && daemon.built !== daemon.version
			? ` · built v${daemon.built}`
			: "";
	const loop = daemon.loop.paused ? "paused" : daemon.loop.phase;
	return `daemon v${daemon.version}${built} · auto-update ${loop}`;
}

export function webFailingState(failure: WebFailure): UpdateState {
	return {
		kind: "failing",
		label: "Web server failing",
		line: `HTTP ${failure.httpStatus} · ${daemonSummary(failure)}`,
	};
}
