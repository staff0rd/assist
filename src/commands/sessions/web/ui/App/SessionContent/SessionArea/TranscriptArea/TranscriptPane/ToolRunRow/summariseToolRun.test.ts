import { describe, expect, it } from "vitest";
import { summariseToolRun } from "./summariseToolRun";

const call = (tool: string, target = "") => ({ tool, target });

describe("summariseToolRun", () => {
	it("counts non-file tools in first-seen order", () => {
		const calls = ["Bash", "Grep", "Bash", "Bash"].map((t) => call(t, "x"));
		expect(summariseToolRun(calls)).toEqual({
			count: 4,
			edited: [],
			read: [],
			tools: "Bash ×3, Grep",
		});
	});

	it("lists edited and read files, de-duplicated", () => {
		const s = summariseToolRun([
			call("Read", "src/a.ts"),
			call("Read", "src/b.ts"),
			call("Read", "src/a.ts"),
			call("Edit", "src/a.ts"),
			call("MultiEdit", "src/c.ts"),
			call("Write", "src/c.ts"),
			call("Bash", "ls"),
		]);
		expect(s.count).toBe(7);
		expect(s.edited).toEqual(["src/a.ts", "src/c.ts"]);
		expect(s.read).toEqual(["src/b.ts"]);
		expect(s.tools).toBe("Bash");
	});

	it("names apply_patch files from a joined target or patch text", () => {
		expect(
			summariseToolRun([call("apply_patch", "a.ts, b.ts")]).edited,
		).toEqual(["a.ts", "b.ts"]);
		const patch =
			"*** Begin Patch *** Update File: src/x.ts @@ -1 +1 *** Add File: src/y.ts";
		expect(summariseToolRun([call("apply_patch", patch)]).edited).toEqual([
			"src/x.ts",
			"src/y.ts",
		]);
	});

	it("counts file tools without a target as tools", () => {
		expect(summariseToolRun([call("Read"), call("Edit")]).tools).toBe(
			"Read, Edit",
		);
	});
});
