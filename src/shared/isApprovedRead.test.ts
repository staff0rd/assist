import { describe, expect, it, vi } from "vitest";
import { isApprovedRead } from "./isApprovedRead";

vi.mock("./loadCliReads", () => ({
	findCliRead: (cmd: string) =>
		cmd.startsWith("gh repo view") ? "gh repo view" : undefined,
}));

vi.mock("./isGhApiRead", () => ({
	isGhApiRead: (cmd: string) =>
		cmd.startsWith("gh api") && !cmd.includes("-X POST"),
}));

vi.mock("./matchesBashAllow", () => ({
	matchesBashAllow: (cmd: string) =>
		cmd.startsWith("date") ? "date" : undefined,
}));

describe("isApprovedRead", () => {
	it("returns reason for matched CLI read", () => {
		expect(isApprovedRead("gh repo view owner/repo")).toBe(
			"Read-only CLI command: gh repo view",
		);
	});

	it("returns reason for gh api read", () => {
		expect(isApprovedRead("gh api repos/owner/repo")).toBe(
			"Read-only gh api command",
		);
	});

	it("returns undefined for unrecognised command", () => {
		expect(isApprovedRead("rm -rf /")).toBeUndefined();
	});

	it("returns undefined for write gh api", () => {
		expect(isApprovedRead("gh api repos/owner/repo -X POST")).toBeUndefined();
	});

	it("returns reason for settings allow match", () => {
		expect(isApprovedRead("date")).toBe("Allowed by settings: date");
	});

	describe("cd to cwd", () => {
		it("approves cd to current directory (absolute path)", () => {
			expect(isApprovedRead(`cd ${process.cwd()}`)).toBe(
				"cd to current directory",
			);
		});

		it.skipIf(process.platform !== "win32")(
			"approves cd to cwd via MSYS path (/c/...)",
			() => {
				const cwd = process.cwd();
				// Convert C:\foo\bar → /c/foo/bar
				const msys = `/${cwd[0].toLowerCase()}${cwd.slice(2).replace(/\\/g, "/")}`;
				expect(isApprovedRead(`cd ${msys}`)).toBe("cd to current directory");
			},
		);

		it("approves cd .", () => {
			expect(isApprovedRead("cd .")).toBe("cd to current directory");
		});

		it("rejects bare cd (goes to $HOME)", () => {
			expect(isApprovedRead("cd")).toBeUndefined();
		});

		it("rejects cd to different directory", () => {
			expect(isApprovedRead("cd /tmp")).toBeUndefined();
		});
	});
});
