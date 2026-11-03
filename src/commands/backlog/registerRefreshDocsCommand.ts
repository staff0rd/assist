import type { Command } from "commander";
import { refreshDocs } from "./refreshDocs";

export function registerRefreshDocsCommand(cmd: Command): void {
	cmd
		.command("refresh-docs")
		.description(
			"Create a Refresh docs item now for every done story not yet swept, without waiting for docs.refreshAfter (refused when docs.refreshAfter is unset: Refresh docs is off)",
		)
		.action(refreshDocs);
}
