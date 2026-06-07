import type { Command } from "commander";
import { refine as backlogRefine } from "./refine";

export function registerRefineCommand(cmd: Command): void {
	cmd
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Alias for refine")
		.option("--once", "Exit when the initial task completes")
		.action((id: string | undefined, opts: { once?: boolean }) =>
			backlogRefine(id, { once: opts.once }),
		);
}
