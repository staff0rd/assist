import type { Command } from "commander";
import { next as backlogNext } from "./backlog";
import { launchMode } from "./backlog/launchMode";
import { refine } from "./backlog/refine";
import { reviewComments } from "./reviewComments";

export function registerLaunch(program: Command): void {
	program
		.command("next")
		.argument("[id]", "Backlog item ID to run first")
		.description("Alias for backlog next")
		.option("--once", "Exit after the first completed item run")
		.action((id: string | undefined, opts: { once?: boolean }) =>
			backlogNext({ allowEdits: true, once: opts.once }, id),
		);

	program
		.command("draft")
		.alias("feat")
		.description(
			"Launch Claude in /draft mode, chain into next on /next signal",
		)
		.option("--once", "Exit when the initial task completes")
		.action((opts: { once?: boolean }) =>
			launchMode("draft", { once: opts.once }),
		);

	program
		.command("bug")
		.description("Launch Claude in /bug mode, chain into next on /next signal")
		.option("--once", "Exit when the initial task completes")
		.action((opts: { once?: boolean }) =>
			launchMode("bug", { once: opts.once }),
		);

	program
		.command("review-comments")
		.argument("[number]", "PR number to check out first")
		.description("Launch Claude in /review-comments mode (single session)")
		.action((number) => reviewComments(number));

	program
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Launch Claude in /refine mode to refine a backlog item")
		.option("--once", "Exit when the initial task completes")
		.action((id: string | undefined, opts: { once?: boolean }) =>
			refine(id, { once: opts.once }),
		);
}
