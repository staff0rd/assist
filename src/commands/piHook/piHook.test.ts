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

import { piHook } from ".";

function captureOutput() {
	return vi.spyOn(console, "log").mockImplementation(() => {});
}

beforeEach(() => {
	vi.clearAllMocks();
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockMatchesDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
});

describe("piHook", () => {
	it("allows an approved read command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "bash", command: "assist backlog view a1" }),
		);
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await piHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({ decision: "allow", reason: "assist read verb" }),
		);
		spy.mockRestore();
	});

	it("denies a denied command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "bash", command: "rm -rf /" }),
		);
		mockMatchesConfigDeny.mockReturnValue({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});

		await piHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({ decision: "deny", reason: "Do not use rm -rf" }),
		);
		spy.mockRestore();
	});

	it("gates an unrecognised command so pi prompts", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "bash", command: "some-unknown-binary" }),
		);

		await piHook();

		expect(spy).toHaveBeenCalledWith(JSON.stringify({ decision: "gate" }));
		spy.mockRestore();
	});

	it("maps pi's lowercase bash tool to the Bash allowlist key", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "bash", command: "assist backlog view a1" }),
		);
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await piHook();

		expect(mockIsApprovedRead).toHaveBeenCalledWith(
			"assist backlog view a1",
			"Bash",
		);
		spy.mockRestore();
	});

	it("defaults a missing toolName to bash", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ command: "assist backlog view a1" }),
		);
		mockIsApprovedRead.mockReturnValue("assist read verb");

		await piHook();

		expect(spy).toHaveBeenCalledWith(
			JSON.stringify({ decision: "allow", reason: "assist read verb" }),
		);
		spy.mockRestore();
	});

	it("emits nothing for input without a command", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "bash", tool_input: { file: "x.ts" } }),
		);

		await piHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("emits nothing for an unsupported tool", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue(
			JSON.stringify({ toolName: "web-fetch", command: "echo hi" }),
		);

		await piHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it("returns silently on malformed JSON", async () => {
		const spy = captureOutput();
		mockReadStdin.mockResolvedValue("not json");

		await piHook();

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});
});
