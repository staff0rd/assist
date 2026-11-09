import { describe, expect, it, vi } from "vitest";
import { spawnPi } from "./spawnPi";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

const REGULAR_TUI = ["--tui-mode", "regular"];

describe("spawnPi", () => {
	it("starts a fresh interactive session with a prompt, in regular TUI mode so the web terminal can scroll", () => {
		spawnPi({ prompt: "Do the thing", cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["pi", ...REGULAR_TUI, "Do the thing"],
			"/repo",
			"7",
		);
	});

	it("starts a bare idle session with no prompt", () => {
		spawnPi({ cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["pi", ...REGULAR_TUI],
			"/repo",
			"7",
		);
	});

	it("starts with no options", () => {
		spawnPi();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["pi", ...REGULAR_TUI],
			undefined,
			undefined,
		);
	});
});
