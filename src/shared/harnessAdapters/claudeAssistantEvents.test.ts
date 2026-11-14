import { describe, expect, it } from "vitest";
import { claudeAssistantEvents } from "./claudeAssistantEvents";

const toolUse = (input: Record<string, unknown>) => [
	{ type: "tool_use", name: "Bash", input },
];

describe("claudeAssistantEvents", () => {
	it("keeps a tool call's description alongside its target", () => {
		const [event] = claudeAssistantEvents(
			toolUse({ command: "ls -la", description: " List files " }),
		);
		expect(event).toMatchObject({
			kind: "tool",
			tool: "Bash",
			target: "ls -la",
			description: "List files",
		});
	});

	it("omits description when the input has none", () => {
		const [event] = claudeAssistantEvents(toolUse({ command: "ls" }));
		expect(event).not.toHaveProperty("description");
	});
});
