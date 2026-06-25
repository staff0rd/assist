import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	daemonLog,
	recentDaemonLogLines,
	relayDaemonLog,
	setDaemonLogSink,
} from "./daemonLog";

describe("daemonLog", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		setDaemonLogSink(() => {});
	});

	it("buffers emitted lines for later replay", () => {
		daemonLog("alpha-marker");

		expect(recentDaemonLogLines().some((l) => l.includes("alpha-marker"))).toBe(
			true,
		);
	});

	it("forwards each line to the registered sink", () => {
		const sink = vi.fn();
		setDaemonLogSink(sink);

		daemonLog("sink-marker");

		expect(sink).toHaveBeenCalledOnce();
		expect(sink.mock.calls[0][0]).toContain("sink-marker");
	});

	it("relays a windows line verbatim under a [windows] tag", () => {
		const sink = vi.fn();
		setDaemonLogSink(sink);
		const windowsLine = "2026-06-25T00:00:00.000Z [4242] spawned win-1";

		relayDaemonLog(windowsLine);

		const tagged = `[windows] ${windowsLine}`;
		expect(sink).toHaveBeenCalledWith(tagged);
		expect(recentDaemonLogLines()).toContain(tagged);
	});

	it("bounds the ring buffer to its capacity, dropping the oldest", () => {
		for (let i = 0; i < 1100; i++) daemonLog(`bounded-${i}`);

		const lines = recentDaemonLogLines();
		expect(lines).toHaveLength(1000);
		expect(lines.some((l) => l.includes("bounded-1099"))).toBe(true);
		expect(lines.some((l) => l.endsWith("bounded-0"))).toBe(false);
	});
});
