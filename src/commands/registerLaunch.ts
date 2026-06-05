import type { Command } from "commander";
import { next as backlogNext } from "./backlog";
import { launchMode } from "./backlog/launchMode";
import { refine } from "./backlog/refine";
import { reviewComments } from "./reviewComments";

export function registerLaunch(program: Command): void {
	program
		.command("next")
		.description("Alias for backlog next")
		.action(() => backlogNext({ allowEdits: true }));

	program
		.command("draft")
		.alias("feat")
		.description(
			"Launch Claude in /draft mode, chain into next on /next signal",
		)
		.action(() => launchMode("draft"));

	program
		.command("bug")
		.description("Launch Claude in /bug mode, chain into next on /next signal")
		.action(() => launchMode("bug"));

	program
		.command("review-comments")
		.argument("[number]", "PR number to check out first")
		.description("Launch Claude in /review-comments mode (single session)")
		.action((number) => reviewComments(number));

	program
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Launch Claude in /refine mode to refine a backlog item")
		.action((id) => refine(id));
}
