import type { HarnessKind } from "../../../shared/harnesses";
import { sessionTitleFeature } from "../../../shared/harnessAdapters/harnessFeatures";
import {
	OneShotUnavailableError,
	runOneShotPrompt,
} from "../../../shared/runOneShotPrompt";
import { daemonLog } from "./daemonLog";

export const SESSION_TITLE_MAX_LENGTH = 48;

export async function generateSessionTitle(
	prompt: string,
	harness?: HarnessKind,
): Promise<string | undefined> {
	try {
		const stdout = await runOneShotPrompt(
			buildPrompt(prompt),
			sessionTitleFeature,
			{ harness },
		);
		return normaliseTitle(stdout);
	} catch (error) {
		if (error instanceof OneShotUnavailableError)
			daemonLog(`session title: ${error.message.replaceAll("\n", " ")}`);
		return undefined;
	}
}

function normaliseTitle(stdout: string): string | undefined {
	const title = (stdout.trim().split(/\r?\n/)[0] ?? "")
		.trim()
		.replace(/^["'`]+/, "")
		.replace(/["'`]+$/, "")
		.replace(/[.,:;!?]+$/, "")
		.trim()
		.slice(0, SESSION_TITLE_MAX_LENGTH)
		.trim();
	return title || undefined;
}

function buildPrompt(prompt: string): string {
	return [
		"Summarise the task below as a short title for a session card.",
		"Rules:",
		"- 2 to 5 words that capture the essence of the task",
		"- sentence case, no trailing punctuation",
		"- reply with ONLY the title, no quotes or explanation",
		"",
		`Task: ${prompt}`,
	].join("\n");
}
