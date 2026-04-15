import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadStdin = vi.fn<() => Promise<string>>();
const mockMatchesConfigDeny = vi.fn();
const mockMatchesDeny = vi.fn();
const mockIsApprovedRead = vi.fn();
const mockLogDeniedToolCall = vi.fn();

vi.mock("../../lib/readStdin", () => ({
	readStdin: () => mockReadStdin(),
}));

vi.mock("../../shared/matchesConfigDeny", () => ({
	matchesConfigDeny: (cmd: string) => mockMatchesConfigDeny(cmd),
}));

vi.mock("../../shared/matchesAllow", () => ({
	matchesDeny: (_tool: string, cmd: string) => mockMatchesDeny(cmd),
}));

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string, tool: string) => mockIsApprovedRead(cmd, tool),
}));

vi.mock("./logDeniedToolCall", () => ({
	logDeniedToolCall: (...args: unknown[]) => mockLogDeniedToolCall(...args),
}));

import { cliHook } from ".";

function makeInput(command: string, toolName = "Bash") {
	return JSON.stringify({
		hook_event_name: "PreToolUse",
		tool_name: toolName,
		tool_input: { command },
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockMatchesDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
});

describe("cliHook config deny", () => {
	it("denies a command matching a config deny rule", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("rm -rf /"));
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Do not use rm -rf",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("denies a compound command when one part matches a config deny rule", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("echo hello && rm -rf /"));
		mockMatchesConfigDeny.mockImplementation((cmd: string) =>
			cmd.startsWith("rm -rf")
				? { pattern: "rm -rf", message: "Do not use rm -rf" }
				: undefined,
		);

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Do not use rm -rf",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("config deny takes precedence over allow", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("git push --force"));
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "git push --force",
			message: "Use --force-with-lease instead",
		});
		mockIsApprovedRead.mockReturnValue("Allowed by settings");

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Use --force-with-lease instead",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("denies a heredoc command when the program matches a config deny rule", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput("python3 << 'EOF'\nprint('hello')\nEOF"),
		);
		mockMatchesConfigDeny.mockImplementation((cmd: string) =>
			cmd.startsWith("python3")
				? {
						pattern: "python3",
						message: "Do not use python3. Use PowerShell instead.",
					}
				: undefined,
		);

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason:
						"Do not use python3. Use PowerShell instead.",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("denies a heredoc command via settings deny when no config deny matches", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput("python3 << 'EOF'\nprint('hello')\nEOF"),
		);
		mockMatchesConfigDeny.mockReturnValue(undefined);
		mockMatchesDeny.mockReturnValue("python3");

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Denied by settings: python3",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("falls through to settings deny when no config deny matches", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("git commit --amend"));
		mockMatchesConfigDeny.mockReturnValue(undefined);
		mockMatchesDeny.mockReturnValue("git commit");

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Denied by settings: git commit",
				},
			}),
		);
		consoleSpy.mockRestore();
	});
});

describe("cliHook deny logging", () => {
	it("logs denied tool calls to the prompts DB", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("rm -rf /"));
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await cliHook();

		expect(mockLogDeniedToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				tool: "Bash",
				command: "rm -rf /",
				denyReason: "Do not use rm -rf",
			}),
		);
		consoleSpy.mockRestore();
	});

	it("does not log when command is allowed", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("git status"));
		mockIsApprovedRead.mockReturnValue("Allowed by settings");

		await cliHook();

		expect(mockLogDeniedToolCall).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("does not log when input is not parseable", async () => {
		mockReadStdin.mockResolvedValue("not json");

		await cliHook();

		expect(mockLogDeniedToolCall).not.toHaveBeenCalled();
	});

	it("does not throw when logging fails", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("rm -rf /"));
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});
		mockLogDeniedToolCall.mockImplementation(() => {
			throw new Error("DB write failed");
		});

		await expect(cliHook()).resolves.toBeUndefined();
		consoleSpy.mockRestore();
	});

	it("logs settings deny with correct reason", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput("git commit --amend", "PowerShell"),
		);
		mockMatchesDeny.mockReturnValue("git commit");

		await cliHook();

		expect(mockLogDeniedToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				tool: "PowerShell",
				command: "git commit --amend",
				denyReason: "Denied by settings: git commit",
			}),
		);
		consoleSpy.mockRestore();
	});
});
