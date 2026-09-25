import type { FileData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { filterDiffFiles } from "./filterDiffFiles";

function file(
	oldPath: string,
	newPath: string,
	type: FileData["type"] = "modify",
): FileData {
	return {
		type,
		oldPath,
		newPath,
		oldRevision: "a",
		newRevision: "b",
		hunks: [],
		oldEndingNewLine: true,
		newEndingNewLine: true,
		oldMode: "100644",
		newMode: "100644",
	};
}

describe("filterDiffFiles", () => {
	it("returns every file when the query is blank", () => {
		const files = [file("src/a.ts", "src/a.ts"), file("src/b.ts", "src/b.ts")];
		expect(filterDiffFiles(files, { query: "", changeType: "all" })).toEqual(
			files,
		);
		expect(filterDiffFiles(files, { query: "   ", changeType: "all" })).toEqual(
			files,
		);
	});

	it("matches a case-insensitive substring of the path", () => {
		const files = [
			file("src/commands/Verify.ts", "src/commands/Verify.ts"),
			file("src/shared/loadConfig.ts", "src/shared/loadConfig.ts"),
		];
		expect(
			filterDiffFiles(files, { query: "verify", changeType: "all" }),
		).toEqual([files[0]]);
		expect(
			filterDiffFiles(files, { query: "SHARED", changeType: "all" }),
		).toEqual([files[1]]);
		expect(filterDiffFiles(files, { query: ".ts", changeType: "all" })).toEqual(
			files,
		);
	});

	it("trims surrounding whitespace from the query", () => {
		const files = [file("src/a.ts", "src/a.ts")];
		expect(
			filterDiffFiles(files, { query: "  src/a  ", changeType: "all" }),
		).toEqual(files);
	});

	it("matches on the new path for renames and the old path for deletions", () => {
		const renamed = file("src/old.ts", "src/new.ts", "rename");
		const deleted = file("src/gone.ts", "/dev/null", "delete");
		const files = [renamed, deleted];
		expect(filterDiffFiles(files, { query: "new", changeType: "all" })).toEqual(
			[renamed],
		);
		expect(filterDiffFiles(files, { query: "old", changeType: "all" })).toEqual(
			[],
		);
		expect(
			filterDiffFiles(files, { query: "gone", changeType: "all" }),
		).toEqual([deleted]);
	});

	it("returns an empty list when nothing matches", () => {
		const files = [file("src/a.ts", "src/a.ts")];
		expect(
			filterDiffFiles(files, { query: "nope", changeType: "all" }),
		).toEqual([]);
	});

	describe("change type", () => {
		const modified = file("src/modified.ts", "src/modified.ts", "modify");
		const added = file("/dev/null", "src/added.ts", "add");
		const removed = file("src/removed.ts", "/dev/null", "delete");
		const renamed = file("src/from.ts", "src/renamed.ts", "rename");
		const copied = file("src/source.ts", "src/copied.ts", "copy");
		const files = [modified, added, removed, renamed, copied];

		it("keeps every change type when set to all", () => {
			expect(filterDiffFiles(files, { query: "", changeType: "all" })).toEqual(
				files,
			);
		});

		it("keeps only modify for modified", () => {
			expect(
				filterDiffFiles(files, { query: "", changeType: "modified" }),
			).toEqual([modified]);
		});

		it("keeps only add for added", () => {
			expect(
				filterDiffFiles(files, { query: "", changeType: "added" }),
			).toEqual([added]);
		});

		it("keeps only delete for removed", () => {
			expect(
				filterDiffFiles(files, { query: "", changeType: "removed" }),
			).toEqual([removed]);
		});

		it("keeps both rename and copy for renamed", () => {
			expect(
				filterDiffFiles(files, { query: "", changeType: "renamed" }),
			).toEqual([renamed, copied]);
		});

		it("combines the query and change type with AND", () => {
			const otherModified = file("src/other.ts", "src/other.ts", "modify");
			const combined = [...files, otherModified];
			expect(
				filterDiffFiles(combined, { query: "other", changeType: "modified" }),
			).toEqual([otherModified]);
			expect(
				filterDiffFiles(combined, { query: "other", changeType: "added" }),
			).toEqual([]);
			expect(
				filterDiffFiles(combined, { query: "src/", changeType: "renamed" }),
			).toEqual([renamed, copied]);
		});
	});
});
