import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { askCheck } from "./askCheck";
import { askQuestionConfigHelp } from "./askQuestion/askQuestionConfigHelp";

export function registerAskCheck(program: Command): void {
	internalCommand(
		configHelp(
			program
				.command("ask-check")
				.description(
					"Ask the user to perform a manual check in the session's web preview pane and wait for Works / Doesn't work plus an optional note",
				)
				.requiredOption(
					"--json <file|->",
					"Check JSON ({title, steps, before?, changed?}): title ≤60 chars, 1-4 steps ≤90 chars each, ≤4 before chips, changed ≤160 chars; or - for stdin",
				)
				.action(askCheck),
			askQuestionConfigHelp,
		),
		"Claude when asking the user to test a change",
	);
}
