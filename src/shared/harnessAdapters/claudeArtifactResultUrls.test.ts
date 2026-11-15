import { describe, expect, it } from "vitest";
import { claudeConversationReader as reader } from "./claudeConversationReader";

const call = (id: string, input: Record<string, unknown>) => ({
	type: "assistant",
	message: { content: [{ type: "tool_use", id, name: "Artifact", input }] },
});

const result = (id: string, text: string, isError = false) => ({
	type: "user",
	message: {
		content: [
			{
				type: "tool_result",
				tool_use_id: id,
				is_error: isError,
				content: [{ type: "text", text }],
			},
		],
	},
});

const toolEvents = (entries: Record<string, unknown>[]) =>
	reader.events(entries).filter((e) => e.kind === "tool");

describe("Artifact result URL pairing", () => {
	it("pairs a publish result's artifact URL onto its call", () => {
		const [event] = toolEvents([
			call("a", { file_path: "/tmp/x/report.html" }),
			result(
				"a",
				"Published /tmp/x/report.html at https://claude.ai/artifact/Njpky9WApLNUMiK1HzskDW (Version 1)",
			),
		]);
		expect(event).toMatchObject({
			resultUrl: "https://claude.ai/artifact/Njpky9WApLNUMiK1HzskDW",
		});
	});

	it("pairs created and updated results by tool_use id", () => {
		const [created, updated] = toolEvents([
			call("c", { type_url: "https://claude.ai/artifact/T", title: "T" }),
			call("u", { url: "https://claude.ai/artifact/N", file_path: "/a" }),
			result(
				"u",
				"Updated the Artifact at https://claude.ai/artifact/N (Version 2)",
			),
			result(
				"c",
				"Created a new Artifact at https://claude.ai/artifact/N (version 1) from the Artifact type https://claude.ai/artifact/T",
			),
		]);
		expect(created).toMatchObject({
			resultUrl: "https://claude.ai/artifact/N",
		});
		expect(updated).toMatchObject({
			resultUrl: "https://claude.ai/artifact/N",
		});
	});

	it("ignores URLs in quickstart, read and error results", () => {
		const events = toolEvents([
			call("q", { action: "quickstart", intent: "design" }),
			result(
				"q",
				"Quickstart for a design. type_url: https://claude.ai/artifact/T",
			),
			call("e", { file_path: "/a" }),
			result("e", "Published /a at https://claude.ai/artifact/X", true),
		]);
		for (const event of events) expect(event).not.toHaveProperty("resultUrl");
	});
});
