import { describe, expect, it } from "vitest";
import { parseRepoArgument } from "./parseRepoArgument";

describe("parseRepoArgument", () => {
	it("splits an owner/repo argument", () => {
		expect(parseRepoArgument("MakerXStudio/foo")).toEqual({
			org: "MakerXStudio",
			repo: "foo",
		});
	});

	it("accepts dots, dashes and underscores", () => {
		expect(parseRepoArgument("some-org/my_repo.v2")).toEqual({
			org: "some-org",
			repo: "my_repo.v2",
		});
	});

	it("trims surrounding whitespace", () => {
		expect(parseRepoArgument("  org/repo  ")).toEqual({
			org: "org",
			repo: "repo",
		});
	});

	describe("when the argument is not owner/repo", () => {
		it.each([
			"repo",
			"org/",
			"/repo",
			"org/repo/extra",
			"org repo",
			"",
			"https://github.com/org/repo",
		])("rejects %j", (value) => {
			expect(parseRepoArgument(value)).toBeNull();
		});
	});
});
