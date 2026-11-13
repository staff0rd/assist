import type { Command } from "commander";
import { collect } from "./collect";

export function addRaiseSectionOptions(command: Command): Command {
	return command
		.option("-t, --title <title>", "Title for the pull request")
		.option("--what <what>", "What the change does (## What section)")
		.option("--why <why>", "Why the change is needed (## Why section)")
		.option("--how <how>", "How the change works (optional ## How section)")
		.option(
			"--resolves <ref>",
			"Jira issue key or GitHub issue reference resolved by this PR, appended to ## Why (repeatable)",
			collect,
			[],
		)
		.option(
			"--screenshot <spec>",
			"Attach a screenshot as '[Group/]Caption=path' under ## Screenshots (repeatable)",
			collect,
			[],
		);
}
