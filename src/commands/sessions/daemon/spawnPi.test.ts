import { describe, expect, it, vi } from "vitest";
import { spawnPi } from "./spawnPi";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("spawnPi", () => {
	it("starts a fresh interactive session with a prompt", () => {
		spawnPi({ prompt: "Do the thing", cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["pi", "Do the thing"],
			"/repo",
			"7",
		);
	});

	it("starts a bare idle session with no prompt", () => {
		spawnPi({ cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(["pi"], "/repo", "7");
	});

	it("starts with no options", () => {
		spawnPi();

		expect(spawnPtyMock).toHaveBeenCalledWith(["pi"], undefined, undefined);
	});
});
