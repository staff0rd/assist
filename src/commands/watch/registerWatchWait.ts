import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";

export function registerWatchWait(watchCommand: Command): void {
	internalCommand(
		watchCommand
			.command("wait")
			.description(
				"Block until the current branch's upstream gains commits, then exit 0 (2 on timeout, 3 when --pull hits genuine divergence, 4 when --build or the post-build sync fails, 5 when git fetch fails, 1 when waiting is impossible, 130 on interrupt)",
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
				async (options: {
					interval: string;
					timeout: string;
					pull?: boolean;
					build?: boolean | string;
				}) => (await import("./watchWait")).watchWait(options),
			),
		"auto-update",
	);
}
