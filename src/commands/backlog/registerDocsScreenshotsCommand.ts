import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerDocsScreenshotsCommand(cmd: Command): void {
	cmd
		.command("docs-screenshots <refresh-id>")
		.description(
			"List a Refresh docs item's covered stories whose commits changed UI files (.tsx, .jsx, .css, .html, .swift, .vue, .svelte), each with those files",
		)
		.action(
			lazyAction(
				() => import("./docsScreenshots/docsScreenshots"),
				"docsScreenshots",
			),
		);
}
