import type { Command } from "commander";
import { refine as backlogRefine } from "./refine";
import { resolveHarness } from "./resolveHarness";

export function registerRefineCommand(cmd: Command): void {
	cmd
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Alias for refine")
		.option("--once", "Exit when the initial task completes")
		.option(
			"--harness <kind>",
			"Coding harness to launch (claude|codex); defaults to the configured harness.engine",
		)
		.action(
			(id: string | undefined, opts: { once?: boolean; harness?: string }) =>
				backlogRefine(id, {
					once: opts.once,
					harness: resolveHarness(opts.harness),
				}),
		);
}
