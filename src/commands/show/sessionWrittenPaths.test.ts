import { describe, expect, it } from "vitest";
import { claudeConversationReader } from "../../shared/harnessAdapters/claudeConversationReader";
import type { ConversationEvent } from "../../shared/harnessAdapters/types";
import { sessionWrittenPaths } from "./sessionWrittenPaths";

function toolUse(name: string, input: object) {
	return {
		type: "assistant",
		timestamp: "2026-11-10T00:00:00.000Z",
		message: { content: [{ type: "tool_use", id: name, name, input }] },
	};
}

describe("sessionWrittenPaths", () => {
	it("collects each file a Claude session wrote or edited, once", () => {
		const events = claudeConversationReader.events([
			toolUse("Write", { file_path: "/a/new.md", content: "x" }),
			toolUse("Edit", { file_path: "/a/new.md", new_string: "y" }),
			toolUse("NotebookEdit", { notebook_path: "/a/n.ipynb" }),
			toolUse("Read", { file_path: "/a/read.md" }),
		]);
		expect(sessionWrittenPaths(events)).toEqual(["/a/new.md", "/a/n.ipynb"]);
	});

	it("collects writes from any harness's normalized events", () => {
		const events: ConversationEvent[] = [
			{
				kind: "tool",
				tool: "apply_patch",
				target: "/repo/a.ts",
				operations: [
					{
						kind: "fileWrite",
						tool: "apply_patch",
						path: "/repo/a.ts",
						contents: [],
					},
					{ kind: "command", tool: "apply_patch", command: "ls" },
				],
			},
			{ kind: "message", role: "assistant", text: "done" },
		];
		expect(sessionWrittenPaths(events)).toEqual(["/repo/a.ts"]);
	});

	it("returns nothing without events", () => {
		expect(sessionWrittenPaths([])).toEqual([]);
	});
});
