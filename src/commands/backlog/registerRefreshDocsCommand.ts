import type { Command } from "commander";
import { refreshDocs } from "./refreshDocs";

export function registerRefreshDocsCommand(cmd: Command): void {
	cmd
		.command("refresh-docs")
		.description(
			"Create a Refresh docs item now for every done story not yet swept, regardless of docs.refreshAfter",
		)
		.action(refreshDocs);
}
