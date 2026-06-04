import type { Command } from "commander";
import { run as backlogRun } from "./run";

export function registerRunCommand(cmd: Command): void {
	cmd
		.command("run <id>")
		.description("Run a backlog item's plan phase-by-phase with Claude")
		.option("-w, --write", "Run Claude with auto permission mode (default)")
		.option("--no-write", "Run Claude without auto permission mode")
		.action(async (id: string, opts: { write?: boolean }) => {
			await backlogRun(id, { allowEdits: opts.write !== false });
		});
}
