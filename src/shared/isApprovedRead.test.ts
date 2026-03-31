import { describe, expect, it, vi } from "vitest";
import { isApprovedRead } from "./isApprovedRead";

vi.mock("./loadCliReads", () => ({
	findCliRead: (cmd: string) =>
		cmd.startsWith("gh repo view") ? "gh repo view" : undefined,
	findCliWrite: (cmd: string) =>
		cmd.startsWith("assist commit") ? "assist commit" : undefined,
}));

vi.mock("./isGhApiRead", () => ({
	isGhApiRead: (cmd: string) =>
		cmd.startsWith("gh api") && !cmd.includes("-X POST"),
}));

vi.mock("./matchesAllow", () => ({
	matchesAllow: (_toolName: string, cmd: string) =>
		cmd.startsWith("date") ? "date" : undefined,
}));

describe("isApprovedRead", () => {
	describe("when the command matches a CLI read", () => {
		it("should return a read-only CLI reason", () => {
			const command = "gh repo view owner/repo";

			const result = isApprovedRead(command);

			expect(result).toBe("Read-only CLI command: gh repo view");
		});
	});

	describe("when the command is a read-only gh api call", () => {
		it("should return a gh api reason", () => {
			const command = "gh api repos/owner/repo";

			const result = isApprovedRead(command);

			expect(result).toBe("Read-only gh api command");
		});
	});

	describe("when the command is a write gh api call", () => {
		it("should return undefined", () => {
			const command = "gh api repos/owner/repo -X POST";

			const result = isApprovedRead(command);

			expect(result).toBeUndefined();
		});
	});

	describe("when the command matches a settings allow entry", () => {
		it("should return an allowed-by-settings reason", () => {
			const command = "date";

			const result = isApprovedRead(command);

			expect(result).toBe("Allowed by settings: date");
		});
	});

	describe("when the command is unrecognised", () => {
		it("should return undefined", () => {
			const command = "rm -rf /";

			const result = isApprovedRead(command);

			expect(result).toBeUndefined();
		});
	});

	describe("when the command is cd to the current directory", () => {
		it("should approve cd with an absolute path", () => {
			const command = `cd ${process.cwd()}`;

			const result = isApprovedRead(command);

			expect(result).toBe("cd to current directory");
		});

		it("should approve cd .", () => {
			const command = "cd .";

			const result = isApprovedRead(command);

			expect(result).toBe("cd to current directory");
		});

		it("should approve cd with a trailing slash", () => {
			const command = `cd ${process.cwd()}/`;

			const result = isApprovedRead(command);

			expect(result).toBe("cd to current directory");
		});

		it.skipIf(process.platform !== "win32")(
			"should approve cd via MSYS path (/c/...)",
			() => {
				const cwd = process.cwd();
				const msys = `/${cwd[0].toLowerCase()}${cwd.slice(2).replace(/\\/g, "/")}`;
				const command = `cd ${msys}`;

				const result = isApprovedRead(command);

				expect(result).toBe("cd to current directory");
			},
		);
	});

	describe("when the command is cd with unusual whitespace", () => {
		it("should approve cd with extra spaces before the path", () => {
			const command = `cd   ${process.cwd()}`;

			const result = isApprovedRead(command);

			expect(result).toBe("cd to current directory");
		});

		it("should approve cd . with extra spaces", () => {
			const command = "cd   .";

			const result = isApprovedRead(command);

			expect(result).toBe("cd to current directory");
		});
	});

	describe("when the command is bare cd", () => {
		it("should return undefined because bare cd goes to $HOME", () => {
			const command = "cd";

			const result = isApprovedRead(command);

			expect(result).toBeUndefined();
		});
	});

	describe("when the command is cd to a different directory", () => {
		it("should return undefined", () => {
			const command = "cd /tmp";

			const result = isApprovedRead(command);

			expect(result).toBeUndefined();
		});
	});
});
