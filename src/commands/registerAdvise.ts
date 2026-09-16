import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { adviceConfigHelp } from "./advise/adviceConfigHelp";
import { advise } from "./advise/advise";

export function registerAdvise(program: Command): void {
	const adviseCommand = program
		.command("advise")
		.description(
			"Print the advice fragments that apply to this repo, composed from config and repo facts",
		)
		.option(
			"--hook",
			"emit the advice as SessionStart hook JSON (additionalContext)",
		)
		.option(
			"--explain",
			"list every shipped fragment with whether it was included and why",
		)
		.action(async (options: { hook?: boolean; explain?: boolean }) => {
			await advise({ hook: options.hook, explain: options.explain });
		});

	configHelp(adviseCommand, adviceConfigHelp);
}
