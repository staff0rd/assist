import { requestPromptSession } from "../sessions/shared/requestPromptSession";
import { startChainedSession } from "./startChainedSession";

export function announcePr(prNumber: number): Promise<void> {
	return startChainedSession(
		`a Slack announce session for PR #${prNumber}`,
		() =>
			requestPromptSession(
				`/prs-slack ${prNumber} --no-confirm`,
				process.cwd(),
				{ inPlace: true },
			),
	);
}
