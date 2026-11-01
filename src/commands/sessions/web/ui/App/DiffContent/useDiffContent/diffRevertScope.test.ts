import { describe, expect, it } from "vitest";
import { diffRevertScope } from "./diffRevertScope";

describe("diffRevertScope", () => {
	it("offers per-file and bulk revert in the Uncommitted scope", () => {
		expect(diffRevertScope("uncommitted")).toEqual({
			file: true,
			paths: true,
			needsUncommittedFiles: false,
		});
	});

	it.each(["all", "branch"])(
		"offers per-file and bulk revert, gated on uncommitted files, in the %s scope",
		(scope) => {
			expect(diffRevertScope(scope)).toEqual({
				file: true,
				paths: true,
				needsUncommittedFiles: true,
			});
		},
	);

	it("offers no revert in a single-commit scope", () => {
		expect(diffRevertScope("3f3489b7")).toEqual({
			file: false,
			paths: false,
			needsUncommittedFiles: false,
		});
	});
});
