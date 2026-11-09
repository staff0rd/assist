import { describe, expect, it } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { codexConversationReader } from "../../../shared/harnessAdapters/codexConversationReader";
import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { lastWriteTimes } from "./lastWriteTimes";

function claudeToolUse(timestamp: string, name: string, input: object) {
	return {
		type: "assistant",
		timestamp,
		message: { content: [{ type: "tool_use", name, input }] },
	};
}

function codexFileChange(timestamp: string, changes: object) {
	return {
		timestamp,
		type: "event_msg",
		payload: {
			type: "item_completed",
			item: { type: "FileChange", changes, status: "completed" },
		},
	};
}

function codexPatch(timestamp: string, patch: string) {
	return {
		timestamp,
		type: "response_item",
		payload: { type: "custom_tool_call", name: "apply_patch", input: patch },
	};
}

function fakeWrite(at: string, path: string): ConversationEvent {
	return {
		kind: "tool",
		tool: "write",
		target: path,
		operations: [{ kind: "fileWrite", tool: "write", path, contents: [] }],
		at,
	};
}

const target = {
	file: "docs/guide/pages/start.json",
	within: "docs/guide/",
};

describe("lastWriteTimes", () => {
	it("finds the newest Claude write to the file and to anything within the directory", () => {
		const events = claudeConversationReader.events([
			claudeToolUse("2026-10-25T01:00:00Z", "Edit", {
				file_path: "/r/docs/guide/pages/start.json",
			}),
			claudeToolUse("2026-10-25T02:00:00Z", "Write", {
				file_path: "/r/docs/guide/styles.css",
			}),
			claudeToolUse("2026-10-25T03:00:00Z", "Read", {
				file_path: "/r/docs/guide/pages/start.json",
			}),
		]);
		expect(lastWriteTimes(events, target)).toEqual({
			file: Date.parse("2026-10-25T01:00:00Z"),
			within: Date.parse("2026-10-25T02:00:00Z"),
		});
	});

	it("reads Codex FileChange items and relative apply_patch paths", () => {
		const events = codexConversationReader.events([
			codexFileChange("2026-10-25T01:00:00Z", {
				"/r/docs/guide/pages/start.json": { type: "update" },
			}),
			codexPatch(
				"2026-10-25T02:00:00Z",
				"*** Begin Patch\n*** Add File: docs/guide/new.css\n+a\n*** End Patch",
			),
		]);
		expect(lastWriteTimes(events, target, "/r")).toEqual({
			file: Date.parse("2026-10-25T01:00:00Z"),
			within: Date.parse("2026-10-25T02:00:00Z"),
		});
	});

	it("reads fileWrite operations from any harness's events", () => {
		expect(
			lastWriteTimes(
				[fakeWrite("2026-10-25T04:00:00Z", "/r/docs/guide/pages/start.json")],
				target,
			),
		).toEqual({
			file: Date.parse("2026-10-25T04:00:00Z"),
			within: Date.parse("2026-10-25T04:00:00Z"),
		});
	});

	it("reports nothing for a session that never wrote docs or has no events", () => {
		const events = claudeConversationReader.events([
			claudeToolUse("2026-10-25T01:00:00Z", "Edit", {
				file_path: "/r/src/a.ts",
			}),
		]);
		expect(lastWriteTimes(events, target)).toEqual({});
		expect(lastWriteTimes([], target)).toEqual({});
	});
});
