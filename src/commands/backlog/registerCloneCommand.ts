import type { Command } from "commander";

export function registerCloneCommand(cmd: Command): void {
	cmd
		.command("clone <origin>")
		.description(
			"Clone a repo over SSH into the configured base directory, deriving the SSH remote from a stored origin (host/org/repo -> git@host:org/repo.git); local: origins are not clonable",
		)
		.action(async (origin: string) =>
			(await import("./cloneRepo")).cloneRepo(origin),
		);
}
