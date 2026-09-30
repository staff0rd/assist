import { describe, expect, it } from "vitest";
import { sectionAcross } from "./sectionAcross";

const byValue = (a: number, b: number) => a - b;

describe("sectionAcross", () => {
	it("merges every repo's items into one sorted list", async () => {
		const section = await sectionAcross(
			["o/a", "o/b"],
			async (repo) => (repo === "o/a" ? [3, 1] : [2]),
			byValue,
			"next.prRepos",
		);
		expect(section).toEqual({ items: [1, 2, 3], error: null });
	});

	it("keeps other repos' items when one repo fails", async () => {
		const section = await sectionAcross(
			["o/a", "o/b"],
			async (repo) => {
				if (repo === "o/b")
					throw Object.assign(new Error("exit 1"), { stderr: "not found\n" });
				return [1];
			},
			byValue,
			"next.prRepos",
		);
		expect(section).toEqual({ items: [1], error: "o/b: not found" });
	});

	it("names the key to set when there is no repo to read", async () => {
		const section = await sectionAcross(
			[],
			async () => [1],
			byValue,
			"next.issueRepos",
		);
		expect(section.items).toEqual([]);
		expect(section.error).toMatch(/set next\.issueRepos/);
	});
});
