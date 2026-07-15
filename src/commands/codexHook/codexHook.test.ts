import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadStdin = vi.fn<() => Promise<string>>();
const mockMatchesConfigDeny = vi.fn();
const mockMatchesDeny = vi.fn();
const mockIsApprovedRead = vi.fn();

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

import { codexHook } from ".";

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
});

describe("codexHook PreToolUse", () => {
	it("allows an approved read command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(makeInput("assist backlog view a1"));
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await codexHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "allow",
					permissionDecisionReason: "assist read verb",
				},
			}),
		);
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
			JSON.stringify({ decision: "block", reason: "Do not use rm -rf" }),
		);
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
		spy.mockRestore();
	});
});
