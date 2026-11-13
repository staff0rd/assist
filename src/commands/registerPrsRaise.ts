import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { lazyHelpText } from "../shared/lazyHelpText";
import { addRaiseSectionOptions } from "./prs/addRaiseSectionOptions";
import { collect } from "./prs/collect";
import { prsRaiseConfigHelp } from "./prs/prsConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerPrsRaise(prsCommand: Command): void {
	const raiseCommand = addRaiseSectionOptions(
		prsCommand
			.command("raise")
			.description(
				"Raise a pull request, assembling the body from discrete sections",
			),
	)
		.option(
			"--force",
			"Overwrite the title and body of an existing pull request",
		)
		.option("-B, --base <branch>", "Branch into which the pull request merges")
		.option("-H, --head <branch>", "Branch that contains the commits")
		.option("-d, --draft", "Mark the pull request as a draft")
		.option(
			"--no-draft",
			"Create a ready-for-review pull request, overriding prs.draft",
		)
		.option("-w, --web", "Open the browser to create the pull request")
		.option("-l, --label <label>", "Add a label (repeatable)", collect, [])
		.option(
			"-a, --assignee <login>",
			"Assign a person by login (repeatable)",
			collect,
			[],
		)
		.option(
			"-r, --reviewer <handle>",
			"Request a review (repeatable)",
			collect,
			[],
		)
		.option("-m, --milestone <name>", "Add the pull request to a milestone");
	lazyHelpText(
		raiseCommand,
		async () => (await import("./prs/raiseHelpText")).raiseHelpText,
	).action(lazyAction(() => import("./prs/raise"), "raise"));

	internalCommand(raiseCommand, "/pr");
	configHelp(raiseCommand, prsRaiseConfigHelp);
}
