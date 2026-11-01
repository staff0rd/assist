import { describe, expect, it } from "vitest";
import { parseNameOnlyLog } from "./fetchCommitsAfter";

const log = [
	"\x1e2026-08-14|bbb|feat: add a | b\nsrc/a.ts\nsrc/b.ts\n",
	"\x1e2026-08-14|aaa|docs: notes\ndocs/x.md\n",
	"\x1e2026-08-12|zzz|fix: older",
].join("\n");

describe("parseNameOnlyLog", () => {
	it("parses commits with their files, grouped by date", () => {
		const byDate = parseNameOnlyLog(log, [], null);
		expect(byDate.get("2026-08-14")).toEqual([
			{
				date: "2026-08-14",
				hash: "bbb",
				message: "feat: add a | b",
				files: ["src/a.ts", "src/b.ts"],
			},
			{
				date: "2026-08-14",
				hash: "aaa",
				message: "docs: notes",
				files: ["docs/x.md"],
			},
		]);
	});

	it("drops commits on or before the cutoff date", () => {
		expect(Array.from(parseNameOnlyLog(log, [], "2026-08-12").keys())).toEqual([
			"2026-08-14",
		]);
	});

	it("drops commits that only touch ignored paths", () => {
		const hashes = parseNameOnlyLog(log, ["docs/"], null)
			.get("2026-08-14")
			?.map((c) => c.hash);
		expect(hashes).toEqual(["bbb"]);
	});
});
