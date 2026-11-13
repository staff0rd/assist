import type { Command } from "commander";

export function registerImportCommand(cmd: Command): void {
	cmd
		.command("import [file]")
		.description(
			"Restore every table in a dump back into the backlog database, in foreign-key-safe order, from a file or stdin if omitted (destructive)",
		)
		.option("-y, --yes", "Skip the confirmation prompt")
		.action(async (file: string | undefined, options: { yes?: boolean }) =>
			(await import("./importBacklog")).importBacklog(file, options),
		);
}
