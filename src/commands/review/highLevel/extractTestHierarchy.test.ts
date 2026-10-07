import { describe, expect, it } from "vitest";
import { extractTestHierarchy } from "./extractTestHierarchy";
import type { HighLevelTestNode } from "./types";

const source = `import { describe, expect, it } from "vitest";

describe("outer", () => {
	beforeEach(() => {});

	describe("inner", () => {
		it("first", () => {
			expect(1).toBe(1);
		});

		it.each([1, 2])("each %s", (n) => {
			expect(n).toBeTruthy();
		});
	});

	test.skip(\`template\`, () => {});
});

it("top level", () => {});
`;

function shape(nodes: HighLevelTestNode[]): unknown[] {
	return nodes.map((node) =>
		node.kind === "it" ? node.name : { [node.name]: shape(node.children) },
	);
}

describe("extractTestHierarchy", () => {
	it("reads every describe and it as a hierarchy when nothing narrows it", () => {
		expect(shape(extractTestHierarchy("a.test.ts", source))).toEqual([
			{ outer: [{ inner: ["first", "each %s"] }, "template"] },
			"top level",
		]);
	});

	it("keeps only tests touching changed lines, framed by their unchanged describes", () => {
		const tests = extractTestHierarchy("a.test.ts", source, new Set([8]));

		expect(shape(tests)).toEqual([{ outer: [{ inner: ["first"] }] }]);
	});

	it("gives each test an id, its line and its dedented source", () => {
		const [outer] = extractTestHierarchy("a.test.ts", source, new Set([8]));
		const inner = outer?.kind === "describe" ? outer.children[0] : undefined;
		const first = inner?.kind === "describe" ? inner.children[0] : undefined;

		expect(first).toEqual({
			kind: "it",
			id: "a.test.ts:7",
			name: "first",
			line: 7,
			source: 'it("first", () => {\n\texpect(1).toBe(1);\n})',
		});
	});

	it("ignores hooks and Playwright-style config calls", () => {
		const tests = extractTestHierarchy(
			"a.spec.ts",
			`test.use({ viewport: null });\ntest.beforeEach(async () => {});\ntest.describe("page", () => { test("loads", async () => {}); });\n`,
		);

		expect(shape(tests)).toEqual([{ page: ["loads"] }]);
	});
});
