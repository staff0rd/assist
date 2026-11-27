import type { Command } from "commander";
import { type ConfigHelpEntry, configHelp } from "../shared/configHelp";

export function registerReviewInstance(
	reviewCommand: Command,
	entries: ConfigHelpEntry[],
): void {
	const instanceCommand = reviewCommand
		.command("instance")
		.description(
			"Bring a PR up as an isolated, throwaway instance via the repo's review.instance compose file, have an agent run the manualTesting steps saved by `assist review high-level <pr>` against it in a headless browser (recording a video of the session) or, with --headed, a visible one, watch each compose service's logs and the browser's console errors, page errors and 5xx responses, print a pass/fail/unsure verdict per step with screenshots and the errors logged during it in a report directory (exit 1 when any step fails or logs an unignored error), then tear it down (compose down -v and worktree removal), also on Ctrl+C or failure",
		)
		.argument("<pr>", "PR number to bring up at its head SHA")
		.option(
			"--keep",
			"Leave the instance and its worktree up after the steps run",
		)
		.option(
			"--headed",
			"Run the steps in a visible, slowed-down browser window to watch the agent live, instead of recording a video",
		)
		.action(
			async (pr: string, options: { keep?: boolean; headed?: boolean }) => {
				const { reviewInstance } =
					await import("./review/instance/reviewInstance");
				return reviewInstance(pr, options);
			},
		);
	configHelp(instanceCommand, entries);
}
