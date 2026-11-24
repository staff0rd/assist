import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotNextTickAt } from "./autopilotNextTickAt";
import type { AutopilotStore } from "./createAutopilotStore";
import { formatTaskAge } from "./formatTaskAge";
import { pauseHeldMember } from "./pauseHeldMember";
import type { AutopilotTarget } from "./readAutopilotTarget";
import { sendHandOffs } from "./sendHandOffs";

/** Ask members holding a due tick's run open on a background wait to hand their check to the next tick; false when no such member holds it. */
export function handOffHeldRun(
	store: AutopilotStore,
	started: AutopilotStarted,
	target: AutopilotTarget,
	rootId: string,
): boolean {
	const { cwd } = target;
	const held = started.deps.backgroundHolds?.(rootId) ?? [];
	if (!held.length) return false;
	const repeat = held.find((m) => started.nudges.get(m.sessionId)?.handedOff);
	if (repeat) {
		const age = formatTaskAge(repeat.taskAgeMs);
		daemonLog(
			`autopilot: ${cwd} ${repeat.sessionId} still holds the run on a background task (age ${age}) after its hand-off`,
		);
		return pauseHeldMember(
			store,
			started,
			cwd,
			repeat,
			`its session kept the run open on a background task (running ${age}) after autopilot asked it to hand its check to the next tick`,
		);
	}
	const ages = held
		.map((m) => `${m.sessionId} task age ${formatTaskAge(m.taskAgeMs)}`)
		.join(", ");
	store.addTick(cwd, {
		outcome: "skipped",
		trigger: "scheduled",
		sessionId: rootId,
		reason: `run held by a background wait (${ages}); asked it to hand its check to the next tick`,
	});
	const nextTickAt = autopilotNextTickAt(
		store.repo(cwd),
		target.intervalMinutes,
	);
	sendHandOffs(store, started, cwd, held, new Date(nextTickAt).toISOString());
	return true;
}
