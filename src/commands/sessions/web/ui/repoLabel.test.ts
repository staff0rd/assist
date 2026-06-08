import { describe, expect, it } from "vitest";
import { repoLabel } from "./repoLabel";

describe("repoLabel", () => {
	it("returns the basename of a posix path", () => {
		expect(repoLabel("/home/stafford/git/assist")).toBe("assist");
	});

	it("returns the basename of a windows path", () => {
		expect(repoLabel("C:\\Users\\stafford\\git\\assist")).toBe("assist");
	});

	it("ignores a trailing slash", () => {
		expect(repoLabel("/home/stafford/git/assist/")).toBe("assist");
	});

	it("returns empty string when cwd is missing", () => {
		expect(repoLabel()).toBe("");
		expect(repoLabel("")).toBe("");
	});
});
