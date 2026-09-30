import { readFileSync } from "node:fs";

export function readEventPrNumber(env: NodeJS.ProcessEnv): number {
	const eventPath = env.GITHUB_EVENT_PATH;
	if (!eventPath)
		throw new Error("GITHUB_EVENT_PATH is not set; run this from a workflow");
	const event = JSON.parse(readFileSync(eventPath, "utf8")) as {
		pull_request?: { number?: number };
	};
	const prNumber = event.pull_request?.number;
	if (!prNumber)
		throw new Error(
			"The workflow event has no pull_request; trigger it on pull_request",
		);
	return prNumber;
}
