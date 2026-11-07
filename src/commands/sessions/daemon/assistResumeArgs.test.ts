import { Command, CommanderError } from "commander";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../shared/pullIfConfigured", () => ({
	pullIfConfigured: vi.fn(),
}));

import { registerRunCommand } from "../../backlog/registerRunCommand";
import { registerLaunch } from "../../registerLaunch";
import { registerReview } from "../../registerReview";
import { assistResumeArgs } from "./assistResumeArgs";

const SESSION_LAUNCH_ARGS: string[][] = [
	["draft", "--once"],
	["feat", "--once"],
	["bug", "--once"],
	["refine", "--once"],
	["refine", "--once", "--harness", "codex", "a279"],
	["next"],
	["next", "a900"],
	["update"],
	["review"],
	["review", "--refine"],
	["review", "--apply"],
	["review", "--no-prompt", "--submit", "195"],
	["review-pr-comments", "195"],
	["review-pr-comments", "--announce", "195"],
	["fix-conflict", "195"],
	["fix-conflict", "--rebase", "195"],
	["backlog", "run", "295"],
];

function silence(command: Command): Command {
	command.exitOverride();
	command.configureOutput({ writeOut: () => {}, writeErr: () => {} });
	command.action(() => {});
	for (const child of command.commands) silence(child);
	return command;
}

function buildProgram(): Command {
	const program = new Command();
	registerLaunch(program);
	registerReview(program);
	registerRunCommand(program.command("backlog"));
	program.command("update");
	return silence(program);
}

describe("assistResumeArgs", () => {
	it("appends the resume flag for a command that declares it", () => {
		expect(
			assistResumeArgs({ assistArgs: ["draft"], resumeSessionId: "conv-1" }),
		).toEqual(["assist", "draft", "--resume-session", "conv-1"]);
	});

	it("omits the resume flag for a command that does not declare it", () => {
		expect(
			assistResumeArgs({ assistArgs: ["next"], resumeSessionId: "conv-1" }),
		).toEqual(["assist", "next"]);
	});

	it("omits the resume flag for a backlog subcommand other than run", () => {
		expect(
			assistResumeArgs({
				assistArgs: ["backlog", "web"],
				resumeSessionId: "conv-1",
			}),
		).toEqual(["assist", "backlog", "web"]);
	});

	it("omits the resume flag when no conversation was recorded", () => {
		expect(assistResumeArgs({ assistArgs: ["fix-conflict"] })).toEqual([
			"assist",
			"fix-conflict",
		]);
	});

	it.each(SESSION_LAUNCH_ARGS)(
		"produces args the CLI accepts for `assist %s`",
		(...assistArgs: string[]) => {
			const [, ...args] = assistResumeArgs({
				assistArgs,
				resumeSessionId: "conv-1",
			});

			expect(() => buildProgram().parse(args, { from: "user" })).not.toThrow(
				CommanderError,
			);
		},
	);
});
