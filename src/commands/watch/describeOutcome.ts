import type { OutcomeReport } from "./OutcomeReport";
import type { WatchOutcome } from "./WatchOutcome";

const short = (sha: string): string => sha.slice(0, 7);

export function describeOutcome(outcome: WatchOutcome): OutcomeReport {
	switch (outcome.kind) {
		case "moved":
			return {
				exitCode: 0,
				message: `remote moved: ${short(outcome.from)}..${short(outcome.to)} (${outcome.count} commit${outcome.count === 1 ? "" : "s"})`,
			};
		case "timeout":
			return {
				exitCode: 2,
				message: `no movement on ${outcome.upstream} after ${outcome.timeout}`,
			};
		case "simulated-divergence":
			return {
				exitCode: 3,
				message: `simulated divergence from ${outcome.upstream} (requested by assist watch simulate-divergence; nothing has actually diverged)`,
			};
		case "unavailable":
			return { exitCode: 1, message: `cannot wait: ${outcome.reason}` };
		case "interrupted":
			return { exitCode: 130, message: "interrupted" };
	}
}
