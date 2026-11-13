import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { lazyAction } from "../shared/lazyAction";

export function registerPrsStatus(prsCommand: Command): void {
	internalCommand(
		prsCommand
			.command("status <repo...>")
			.description(
				"Report every open pull request in each owner/repo, grouped by repo",
			)
			.option("--json", "Output as JSON")
			.action(lazyAction(() => import("./prs/prsStatus"), "prsStatus")),
		"/prs-status",
	);

	internalCommand(
		prsCommand
			.command("slack-channel")
			.description(
				"Print the Slack channel PRs are announced to (prs.slack, else slack.channel)",
			)
			.action(
				lazyAction(() => import("./prs/prsSlackChannel"), "prsSlackChannel"),
			),
		"/prs-slack",
	);
}
