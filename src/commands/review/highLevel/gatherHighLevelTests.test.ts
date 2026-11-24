import { describe, expect, it, vi } from "vitest";
import { fetchFileAtSha } from "./fetchFileAtSha";
import { gatherHighLevelTests } from "./gatherHighLevelTests";
import type { HighLevelFile } from "./types";

vi.mock("./fetchFileAtSha", () => ({ fetchFileAtSha: vi.fn() }));
vi.mock("./fetchHighLevelMergeBase", () => ({
	fetchHighLevelMergeBase: vi.fn(async () => "base"),
}));

const head = { repo: "org/repo", prNumber: 7, headSha: "sha" };

function file(path: string): HighLevelFile {
	return { path, status: "modified", additions: 1, deletions: 0, diffUrl: "#" };
}

describe("gatherHighLevelTests", () => {
	it("fetches the changed test files concurrently", async () => {
		let inFlight = 0;
		let peak = 0;
		vi.mocked(fetchFileAtSha).mockImplementation(async (_repo, _sha, path) => {
			inFlight++;
			peak = Math.max(peak, inFlight);
			await new Promise((resolve) => setTimeout(resolve, 5));
			inFlight--;
			return `it("${path}", () => {});`;
		});
		const paths = ["a", "b", "c", "d"].map((name) => `src/${name}.test.ts`);

		const tests = await gatherHighLevelTests(
			[...paths.map(file), file("src/a.ts")],
			["**/*.test.ts"],
			head,
		);

		expect(peak).toBe(4);
		expect(fetchFileAtSha).toHaveBeenCalledTimes(4);
		expect(tests.map((test) => test.path)).toEqual(paths);
		expect(tests[2]?.tests[0]).toMatchObject({ name: "src/c.test.ts" });
	});

	it("reads each patched modified file at the merge-base, under its previous path when renamed", async () => {
		vi.mocked(fetchFileAtSha).mockReset();
		vi.mocked(fetchFileAtSha).mockImplementation(async (_repo, sha) =>
			sha === "base" ? 'it("old", () => {});\n' : 'it("new", () => {});\n',
		);
		const patch = '@@ -1 +1 @@\n-it("old", () => {});\n+it("new", () => {});';

		const tests = await gatherHighLevelTests(
			[
				{
					...file("src/new.test.ts"),
					previousPath: "src/old.test.ts",
					patch,
				},
				{
					...file("src/added.test.ts"),
					status: "added",
					patch: "@@ -0,0 +1 @@\n+it",
				},
			],
			["**/*.test.ts"],
			head,
		);

		expect(fetchFileAtSha).toHaveBeenCalledWith(
			"org/repo",
			"base",
			"src/old.test.ts",
		);
		expect(fetchFileAtSha).toHaveBeenCalledTimes(3);
		expect(
			tests[0]?.tests.map((test) =>
				test.kind === "it" ? [test.change, test.name] : [],
			),
		).toEqual([
			["removed", "old"],
			["added", "new"],
		]);
	});
});
