import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sessionWrittenPaths } from "./sessionWrittenPaths";

function toolUse(name: string, input: object): string {
	return JSON.stringify({
		type: "assistant",
		message: { content: [{ type: "tool_use", name, input }] },
	});
}

describe("sessionWrittenPaths", () => {
	it("collects each file written or edited, once", () => {
		const path = join(mkdtempSync(join(tmpdir(), "show-")), "t.jsonl");
		writeFileSync(
			path,
			[
				toolUse("Write", { file_path: "/a/new.md" }),
				toolUse("Edit", { file_path: "/a/new.md" }),
				toolUse("NotebookEdit", { notebook_path: "/a/n.ipynb" }),
				toolUse("Read", { file_path: "/a/read.md" }),
				"broken tool_use line",
			].join("\n"),
		);
		expect(sessionWrittenPaths(path)).toEqual(["/a/new.md", "/a/n.ipynb"]);
	});

	it("returns nothing for a missing transcript", () => {
		expect(sessionWrittenPaths("/missing.jsonl")).toEqual([]);
	});
});
