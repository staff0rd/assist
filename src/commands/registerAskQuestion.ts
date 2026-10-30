import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { askQuestion } from "./askQuestion";
import { askQuestionConfigHelp } from "./askQuestion/askQuestionConfigHelp";

export function registerAskQuestion(program: Command): void {
	internalCommand(
		configHelp(
			program
				.command("ask-question")
				.description(
					"Ask the AskUserQuestion questions in the session's web preview pane and wait for the answers; prints the same result text as the built-in tool",
				)
				.requiredOption(
					"--json <file|->",
					"AskUserQuestion input JSON ({questions: [...]}), or - for stdin",
				)
				.action(askQuestion),
			askQuestionConfigHelp,
		),
		"Claude in place of AskUserQuestion",
	);
}
