import type { ChildProcess } from "node:child_process";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	unwatchFile: vi.fn(),
	watchFile: vi.fn(),
}));

vi.mock("./readSignal", () => ({
	readSignal: vi.fn(),
}));

vi.mock("./writeSignal", () => ({
	getSignalPath: vi.fn(() => "/tmp/.assist-signal.json"),
}));

import { existsSync, unwatchFile, watchFile } from "node:fs";
import { readSignal } from "./readSignal";
import { watchForMarker } from "./watchForMarker";

const mockExistsSync = existsSync as unknown as MockInstance;
const mockWatchFile = watchFile as unknown as MockInstance;
const mockUnwatchFile = unwatchFile as unknown as MockInstance;
const mockReadSignal = readSignal as unknown as MockInstance;

function makeChild(): ChildProcess {
	return { kill: vi.fn() } as unknown as ChildProcess;
}

function fireWatcher(): void {
	const listener = mockWatchFile.mock.calls[0][2] as () => void;
	listener();
}

describe("watchForMarker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockExistsSync.mockReturnValue(true);
	});

	describe("when a done signal arrives in default mode", () => {
		it("ignores it and keeps the session open", () => {
			const child = makeChild();
			mockReadSignal.mockReturnValue({ event: "done" });

			watchForMarker(child);
			fireWatcher();

			expect(child.kill).not.toHaveBeenCalled();
			expect(mockUnwatchFile).not.toHaveBeenCalled();
		});

		it("still kills the session when a next signal arrives afterwards", () => {
			const child = makeChild();
			mockReadSignal.mockReturnValueOnce({ event: "done" });
			mockReadSignal.mockReturnValueOnce({ event: "next" });

			watchForMarker(child);
			fireWatcher();
			fireWatcher();

			expect(child.kill).toHaveBeenCalledWith("SIGTERM");
		});
	});

	describe("when a done signal arrives in once mode", () => {
		it("kills the session", () => {
			const child = makeChild();
			mockReadSignal.mockReturnValue({ event: "done" });

			watchForMarker(child, { actOnDone: true });
			fireWatcher();

			expect(child.kill).toHaveBeenCalledWith("SIGTERM");
			expect(mockUnwatchFile).toHaveBeenCalled();
		});

		it("reports that it triggered the kill", () => {
			const child = makeChild();
			mockReadSignal.mockReturnValue({ event: "done" });

			const marker = watchForMarker(child, { actOnDone: true });
			expect(marker.killedOnMarker()).toBe(false);
			fireWatcher();

			expect(marker.killedOnMarker()).toBe(true);
		});
	});

	describe("when a next signal arrives in default mode", () => {
		it("kills the session", () => {
			const child = makeChild();
			mockReadSignal.mockReturnValue({ event: "next" });

			watchForMarker(child);
			fireWatcher();

			expect(child.kill).toHaveBeenCalledWith("SIGTERM");
		});
	});

	describe("when the signal file does not exist", () => {
		it("does nothing", () => {
			const child = makeChild();
			mockExistsSync.mockReturnValue(false);

			watchForMarker(child, { actOnDone: true });
			fireWatcher();

			expect(mockReadSignal).not.toHaveBeenCalled();
			expect(child.kill).not.toHaveBeenCalled();
		});
	});
});
