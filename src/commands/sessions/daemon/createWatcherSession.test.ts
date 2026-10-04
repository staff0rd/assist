import { describe, expect, it, vi } from "vitest";
import { createWatcherSession } from "./createWatcherSession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));

const spawnPtyMock = vi.mocked(spawnPty);

describe("createWatcherSession", () => {
	it("runs assist watch loop in the clone instead of a claude process", () => {
		createWatcherSession("3", "/repo");

		expect(spawnPtyMock).toHaveBeenLastCalledWith(
			["assist", "watch", "loop"],
			"/repo",
			"3",
		);
	});

	it("is an assist console session that can be relaunched from its args", () => {
		const session = createWatcherSession("3", "/repo");

		expect(session.commandType).toBe("assist");
		expect(session.assistArgs).toEqual(["watch", "loop"]);
		expect(session.claudeSessionId).toBeUndefined();
	});

	it("marks the session as a watcher", () => {
		expect(createWatcherSession("3", "/repo").watcher).toBe(true);
	});

	it("leaves the star to the user", () => {
		expect(createWatcherSession("3", "/repo").starred).toBeUndefined();
	});
});
