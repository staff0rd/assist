import type { Command } from "commander";
import { importBacklog } from "./import";

export function registerImportCommand(cmd: Command): void {
	cmd
		.command("import [file]")
		.description(
			"Restore the entire backlog database from a dump file, or stdin if omitted (destructive)",
		)
		.option("-y, --yes", "Skip the confirmation prompt")
		.action((file: string | undefined, options: { yes?: boolean }) =>
			importBacklog(file, options),
		);
}
