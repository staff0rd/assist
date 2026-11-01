import { describe, expect, it } from "vitest";
import { uncommittedFiles } from "./uncommittedFiles";

describe("uncommittedFiles", () => {
	it("reads the working tree counts when there is no change set", () => {
		const files = uncommittedFiles({
			new: ["a.ts"],
			modified: ["b.ts"],
			deleted: ["c.ts"],
		});

		expect([...files.paths]).toEqual(["a.ts", "b.ts", "c.ts"]);
		expect([...files.newPaths]).toEqual(["a.ts"]);
	});

	it("prefers the uncommitted subset over the change set's counts", () => {
		const files = uncommittedFiles({
			new: ["committed.ts"],
			modified: [],
			deleted: [],
			uncommitted: { new: [], modified: ["edited.ts"], deleted: [] },
		});

		expect([...files.paths]).toEqual(["edited.ts"]);
		expect(files.newPaths.size).toBe(0);
	});

	it("is empty before the status has loaded", () => {
		expect(uncommittedFiles(null).paths.size).toBe(0);
	});
});
