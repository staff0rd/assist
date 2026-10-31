import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CaptureHome } from "./createCaptureHome";
import { requestDaemon } from "./requestDaemon";
import { startScriptedSession } from "./startScriptedSession";

vi.mock("./requestDaemon", () => ({ requestDaemon: vi.fn() }));

const mockRequest = vi.mocked(requestDaemon);
let home: string;

function captureHome(): CaptureHome {
	return {
		home,
		reposDir: join(home, "repos"),
		sessionIds: new Map(),
		peers: new Map(),
	} as unknown as CaptureHome;
}

function fakeClaudeScripts(): Record<string, unknown> {
	return JSON.parse(readFileSync(join(home, ".fake-claude.json"), "utf8"));
}

beforeEach(() => {
	home = mkdtempSync(join(tmpdir(), "scripted-session-"));
	mockRequest.mockReset();
	mockRequest.mockResolvedValue({ type: "created", sessionId: "s1" });
});

afterEach(() => rmSync(home, { recursive: true, force: true }));

describe("startScriptedSession", () => {
	it("creates a prompt session scripted under its prompt", async () => {
		const capture = captureHome();
		await startScriptedSession(capture, {
			repo: "sandbox",
			prompt: "Fix the test",
			reply: ["Done."],
		});
		expect(mockRequest).toHaveBeenCalledWith(
			home,
			{
				type: "create",
				cwd: join(home, "repos", "sandbox"),
				prompt: "Fix the test",
			},
			"created",
		);
		expect(fakeClaudeScripts()).toHaveProperty(["Fix the test"]);
		expect(capture.sessionIds.get("Fix the test")).toBe("s1");
	});

	it.each(["draft", "bug"] as const)(
		"seeds a /%s command session scripted under its slash command",
		async (command) => {
			const capture = captureHome();
			await startScriptedSession(capture, {
				repo: "api",
				command,
				prompt: "Orders export",
				title: "Orders export",
				status: "waiting",
				reply: ["What format?"],
			});
			expect(mockRequest).toHaveBeenNthCalledWith(
				1,
				home,
				{
					type: "create-assist",
					cwd: join(home, "repos", "api"),
					assistArgs: [command, "--once", "Orders export"],
					title: "Orders export",
				},
				"created",
			);
			expect(mockRequest).toHaveBeenNthCalledWith(
				2,
				home,
				{ type: "set-status", sessionId: "s1", status: "waiting", ack: true },
				"ack",
			);
			expect(fakeClaudeScripts()).toEqual({
				[`/${command} Orders export`]: {
					title: "Orders export",
					reply: ["What format?"],
				},
			});
			expect(capture.sessionIds.get("Orders export")).toBe("s1");
		},
	);
});
