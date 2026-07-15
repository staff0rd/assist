import type { Command } from "commander";
import { type ConfigHelpEntry, configHelp } from "../../shared/configHelp";
import { refine } from "./refine";
import { resolveHarness } from "./resolveHarness";

type RefineLaunchOpts = {
	once?: boolean;
	resumeSession?: string;
	harness?: string;
};

const HARNESS_FLAG =
	"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine";

const HARNESS_CONFIG_HELP: ConfigHelpEntry[] = [
	{
		key: "harness.engine",
		setter: "assist config set harness.engine <claude|codex|pi>",
		note: "default coding harness launched by refine and other flows",
	},
	{
		key: "harness.exposeCodexActions",
		setter: "assist config set harness.exposeCodexActions <true|false>",
		note: "force the web UI 'with Codex' actions off even when codex is on PATH",
	},
	{
		key: "harness.exposePiActions",
		setter: "assist config set harness.exposePiActions <true|false>",
		note: "force the web UI 'with pi' actions off even when pi is on PATH",
	},
];

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
	configHelp(command, HARNESS_CONFIG_HELP);
}
