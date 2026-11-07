import { describe, expect, it } from "vitest";
import { harnessActivityFields } from "./harnessActivityFields";

describe("harnessActivityFields", () => {
	it("reports the claude conversation id and no harness for claude", () => {
		expect(harnessActivityFields("claude", "conv-1")).toEqual({
			claudeSessionId: "conv-1",
		});
	});

	it("treats an absent harness as claude", () => {
		expect(harnessActivityFields(undefined, "conv-1")).toEqual({
			claudeSessionId: "conv-1",
		});
	});

	it("reports the harness and withholds the claude id for another harness", () => {
		expect(harnessActivityFields("codex", "conv-1")).toEqual({
			harness: "codex",
		});
	});

	it("reports the resumed conversation id for another harness", () => {
		expect(harnessActivityFields("codex", "conv-1", "conv-1")).toEqual({
			harness: "codex",
			harnessSessionId: "conv-1",
		});
	});

	it("withholds the resumed id from the claude fields", () => {
		expect(harnessActivityFields("claude", "conv-1", "conv-1")).toEqual({
			claudeSessionId: "conv-1",
		});
	});
});
