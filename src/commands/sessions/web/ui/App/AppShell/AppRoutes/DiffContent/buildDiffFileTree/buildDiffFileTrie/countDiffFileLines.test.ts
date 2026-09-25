import type { FileData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { countDiffFileLines } from "./countDiffFileLines";

type Kind = "insert" | "delete" | "normal";

function hunk(kinds: Kind[]) {
	return {
		changes: kinds.map((type) => ({ type, content: type })),
	};
}

const fileWith = (hunks: unknown[]): FileData =>
	({ oldPath: "a.ts", newPath: "a.ts", type: "modify", hunks }) as FileData;

describe("countDiffFileLines", () => {
	it("counts inserts and deletes, ignoring context lines", () => {
		const file = fileWith([
			hunk(["normal", "insert", "insert", "delete", "normal"]),
		]);

		expect(countDiffFileLines(file)).toEqual({ added: 2, removed: 1 });
	});

	it("sums counts across every hunk", () => {
		const file = fileWith([hunk(["insert", "delete"]), hunk(["insert"])]);

		expect(countDiffFileLines(file)).toEqual({ added: 2, removed: 1 });
	});

	it("reports zero for a file with no hunks", () => {
		expect(countDiffFileLines(fileWith([]))).toEqual({ added: 0, removed: 0 });
	});

	it("reports zero when hunks are absent", () => {
		expect(countDiffFileLines({} as FileData)).toEqual({
			added: 0,
			removed: 0,
		});
	});
});
