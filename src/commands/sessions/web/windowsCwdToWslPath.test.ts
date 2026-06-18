import { describe, expect, it } from "vitest";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

describe("windowsCwdToWslPath", () => {
	it("maps a drive-letter path to the /mnt mount", () => {
		expect(windowsCwdToWslPath(String.raw`C:\git\nextgen`)).toBe(
			"/mnt/c/git/nextgen",
		);
		expect(windowsCwdToWslPath("D:/projects/app")).toBe("/mnt/d/projects/app");
	});

	it("leaves POSIX paths untouched", () => {
		expect(windowsCwdToWslPath("/home/me/repo")).toBe("/home/me/repo");
		expect(windowsCwdToWslPath("/mnt/c/git/app")).toBe("/mnt/c/git/app");
	});
});
