import type { Command } from "commander";
import { next as backlogNext } from "./backlog";
import { launchMode } from "./backlog/launchMode";
import { refine } from "./backlog/refine";
import { reviewComments } from "./reviewComments";

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

function registerReviewComments(program: Command): void {
	program
		.command("review-comments")
		.argument("[number]", "PR number to check out first")
		.description("Launch Claude in /review-comments mode (single session)")
		.action((number) => reviewComments(number));
}

function registerRefine(program: Command): void {
	program
		.command("refine")
		.argument("[id]", "Backlog item ID")
		.description("Launch Claude in /refine mode to refine a backlog item")
		.option("--once", "Exit when the initial task completes")
		.option("--resume-session <id>", RESUME_SESSION_FLAG)
		.action((id: string | undefined, opts: LaunchOpts) =>
			refine(id, { once: opts.once, resumeSessionId: opts.resumeSession }),
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
	registerReviewComments(program);
	registerRefine(program);
}
