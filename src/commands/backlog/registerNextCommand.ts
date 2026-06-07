import type { Command } from "commander";
import { next as backlogNext } from "../backlog";

export function registerNextCommand(cmd: Command): void {
	cmd
		.command("next")
		.argument("[id]", "Backlog item ID to run first")
		.description("Pick and run the next backlog item, or open /draft if none")
		.option("-w, --write", "Run Claude with auto permission mode (default)")
		.option("--no-write", "Run Claude without auto permission mode")
		.option("--once", "Exit after the first completed item run")
		.action(
			(id: string | undefined, opts: { write?: boolean; once?: boolean }) =>
				backlogNext({ allowEdits: opts.write !== false, once: opts.once }, id),
		);
}
