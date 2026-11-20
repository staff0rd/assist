import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockReply = vi.fn();
vi.mock("../daemon/requestDaemonReply", () => ({
	requestDaemonReply: (...args: unknown[]) => mockReply(...args),
}));

import { capturedStdin } from "./capturedStdin";
import { deferToDaemon } from "./deferToDaemon";

describe("deferToDaemon", () => {
	let logged: string[];

	beforeEach(() => {
		mockReply.mockReset();
		logged = [];
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(message);
		});
		vi.stubEnv("ASSIST_SESSION_ID", "7");
		vi.stubEnv("ASSIST_SDK_AGENT", "1");
		vi.stubEnv("ASSIST_DEFERRED_RUN", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("hands the command to the daemon and tells the agent to end its turn", async () => {
		mockReply.mockResolvedValue({ accepted: true });

		expect(await deferToDaemon("# Plan")).toBe(true);

		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "defer-command",
				sessionId: "7",
				argv: process.argv.slice(2),
				stdin: "# Plan",
				cwd: process.cwd(),
			}),
			"defer-command-result",
		);
		expect(logged.join("\n")).toContain("End your turn now");
	});

	it("forwards the stdin the command already read", async () => {
		mockReply.mockResolvedValue({ accepted: true });
		capturedStdin.text = '{"questions":[]}';

		await deferToDaemon();

		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({ stdin: '{"questions":[]}' }),
			"defer-command-result",
		);
		capturedStdin.text = undefined;
	});

	it("keeps the blocking path when the daemon declines", async () => {
		mockReply.mockResolvedValue({ accepted: false });

		expect(await deferToDaemon()).toBe(false);
		expect(logged).toEqual([]);
	});

	it("keeps the blocking path when the daemon is unreachable", async () => {
		mockReply.mockResolvedValue(undefined);

		expect(await deferToDaemon()).toBe(false);
	});

	it("does not ask the daemon outside an assist session", async () => {
		vi.stubEnv("ASSIST_SDK_AGENT", "");
		vi.stubEnv("ASSIST_SESSION", "");
		vi.stubEnv("CODEX_THREAD_ID", undefined);
		vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);
		vi.stubEnv("CLAUDECODE", "1");

		expect(await deferToDaemon()).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});

	it("hands a daemon-hosted Codex session's command to the daemon", async () => {
		vi.stubEnv("ASSIST_SDK_AGENT", "");
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("CODEX_THREAD_ID", "thread-1");
		vi.stubEnv("CLAUDECODE", undefined);
		mockReply.mockResolvedValue({ accepted: true });

		expect(await deferToDaemon("{}")).toBe(true);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({ type: "defer-command", sessionId: "7" }),
			"defer-command-result",
		);
		expect(logged.join("\n")).toContain("End your turn now");
	});

	it("hands a daemon-hosted Claude terminal session's command to the daemon", async () => {
		vi.stubEnv("ASSIST_SDK_AGENT", "");
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("CODEX_THREAD_ID", undefined);
		vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);
		vi.stubEnv("CLAUDECODE", "1");
		mockReply.mockResolvedValue({ accepted: true });

		expect(await deferToDaemon()).toBe(true);
		expect(mockReply).toHaveBeenCalledWith(
			expect.objectContaining({ type: "defer-command", sessionId: "7" }),
			"defer-command-result",
		);
		expect(logged.join("\n")).toContain("End your turn now");
	});

	it("does not ask the daemon for a Codex run outside an assist session", async () => {
		vi.stubEnv("ASSIST_SDK_AGENT", "");
		vi.stubEnv("ASSIST_SESSION", "");
		vi.stubEnv("CODEX_THREAD_ID", "thread-1");

		expect(await deferToDaemon()).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});

	it("does not hand the daemon's own run back to it", async () => {
		vi.stubEnv("ASSIST_DEFERRED_RUN", "1");

		expect(await deferToDaemon()).toBe(false);
		expect(mockReply).not.toHaveBeenCalled();
	});
});
