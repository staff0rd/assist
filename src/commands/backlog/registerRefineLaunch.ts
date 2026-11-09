import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { harnessConfigHelp } from "./harnessConfigHelp";
import { refine } from "./refine";
import { resolveHarness } from "./resolveHarness";

type RefineLaunchOpts = {
	once?: boolean;
	resumeSession?: string;
	harness?: string;
};

const HARNESS_FLAG =
	"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, without launching, when Refine is unavailable on it";

function runRefine(
	id: string | undefined,
	opts: RefineLaunchOpts,
): Promise<void> {
	return refine(id, {
		once: opts.once,
		resumeSessionId: opts.resumeSession,
		harness: resolveHarness(opts.harness),
	});
}

export function registerRefineLaunch(
	program: Command,
	resumeFlag: string,
): void {
	const command = program
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description(
			"Launch a coding harness in /refine mode to refine a backlog item",
		)
		.option("--once", "Exit when the initial task completes")
		.option("--resume-session <id>", resumeFlag)
		.option("--harness <kind>", HARNESS_FLAG)
		.action(runRefine);
	configHelp(command, harnessConfigHelp);
}
