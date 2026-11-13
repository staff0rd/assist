import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { harnessConfigHelp } from "./backlog/harnessConfigHelp";

export function registerFixConflict(
	program: Command,
	resumeFlag: string,
): void {
	const command = program
		.command("fix-conflict")
		.argument("[number]", "PR number to check out first")
		.option("--rebase", "Rebase onto the remote default instead of merging")
		.option("--resume-session <id>", resumeFlag)
		.option(
			"--harness <kind>",
			"Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, before checking the PR out, when Fix conflicts is unavailable on it",
		)
		.description(
			"Launch a coding harness in /fix-conflict mode (single session)",
		)
		.action(
			async (
				number: string | undefined,
				options: { rebase?: boolean; resumeSession?: string; harness?: string },
			) => {
				const { resolveHarness } = await import("./backlog/resolveHarness");
				const { fixConflict } = await import("./fixConflict");
				return fixConflict(number, {
					rebase: options.rebase,
					resumeSessionId: options.resumeSession,
					harness: resolveHarness(options.harness),
				});
			},
		);
	configHelp(command, harnessConfigHelp);
}
