import { describe, expect, it, vi } from "vitest";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

vi.mock("./ensureHooksSettings", () => ({
	ensureHooksSettings: vi.fn(() => "/hooks.json"),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("spawnClaude", () => {
	it("resumes a session", () => {
		spawnClaude({ resumeSessionId: "abc-123", cwd: "/repo" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["claude", "--settings", "/hooks.json", "--resume", "abc-123"],
			"/repo",
			undefined,
		);
	});

	it("appends the nudge prompt when resuming with a prompt", () => {
		spawnClaude({
			resumeSessionId: "abc-123",
			prompt: "Continue from where you left off.",
			cwd: "/repo",
		});

		expect(spawnPtyMock).toHaveBeenCalledWith(
			[
				"claude",
				"--settings",
				"/hooks.json",
				"--resume",
				"abc-123",
				"Continue from where you left off.",
			],
			"/repo",
			undefined,
		);
	});

	it("starts a fresh session with a prompt", () => {
		spawnClaude({ prompt: "Do the thing" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["claude", "--settings", "/hooks.json", "Do the thing"],
			undefined,
			undefined,
		);
	});

	it("starts a bare session with no options", () => {
		spawnClaude();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["claude", "--settings", "/hooks.json"],
			undefined,
			undefined,
		);
	});

	it("passes the daemon session id so the status hooks can target it", () => {
		spawnClaude({ prompt: "Do the thing", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["claude", "--settings", "/hooks.json", "Do the thing"],
			undefined,
			"7",
		);
	});
});
