import type { Session } from "../createSession";
import { liveProcessesInTree } from "./liveProcessesInTree";

const POLL_MS = 500;
const GRACE_MS = 5000;

type GraceOutcome = "vacated" | "occupied" | "cancelled";

export function awaitTreeVacated(
	session: Session,
	treePath: string,
): Promise<GraceOutcome> {
	return new Promise((resolve) => {
		let ticks = GRACE_MS / POLL_MS;
		const settle = (outcome: GraceOutcome) => {
			clearTimeout(timer);
			session.closeGrace = undefined;
			resolve(outcome);
		};
		const tick = () => {
			if (liveProcessesInTree(treePath).length === 0) settle("vacated");
			else if (--ticks <= 0) settle("occupied");
			else timer = setTimeout(tick, POLL_MS);
		};
		let timer = setTimeout(tick, POLL_MS);
		session.closeGrace?.cancel();
		session.closeGrace = { cancel: () => settle("cancelled") };
	});
}
