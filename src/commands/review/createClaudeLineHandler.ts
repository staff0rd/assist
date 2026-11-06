import type { SpinnerHandle } from "./MultiSpinner";
import { parseClaudeEvent } from "./parseClaudeEvent";
import { reportReviewerToolUse } from "./reportReviewerToolUse";
import type { TokenUsage } from "./TokenUsage";

type ClaudeStreamState = {
	finalText: string;
	usage?: TokenUsage;
};

export function createClaudeLineHandler(
	name: string,
	spinner: SpinnerHandle | undefined,
): { state: ClaudeStreamState; onLine: (line: string) => void } {
	const state: ClaudeStreamState = { finalText: "" };
	const onLine = (line: string) => {
		const event = parseClaudeEvent(line);
		if (event.kind === "tool_uses") {
			for (const use of event.toolUses)
				reportReviewerToolUse(name, use, spinner);
			return;
		}
		if (event.kind === "final") {
			state.finalText = event.text;
			state.usage = event.usage;
		}
	};
	return { state, onLine };
}
