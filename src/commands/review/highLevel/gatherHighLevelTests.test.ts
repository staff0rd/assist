import { describe, expect, it, vi } from "vitest";
import { fetchFileAtSha } from "./fetchFileAtSha";
import { gatherHighLevelTests } from "./gatherHighLevelTests";
import type { HighLevelFile } from "./types";

vi.mock("./fetchFileAtSha", () => ({ fetchFileAtSha: vi.fn() }));

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
			"org/repo",
			"sha",
		);

		expect(peak).toBe(4);
		expect(fetchFileAtSha).toHaveBeenCalledTimes(4);
		expect(tests.map((test) => test.path)).toEqual(paths);
		expect(tests[2]?.tests[0]).toMatchObject({ name: "src/c.test.ts" });
	});
});
