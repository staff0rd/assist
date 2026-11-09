import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadStdin = vi.fn<() => Promise<string>>();
const mockMatchesConfigDeny = vi.fn();
const mockMatchesDeny = vi.fn();
const mockIsApprovedRead = vi.fn();
const mockReportCodexStatus = vi.fn();
const mockAdviceHookPayload = vi.fn();

vi.mock("../../lib/readStdin", () => ({
	readStdin: () => mockReadStdin(),
}));

vi.mock("../advise/adviceHookPayload", () => ({
	adviceHookPayload: (cwd: string) => mockAdviceHookPayload(cwd),
}));

const mockLogDenied = vi.fn();
vi.mock("../cliHook/logDeniedToolCall", () => ({
	logDeniedToolCall: (entry: unknown) => mockLogDenied(entry),
}));
vi.mock("./reportCodexStatus", () => ({
	reportCodexStatus: (event: string, autoDecided: boolean) =>
		mockReportCodexStatus(event, autoDecided),
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

const mockSchemaLocked = vi.fn<(identity: unknown) => Promise<boolean>>();
vi.mock("../schema/isSchemaLocked", () => ({
	isSchemaLocked: (identity: unknown) => mockSchemaLocked(identity),
}));

import { codexHook } from "../codexHook";

function makeInput(
	command: string,
	{ event = "PreToolUse", toolName = "Bash" } = {},
) {
	return JSON.stringify({
		hook_event_name: event,
		tool_name: toolName,
		tool_input: { command },
	});
}

function captureOutput() {
	return vi.spyOn(console, "log").mockImplementation(() => {});
}

beforeEach(() => {
	vi.clearAllMocks();
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockMatchesDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
	mockAdviceHookPayload.mockReturnValue(undefined);
});

describe("codexHook SessionStart", () => {
	const payload = {
		hookSpecificOutput: {
			hookEventName: "SessionStart",
			additionalContext: "# Instructions for this repo",
		},
	};

	it("emits the composed advice as additionalContext", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ hook_event_name: "SessionStart", cwd: "/repo" }),
		);
		mockAdviceHookPayload.mockReturnValue(payload);

		await codexHook();

		expect(mockAdviceHookPayload).toHaveBeenCalledWith("/repo");
		expect(spy).toHaveBeenCalledWith(JSON.stringify(payload));
		spy.mockRestore();
	});

	it("falls back to the hook process cwd when the payload carries none", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ hook_event_name: "SessionStart" }),
		);
		mockAdviceHookPayload.mockReturnValue(payload);

		await codexHook();

		expect(mockAdviceHookPayload).toHaveBeenCalledWith(process.cwd());
		spy.mockRestore();
	});

	it("emits nothing when the repo composes no advice", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ hook_event_name: "SessionStart", cwd: "/repo" }),
		);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("reports no session status for a session start", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ hook_event_name: "SessionStart", cwd: "/repo" }),
		);
		mockAdviceHookPayload.mockReturnValue(payload);

		await codexHook();

		expect(mockReportCodexStatus).toHaveBeenCalledWith("SessionStart", false);
		spy.mockRestore();
	});
});

describe("codexHook PreToolUse", () => {
	it("emits nothing for an approved read command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("assist backlog view a1"));
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("blocks a denied command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("rm -rf /"));
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await codexHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "deny",
					permissionDecisionReason: "Do not use rm -rf",
				},
			}),
		);
		spy.mockRestore();
	});

	it("logs a denied command against the Codex session id", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({
				hook_event_name: "PreToolUse",
				tool_name: "Bash",
				tool_input: { command: "rm -rf /" },
				session_id: "codex-thread-1",
				cwd: "/work/repo",
			}),
		);
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await codexHook();

		expect(mockLogDenied).toHaveBeenCalledWith({
			tool: "Bash",
			command: "rm -rf /",
			repo: "repo",
			sessionId: "codex-thread-1",
			denyReason: "Do not use rm -rf",
		});
		spy.mockRestore();
	});

	it("does not log an unrecognised command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("some-unknown-binary"));

		await codexHook();

		expect(mockLogDenied).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("emits nothing for an unrecognised command so Codex prompts", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("some-unknown-binary"));

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});

describe("codexHook PermissionRequest", () => {
	it("allows an approved read command with the behavior shape", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			makeInput("assist backlog view a1", { event: "PermissionRequest" }),
		);
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await codexHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PermissionRequest",
					decision: { behavior: "allow", message: "assist read verb" },
				},
			}),
		);
		spy.mockRestore();
	});

	it("denies a denied command with the behavior shape", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			makeInput("rm -rf /", { event: "PermissionRequest" }),
		);
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await codexHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PermissionRequest",
					decision: { behavior: "deny", message: "Do not use rm -rf" },
				},
			}),
		);
		spy.mockRestore();
	});
});

describe("codexHook input handling", () => {
	it("ignores tools without a command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({
				hook_event_name: "PermissionRequest",
				tool_name: "Edit",
				tool_input: { file_path: "x.ts" },
			}),
		);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("ignores unsupported tool names", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			makeInput("echo hi", { toolName: "WebFetch" }),
		);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("returns silently on malformed JSON", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue("not json");

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		expect(mockReportCodexStatus).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});

describe("codexHook status reporting", () => {
	it("reports a status-only event that carries no tool payload", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ hook_event_name: "Stop", session_id: "abc" }),
		);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		expect(mockReportCodexStatus).toHaveBeenCalledWith("Stop", false);
		spy.mockRestore();
	});

	it("tells the status driver when it auto-decided a permission request", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			makeInput("assist backlog view a1", { event: "PermissionRequest" }),
		);
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await codexHook();

		expect(mockReportCodexStatus).toHaveBeenCalledWith(
			"PermissionRequest",
			true,
		);
		spy.mockRestore();
	});

	it("tells the status driver when a permission request falls through to the user", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			makeInput("some-unknown-binary", { event: "PermissionRequest" }),
		);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		expect(mockReportCodexStatus).toHaveBeenCalledWith(
			"PermissionRequest",
			false,
		);
		spy.mockRestore();
	});

	it("reports a tool call the allowlist does not recognise as running", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("some-unknown-binary"));

		await codexHook();

		expect(mockReportCodexStatus).toHaveBeenCalledWith("PreToolUse", false);
		spy.mockRestore();
	});
});

describe("codexHook apply_patch", () => {
	const schemaPatch =
		"*** Begin Patch\n*** Update File: src/shared/db/schema.ts\n@@\n+export const x = 1;\n*** End Patch";

	function patchInput(locked: boolean) {
		mockSchemaLocked.mockResolvedValue(locked);
		mockReadStdin.mockResolvedValue(
			JSON.stringify({
				hook_event_name: "PreToolUse",
				session_id: "thread-a",
				tool_name: "apply_patch",
				tool_input: { command: schemaPatch },
			}),
		);
	}

	it("denies a patch to a locked schema file, scoped to the Codex conversation", async () => {
		const spy = captureOutput();
		patchInput(true);

		await codexHook();

		const output = JSON.parse(spy.mock.calls[0][0] as string);
		expect(output.hookSpecificOutput.permissionDecision).toBe("deny");
		expect(output.hookSpecificOutput.permissionDecisionReason).toContain(
			"assist schema unlock",
		);
		expect(mockSchemaLocked).toHaveBeenCalledWith(
			expect.objectContaining({ harness: "codex", conversationId: "thread-a" }),
		);
		expect(mockLogDenied).toHaveBeenCalledWith(
			expect.objectContaining({ tool: "apply_patch", sessionId: "thread-a" }),
		);
		spy.mockRestore();
	});

	it("lets the patch through once the schema is unlocked", async () => {
		const spy = captureOutput();
		patchInput(false);

		await codexHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
