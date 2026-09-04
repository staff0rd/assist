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
		mockReadStdin.mockResolvedValue(makeInput("npm run build"));
		mockMatchesConfigDeny.mockReturnValue(undefined);
		mockMatchesDeny.mockReturnValue("npm run");

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Denied by settings: npm run",
				},
			}),
		);
		consoleSpy.mockRestore();
	});
});

describe("cliHook built-in deny hardening", () => {
	function expectGitCommitDeny(consoleSpy: ReturnType<typeof vi.spyOn>) {
		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason:
						"Do not run 'git commit' directly. Use 'assist commit \"<message>\"' instead.",
				},
			}),
		);
	}

	it("denies a compound '&&' git commit not at the leading token", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput("git add A B && git commit -q -m wip"),
		);

		await cliHook();

		expectGitCommitDeny(consoleSpy);
		consoleSpy.mockRestore();
	});

	it("denies a ';'-separated leading-cd git commit", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("cd /repo; git commit -m wip"));

		await cliHook();

		expectGitCommitDeny(consoleSpy);
		consoleSpy.mockRestore();
	});

	it("denies a heredoc git commit whose body contains backticks", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput(
				"cd /repo && git add A B && git commit -q -F - <<'EOF'\nSubject mentioning `some.code`\nbody with `verify:complexity`\nEOF",
			),
		);

		await cliHook();

		expectGitCommitDeny(consoleSpy);
		consoleSpy.mockRestore();
	});

	it("denies a heredoc 'gh pr create' whose body contains backticks", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput(
				"gh pr create --title x --body - <<'EOF'\nbody with `code`\nEOF",
			),
		);

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("assist prs raise"),
		);
		consoleSpy.mockRestore();
	});
});

describe("cliHook subcommand advice", () => {
	it("denies a compound command piping 'assist complexity' with sub-command advice", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeInput("assist complexity src/foo.ts | grep Maintainability"),
		);

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason:
						"Do not pipe or chain 'assist complexity'. Run a focused sub-command directly for targeted output: assist complexity maintainability <file>, assist complexity cyclomatic <file>, assist complexity halstead <file>.",
				},
			}),
		);
		consoleSpy.mockRestore();
	});

	it("allows a bare 'assist complexity' command (single part, no pipe)", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput("assist complexity src/foo.ts"));
		mockIsApprovedRead.mockReturnValue(
			"Read-only CLI command: assist complexity",
		);

		await cliHook();

		expect(consoleSpy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "allow",
					permissionDecisionReason: "Read-only CLI command: assist complexity",
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
		mockReadStdin.mockResolvedValue(makeInput("npm run build", "PowerShell"));
		mockMatchesDeny.mockReturnValue("npm run");

		await cliHook();

		expect(mockLogDeniedToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				tool: "PowerShell",
				command: "npm run build",
				denyReason: "Denied by settings: npm run",
			}),
		);
		consoleSpy.mockRestore();
	});
});

describe("cliHook restricted path tools", () => {
	const restrictedDir = "~/.assist/restricted";

	function makeToolInput(toolName: string, toolInput: Record<string, unknown>) {
		return JSON.stringify({
			hook_event_name: "PreToolUse",
			tool_name: toolName,
			tool_input: toolInput,
		});
	}

	function expectRestrictedDeny(consoleSpy: ReturnType<typeof vi.spyOn>) {
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('"permissionDecision":"deny"'),
		);
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(".assist/restricted"),
		);
	}

	it.each([
		["Read", { file_path: "/home/stafford/.assist/restricted/notes.md" }],
		["Grep", { pattern: "secret", path: restrictedDir }],
		["Grep", { pattern: "$HOME/.assist/restricted/notes.md" }],
		["Glob", { pattern: ".assist/restricted/**" }],
		["Glob", { pattern: "**/*.md", path: restrictedDir }],
	])("denies %s targeting the restricted directory", async (tool, input) => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeToolInput(tool, input));

		await cliHook();

		expectRestrictedDeny(consoleSpy);
		consoleSpy.mockRestore();
	});

	it("logs a denied Read with the offending path", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeToolInput("Read", {
				file_path: "/home/stafford/.assist/restricted/notes.md",
			}),
		);

		await cliHook();

		expect(mockLogDeniedToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				tool: "Read",
				command: "/home/stafford/.assist/restricted/notes.md",
			}),
		);
		consoleSpy.mockRestore();
	});

	it.each([
		["Read", { file_path: "src/index.ts" }],
		["Grep", { pattern: "restricted", path: "src" }],
		["Glob", { pattern: "src/**/*.ts" }],
	])(
		"stays silent for %s outside the restricted directory",
		async (tool, input) => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockReadStdin.mockResolvedValue(makeToolInput(tool, input));

			await cliHook();

			expect(consoleSpy).not.toHaveBeenCalled();
			consoleSpy.mockRestore();
		},
	);

	it("stays silent for a path tool carrying no path fields", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeToolInput("Read", { offset: 10 }));

		await cliHook();

		expect(consoleSpy).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("stays silent for an unsupported tool naming the restricted directory", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(
			makeToolInput("WebFetch", { url: restrictedDir }),
		);

		await cliHook();

		expect(consoleSpy).not.toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it("denies a Bash command targeting the restricted directory", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		mockReadStdin.mockResolvedValue(makeInput(`cat ${restrictedDir}/notes.md`));

		await cliHook();

		expectRestrictedDeny(consoleSpy);
		consoleSpy.mockRestore();
	});
});
