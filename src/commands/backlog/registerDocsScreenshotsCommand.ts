import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

function collect(value: string, previous: string[] = []): string[] {
	return [...previous, value];
}

export function registerDocsScreenshotsCommand(cmd: Command): void {
	cmd
		.command("docs-screenshots <refresh-id>")
		.description(
			"List a Refresh docs item's covered stories whose commits changed UI files (.tsx, .jsx, .css, .html, .swift, .vue, .svelte), each with those files; exits non-zero until every one is mapped with --story to a screenshot declared on a docs page whose PNG is added or changed in the working tree",
		)
		.option(
			"--story <id=file.png>",
			"Map a UI story to the screenshot that documents it (repeatable)",
			collect,
		)
		.action(
			lazyAction(
				() => import("./docsScreenshots/docsScreenshots"),
				"docsScreenshots",
			),
		);
}
