import { tmpdir } from "node:os";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMatchesConfigDeny = vi.fn();
const mockIsApprovedRead = vi.fn();

vi.mock("../../shared/matchesConfigDeny", () => ({
	matchesConfigDeny: (cmd: string) => mockMatchesConfigDeny(cmd),
}));

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string, toolName?: string) =>
		mockIsApprovedRead(cmd, toolName),
}));

vi.mock("../../shared/matchesAllow", () => ({
	matchesDeny: () => undefined,
}));

import { cliHookCheck } from "./cliHookCheck";

beforeEach(() => {
	vi.clearAllMocks();
	process.exitCode = undefined;
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
});

describe("cliHookCheck deny", () => {
	it("reports deny for a command matching a config deny rule", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		cliHookCheck("rm -rf /");

		expect(consoleSpy).toHaveBeenCalledWith("denied: Do not use rm -rf");
		expect(process.exitCode).toBe(1);
		consoleSpy.mockRestore();
	});

	it("reports deny for a compound command with a denied sub-command", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockMatchesConfigDeny.mockImplementation((cmd: string) =>
			cmd.startsWith("rm -rf")
				? { pattern: "rm -rf", message: "Do not use rm -rf" }
				: undefined,
		);

		cliHookCheck("echo hello && rm -rf /");

		expect(consoleSpy).toHaveBeenCalledWith("denied: Do not use rm -rf");
		expect(process.exitCode).toBe(1);
		consoleSpy.mockRestore();
	});

	it("reports deny for 'gh pr create' via the built-in deny", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		cliHookCheck("gh pr create --title x --body y");

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("assist prs create"),
		);
		expect(process.exitCode).toBe(1);
		consoleSpy.mockRestore();
	});

	it("falls through to approved check when no deny matches", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockMatchesConfigDeny.mockReturnValue(undefined);
		mockIsApprovedRead.mockReturnValue("Read-only CLI command: git status");

		cliHookCheck("git status");

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("approved"),
		);
		expect(process.exitCode).toBeUndefined();
		consoleSpy.mockRestore();
	});
});

describe("cliHookCheck compound with shell builtins", () => {
	it("approves 'some-cmd || true' when some-cmd is approved", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockIsApprovedRead.mockImplementation((cmd: string) => {
			if (cmd === "git status") return "Read-only CLI command: git status";
			if (cmd === "true") return "safe shell builtin: true";
			return undefined;
		});

		cliHookCheck("git status || true");

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("approved"),
		);
		expect(process.exitCode).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it("approves 'some-cmd || false' when some-cmd is approved", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockIsApprovedRead.mockImplementation((cmd: string) => {
			if (cmd === "git status") return "Read-only CLI command: git status";
			if (cmd === "false") return "safe shell builtin: false";
			return undefined;
		});

		cliHookCheck("git status || false");

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("approved"),
		);
		expect(process.exitCode).toBeUndefined();
		consoleSpy.mockRestore();
	});
});

describe("cliHookCheck with redirects", () => {
	it("evaluates the underlying command against approval rules when the redirect targets OS temp", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockIsApprovedRead.mockImplementation((cmd: string) =>
			cmd === "az containerapp logs show -n foo --tail 300"
				? "Allowed by settings: az containerapp logs show"
				: undefined,
		);

		cliHookCheck(
			`az containerapp logs show -n foo --tail 300 2>&1 > ${tmpdir()}/ca-logs3.json`,
		);

		expect(mockIsApprovedRead).toHaveBeenCalledWith(
			"az containerapp logs show -n foo --tail 300",
			"Bash",
		);
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("approved"),
		);
		expect(process.exitCode).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it("rejects redirects whose target is outside OS temp with a clear error", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		cliHookCheck("echo hello > /not-temp/output.log");

		expect(consoleSpy).toHaveBeenCalledWith(
			"not approved (redirect target '/not-temp/output.log' is outside the OS temp directory)",
		);
		expect(process.exitCode).toBe(1);
		consoleSpy.mockRestore();
	});

	it("falls back to the generic unable-to-parse message for other constructs", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		cliHookCheck("echo $(date)");

		expect(consoleSpy).toHaveBeenCalledWith("not approved (unable to parse)");
		expect(process.exitCode).toBe(1);
		consoleSpy.mockRestore();
	});
});

describe("cliHookCheck --tool flag", () => {
	it("defaults toolName to Bash", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockIsApprovedRead.mockReturnValue("Allowed by settings: assist verify");

		cliHookCheck("assist verify");

		expect(mockIsApprovedRead).toHaveBeenCalledWith("assist verify", "Bash");
		consoleSpy.mockRestore();
	});

	it("passes toolName through to isApprovedRead", () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockIsApprovedRead.mockReturnValue("Allowed by settings: assist verify");

		cliHookCheck("assist verify", "PowerShell");

		expect(mockIsApprovedRead).toHaveBeenCalledWith(
			"assist verify",
			"PowerShell",
		);
		consoleSpy.mockRestore();
	});
});
