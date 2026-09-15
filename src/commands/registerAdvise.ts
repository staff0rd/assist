import type { Command } from "commander";
import { advise } from "./advise/advise";

export function registerAdvise(program: Command): void {
	program
		.command("advise")
		.description(
			"Print the advice fragments that apply to this repo, composed from config and repo facts",
		)
		.option(
			"--hook",
			"emit the advice as SessionStart hook JSON (additionalContext)",
		)
		.action(async (options: { hook?: boolean }) => {
			await advise({ hook: options.hook });
		});
}
