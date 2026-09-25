import type { Command } from "commander";
import { prsStatus } from "./prs/prsStatus";

export function registerPrsStatus(prsCommand: Command): void {
	prsCommand
		.command("status <repo...>")
		.description(
			"Report every open pull request in each owner/repo, grouped by repo",
		)
		.option("--json", "Output as JSON")
		.action(prsStatus);
}
