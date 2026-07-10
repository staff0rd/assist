import { execFileSync } from "node:child_process";
import { formatItemId } from "../../backlog/formatItemId";
import { extractFirstUserMessage } from "./extractFirstUserMessage";
import { scanSessionBacklogRefs } from "./scanSessionBacklogRefs";

/**
 * Generate a one-line summary for a session JSONL file by calling
 * the Claude CLI in non-interactive (print) mode.
 *
 * Returns the summary string, or undefined if summarisation failed.
 */
export function summariseSession(jsonlPath: string): string | undefined {
	const firstMessage = extractFirstUserMessage(jsonlPath);
	const backlogIds = scanSessionBacklogRefs(jsonlPath);

	if (!firstMessage && backlogIds.length === 0) {
		return undefined;
	}

	const prompt = buildPrompt(firstMessage, backlogIds);

	try {
		const output = execFileSync("claude", ["-p", "--model", "haiku", prompt], {
			encoding: "utf8",
			timeout: 30_000,
			stdio: ["ignore", "pipe", "ignore"],
		});
		const summary = output.trim();
		if (!summary) return undefined;
		// Enforce single line, strip quotes if the model wraps them
		return summary
			.split("\n")[0]
			.replace(/^["']|["']$/g, "")
			.trim();
	} catch {
		return undefined;
	}
}

function buildPrompt(
	firstMessage: string | undefined,
	backlogIds: number[],
): string {
	const parts: string[] = [
		"Summarise this Claude Code session in ONE short sentence (under 100 chars).",
		"Return ONLY the summary, no quotes or explanation.",
	];

	if (backlogIds.length > 0) {
		const refs = backlogIds.map((id) => formatItemId(id)).join(", ");
		parts.push(
			`The session references backlog item(s) ${refs}. Start the summary with "Backlog ${refs} —" if relevant.`,
		);
	}

	if (firstMessage) {
		parts.push(`First user message:\n${firstMessage}`);
	}

	return parts.join("\n");
}
