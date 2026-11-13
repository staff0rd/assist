import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { harnessConfigHelp } from "./harnessConfigHelp";
import { lazyAction } from "../../shared/lazyAction";
const HARNESS_FLAG =
	"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, without launching, when Refine is unavailable on it";

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
		.action(lazyAction(() => import("./runRefine"), "runRefine"));
	configHelp(command, harnessConfigHelp);
}
