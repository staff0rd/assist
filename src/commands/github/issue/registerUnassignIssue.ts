import type { Command } from "commander";
import { internalCommand } from "../../../shared/internalCommand";
import { lazyAction } from "../../../shared/lazyAction";

export function registerUnassignIssue(issueCommand: Command): void {
	const unassignCommand = issueCommand
		.command("unassign <number>")
		.description(
			"Remove yourself, or the named logins, from a GitHub issue's assignees",
		)
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.option(
			"--assignee <login>",
			"Login to remove instead of @me (repeatable)",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.action(lazyAction(() => import("./unassignIssue"), "unassignIssue"));
	internalCommand(unassignCommand, "agents removing an assignee");
}
