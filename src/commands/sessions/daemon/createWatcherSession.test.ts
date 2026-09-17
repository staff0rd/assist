import { describe, expect, it, vi } from "vitest";
import { createWatcherSession } from "./createWatcherSession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));

vi.mock("./ensureHooksSettings", () => ({
	ensureHooksSettings: vi.fn(() => "/hooks.json"),
}));

const spawnPtyMock = vi.mocked(spawnPty);

describe("createWatcherSession", () => {
	it("launches the watcher in auto mode", () => {
		createWatcherSession("3", "/repo");

		expect(spawnPtyMock.mock.calls.at(-1)?.[0]).toEqual(
			expect.arrayContaining(["--permission-mode", "auto"]),
		);
	});

	it("records auto on the session so respawns keep it", () => {
		expect(createWatcherSession("3", "/repo").auto).toBe(true);
	});

	it("marks the session as a watcher", () => {
		expect(createWatcherSession("3", "/repo").watcher).toBe(true);
	});

	it("leaves the star to the user", () => {
		expect(createWatcherSession("3", "/repo").starred).toBeUndefined();
	});
});
