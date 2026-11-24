import { describe, expect, it } from "vitest";
import { diffTestHierarchies } from "./diffTestHierarchies";
import { extractTestHierarchy } from "./extractTestHierarchy";
import type { HighLevelTestNode } from "./types";

function diff(base: string, head: string, patch: string): HighLevelTestNode[] {
	return diffTestHierarchies(
		"a.test.ts",
		extractTestHierarchy("a.test.ts", head),
		extractTestHierarchy("a.test.ts", base),
		patch,
	);
}

function shape(nodes: HighLevelTestNode[]): unknown[] {
	return nodes.map((node) =>
		node.kind === "it"
			? `${node.change ?? "·"} ${node.name}`
			: { [node.name]: shape(node.children) },
	);
}

describe("diffTestHierarchies", () => {
	it("lists a renamed test as the old name deleted and the new name added", () => {
		const base = `describe("s", () => {\n\tit("old", () => {});\n\tit("same", () => {});\n});\n`;
		const head = `describe("s", () => {\n\tit("new", () => {});\n\tit("same", () => {});\n});\n`;
		const patch = `@@ -1,3 +1,3 @@\n describe("s", () => {\n-\tit("old", () => {});\n+\tit("new", () => {});\n \tit("same", () => {});`;

		expect(shape(diff(base, head, patch))).toEqual([
			{ s: ["removed old", "added new"] },
		]);
	});

	it("lists a test removed from the file as deleted at its base position, with its base source", () => {
		const base = `it("a", () => {});\nit("gone", () => {\n\texpect(1);\n});\nit("c", () => {});\n`;
		const head = `it("a", () => {});\nit("c", () => {\n\texpect(2);\n});\n`;
		const patch = `@@ -1,5 +1,4 @@\n it("a", () => {});\n-it("gone", () => {\n-\texpect(1);\n-});\n-it("c", () => {});\n+it("c", () => {\n+\texpect(2);\n+});`;

		const tests = diff(base, head, patch);

		expect(shape(tests)).toEqual(["removed gone", "modified c"]);
		expect(tests[0]).toEqual({
			kind: "it",
			id: "a.test.ts:base:2",
			name: "gone",
			line: 2,
			change: "removed",
			source: 'it("gone", () => {\n\texpect(1);\n})',
		});
	});

	it("lists every test under a renamed describe as deleted under the old name and added under the new", () => {
		const base = `describe("old", () => {\n\tit("x", () => {});\n\tit("y", () => {});\n});\n`;
		const head = `describe("new", () => {\n\tit("x", () => {});\n\tit("y", () => {});\n});\n`;
		const patch = `@@ -1,3 +1,3 @@\n-describe("old", () => {\n+describe("new", () => {\n \tit("x", () => {});\n \tit("y", () => {});`;

		expect(shape(diff(base, head, patch))).toEqual([
			{ old: ["removed x", "removed y"] },
			{ new: ["added x", "added y"] },
		]);
	});

	it("keeps a same-named test whose lines changed as modified, and drops unchanged ones", () => {
		const base = `it("a", () => {\n\texpect(1);\n});\nit("b", () => {});\n`;
		const head = `it("a", () => {\n\texpect(2);\n});\nit("b", () => {});\n`;
		const patch = `@@ -1,3 +1,3 @@\n it("a", () => {\n-\texpect(1);\n+\texpect(2);\n });`;

		const [test, ...rest] = diff(base, head, patch);

		expect(rest).toEqual([]);
		expect(test).toMatchObject({
			name: "a",
			change: "modified",
			changedLines: [2],
		});
	});

	it("marks a same-named test modified when its change only removed lines", () => {
		const base = `it("a", () => {\n\texpect(1);\n\texpect(2);\n});\n`;
		const head = `it("a", () => {\n\texpect(1);\n});\n`;
		const patch = `@@ -1,4 +1,3 @@\n it("a", () => {\n \texpect(1);\n-\texpect(2);\n });`;

		const [test] = diff(base, head, patch);

		expect(test).toMatchObject({ name: "a", change: "modified" });
		expect(test).not.toHaveProperty("changedLines");
	});

	it("keeps a removed test inside its surviving describe, ahead of a test added in its place", () => {
		const base = `describe("s", () => {\n\tit("keep", () => {});\n\tit("old", () => {});\n});\n`;
		const head = `describe("s", () => {\n\tit("keep", () => {});\n\tit("fresh", () => {});\n});\n`;
		const patch = `@@ -1,4 +1,4 @@\n describe("s", () => {\n \tit("keep", () => {});\n-\tit("old", () => {});\n+\tit("fresh", () => {});\n });`;

		expect(shape(diff(base, head, patch))).toEqual([
			{ s: ["removed old", "added fresh"] },
		]);
	});
});
