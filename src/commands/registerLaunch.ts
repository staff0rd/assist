import type { Command } from "commander";
import { launchMode } from "./backlog/launchMode";
import { next as backlogNext } from "./backlog/next";
import { registerRefineLaunch } from "./backlog/registerRefineLaunch";
import { reviewPrComments } from "./reviewPrComments";
import { registerFixConflict } from "./registerFixConflict";

type LaunchOpts = { once?: boolean; resumeSession?: string };

const RESUME_SESSION_FLAG =
	"Resume an interrupted Claude session (used by the sessions daemon on restart)";

function registerNext(program: Command): void {
	program
		.command("next")
		.argument("[id]", "Backlog item ID to run first")
		.description("Alias for backlog next")
		.option("--once", "Exit after the first completed item run")
		.action((id: string | undefined, opts: { once?: boolean }) =>
			backlogNext({ allowEdits: true, once: opts.once }, id),
		);
}

function registerDescriptionLaunch(
	program: Command,
	name: string,
	slashCommand: string,
	description: string,
	alias?: string,
): void {
	const command = program
		.command(name)
		.argument(
			"[description]",
			`Text to forward to the /${slashCommand} slash command`,
		)
		.description(description)
		.option("--once", "Exit when the initial task completes")
		.option("--resume-session <id>", RESUME_SESSION_FLAG)
		.action((text: string | undefined, opts: LaunchOpts) =>
			launchMode(slashCommand, {
				once: opts.once,
				description: text,
				resumeSessionId: opts.resumeSession,
			}),
		);
	if (alias) command.alias(alias);
}

function registerReviewPrComments(program: Command): void {
	program
		.command("review-pr-comments")
		.argument("[number]", "PR number to check out first")
		.description("Launch Claude in /review-pr-comments mode (single session)")
		.option(
			"--announce",
			"After every comment thread is processed, announce the PR in Slack via /prs-slack <number> --no-confirm (requires a PR number)",
		)
		.option("--resume-session <id>", RESUME_SESSION_FLAG)
		.action((number, opts: { announce?: boolean; resumeSession?: string }) =>
			reviewPrComments(number, {
				announce: opts.announce,
				resumeSessionId: opts.resumeSession,
			}),
		);
}

export function registerLaunch(program: Command): void {
	registerNext(program);
	registerDescriptionLaunch(
		program,
		"draft",
		"draft",
		"Launch Claude in /draft mode, chain into next on /next signal",
		"feat",
	);
	registerDescriptionLaunch(
		program,
		"bug",
		"bug",
		"Launch Claude in /bug mode, chain into next on /next signal",
	);
	registerReviewPrComments(program);
	registerFixConflict(program, RESUME_SESSION_FLAG);
	registerRefineLaunch(program, RESUME_SESSION_FLAG);
}
