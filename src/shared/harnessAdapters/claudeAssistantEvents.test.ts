import { describe, expect, it } from "vitest";
import { claudeAssistantEvents } from "./claudeAssistantEvents";

const toolUse = (input: Record<string, unknown>, name = "Bash") => [
	{ type: "tool_use", name, input },
];

const artifact = (input: Record<string, unknown>) =>
	claudeAssistantEvents(toolUse(input, "Artifact"))[0];

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

	it("labels an Artifact quickstart by action and intent, carrying its fields", () => {
		expect(artifact({ action: "quickstart", intent: "design" })).toMatchObject({
			target: "",
			label: "quickstart · design",
			fields: [
				{ name: "action", value: "quickstart" },
				{ name: "intent", value: "design" },
			],
		});
	});

	it("labels an Artifact create from type_url by its title", () => {
		const event = artifact({
			type_url: "https://claude.ai/artifact/type/abc",
			title: "Release plan",
			auto_open: "after_first_write",
		});
		expect(event).toMatchObject({ label: "Release plan" });
		expect(event).toHaveProperty("fields", [
			{ name: "type_url", value: "https://claude.ai/artifact/type/abc" },
			{ name: "title", value: "Release plan" },
			{ name: "auto_open", value: "after_first_write" },
		]);
	});

	it("labels an untitled type_url Artifact as a create", () => {
		expect(artifact({ type_url: "https://claude.ai/t/x" })).toMatchObject({
			label: "create",
		});
	});

	it("labels an Artifact publish by its file's base name", () => {
		expect(
			artifact({
				file_path: "/tmp/claude/scratchpad/report.html",
				icon: "chart",
			}),
		).toMatchObject({ label: "publish · report.html" });
	});

	it("serialises non-string Artifact input values", () => {
		expect(
			artifact({ action: "publish", files: { "a.css": "a.css" } }),
		).toMatchObject({
			fields: [
				{ name: "action", value: "publish" },
				{ name: "files", value: '{"a.css":"a.css"}' },
			],
		});
	});

	it("adds no label or fields to other tools", () => {
		const [event] = claudeAssistantEvents(toolUse({ command: "ls" }));
		expect(event).not.toHaveProperty("label");
		expect(event).not.toHaveProperty("fields");
	});
});
