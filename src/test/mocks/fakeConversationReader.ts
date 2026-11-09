import type {
	ConversationEvent,
	ConversationReader,
} from "../../shared/harnessAdapters/types";
import { fakeToolOperations } from "./fakeToolOperations";

type FakeLine = Record<string, unknown>;

function str(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function lineEvents(line: FakeLine): ConversationEvent[] {
	const at = str(line.at) || undefined;
	if (line.say === "user" || line.say === "agent")
		return [
			{
				kind: "message",
				role: line.say === "user" ? "user" : "assistant",
				text: str(line.text),
				at,
			},
		];
	if (typeof line.use === "string") {
		const input = (line.input ?? {}) as Record<string, unknown>;
		return [
			{
				kind: "tool",
				tool: line.use,
				target: str(input.cmd) || str(input.file),
				operations: fakeToolOperations({
					toolName: line.use,
					toolInput: input,
				}),
				at,
			},
		];
	}
	if (typeof line.result === "string")
		return [{ kind: "toolResult", text: line.result, at }];
	return [];
}

export const fakeConversationReader: ConversationReader = {
	headBytes: 4096,
	locate: ({ harnessSessionId }) =>
		harnessSessionId ? `/fake/${harnessSessionId}.log` : null,
	watchTarget: ({ harnessSessionId }) =>
		harnessSessionId ? { dir: "/fake", file: `${harnessSessionId}.log` } : null,
	events: (lines) => lines.flatMap(lineEvents),
	lifecycle: (lines) => {
		const turn = [...lines]
			.reverse()
			.find((line) => typeof line.turn === "string")?.turn;
		return {
			status: turn === "start" ? "running" : turn === "end" ? "waiting" : null,
			asking: lines.at(-1)?.use === "ask",
		};
	},
	fingerprint: (lines) => str(lines.at(-1)?.seq) || null,
};
