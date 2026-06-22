import type { Command } from "commander";
import { importBacklog } from "./import";

export function registerImportCommand(cmd: Command): void {
	cmd
		.command("import [file]")
		.description(
			"Restore every table in a dump back into the backlog database, in foreign-key-safe order, from a file or stdin if omitted (destructive)",
		)
		.option("-y, --yes", "Skip the confirmation prompt")
		.action((file: string | undefined, options: { yes?: boolean }) =>
			importBacklog(file, options),
		);
}
