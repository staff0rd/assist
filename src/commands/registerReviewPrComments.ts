import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { harnessConfigHelp } from "./backlog/harnessConfigHelp";

export function registerReviewPrComments(
	program: Command,
	resumeFlag: string,
): void {
	const command = program
		.command("review-pr-comments")
		.argument("[number]", "PR number to check out first")
		.description(
			"Launch a coding harness in /review-pr-comments mode (single session)",
		)
		.option(
			"--announce",
			"After every comment thread is processed, announce the PR in Slack via /prs-slack <number> --no-confirm (requires a PR number)",
		)
		.option(
			"--auto",
			"Accept the harness's own recommendation for each thread without asking, falling back to asking only for threads it cannot confidently decide",
		)
		.option("--resume-session <id>", resumeFlag)
		.option(
			"--harness <kind>",
			"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, before checking the PR out, when Address comments is unavailable on it",
		)
		.action(
			async (
				number,
				opts: {
					announce?: boolean;
					auto?: boolean;
					resumeSession?: string;
					harness?: string;
				},
			) => {
				const { resolveHarness } = await import("./backlog/resolveHarness");
				const { reviewPrComments } = await import("./reviewPrComments");
				return reviewPrComments(number, {
					announce: opts.announce,
					auto: opts.auto,
					resumeSessionId: opts.resumeSession,
					harness: resolveHarness(opts.harness),
				});
			},
		);
	configHelp(command, harnessConfigHelp);
}
