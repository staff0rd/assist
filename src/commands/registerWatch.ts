import type { Command } from "commander";
import { simulateDivergence } from "./watch/simulateDivergence";
import { watchLoop } from "./watch/watchLoop";
import { watchReport } from "./watch/watchReport";
import { watchWait } from "./watch/watchWait";

export function registerWatch(program: Command): void {
	const watchCommand = program
		.command("watch")
		.description("Wait on upstream movement for the current branch");

	watchCommand
		.command("wait")
		.description(
			"Block until the current branch's upstream gains commits, then exit 0 (2 on timeout, 3 when --pull hits genuine divergence, 4 when --build or the post-build sync fails, 1 when waiting is impossible, 130 on interrupt)",
		)
		.option(
			"--interval <duration>",
			"How often to fetch after the fetch at startup (e.g. 30s, 2m)",
			"30s",
		)
		.option(
			"--timeout <duration>",
			"Give up and exit 2 after this long (e.g. 60m, 2h), or none to wait indefinitely",
			"none",
		)
		.option(
			"--pull",
			"On movement, fast-forward with git pull --ff-only, recovering a dirty tree or a merely-behind branch; exit 3 with git's reason on genuine divergence",
		)
		.option(
			"--build [entry]",
			"After a successful pull, run this run entry (default auto-build), then run assist sync --yes when the pulled commits touched the files sync installs; exit 4 with the output of whichever fails",
		)
		.action(
			(options: {
				interval: string;
				timeout: string;
				pull?: boolean;
				build?: boolean | string;
			}) => watchWait(options),
		);

	watchCommand
		.command("loop")
		.description(
			"Run assist watch wait --pull --build as a fresh child per lap, relaunching after exit 0, 2 or 4 or a signal kill, and exit with the child's code on 1, 3 or 130",
		)
		.action(() => watchLoop());

	watchCommand
		.command("simulate-divergence")
		.description(
			"Make the next assist watch wait poll in this repo exit 3 as if the branch had diverged, to test the watcher's divergence escalation",
		)
		.action(() => simulateDivergence());

	watchCommand
		.command("report")
		.description(
			"Print the built version, the last 10 commits as a markdown table, the restarts the new commits make necessary, and whether ~/.claude needs a sync",
		)
		.option(
			"--from <sha>",
			"Mark commits reachable from HEAD but not <sha> as new, and derive the restart and sync advice from the files they changed",
		)
		.action((options: { from?: string }) => watchReport(options));
}
