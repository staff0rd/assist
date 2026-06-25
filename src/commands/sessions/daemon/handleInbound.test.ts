import { beforeEach, describe, expect, it, vi } from "vitest";
import { recentDaemonLogLines, setDaemonLogSink } from "./daemonLog";
import { handleInbound } from "./handleInbound";
import { createState } from "./WindowsProxyState";

describe("handleInbound log relay", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		setDaemonLogSink(() => {});
	});

	it("relays a windows daemon log line into this daemon's stream tagged [windows], without broadcasting", () => {
		const broadcast = vi.fn();
		const state = createState(
			broadcast,
			() => {},
			() => {},
		);
		const windowsLine = "2026-06-25T00:00:00.000Z [4242] relay-marker";

		handleInbound(state, JSON.stringify({ type: "log", line: windowsLine }));

		expect(recentDaemonLogLines()).toContain(`[windows] ${windowsLine}`);
		// browsers must not be spammed with daemon log lines
		expect(broadcast).not.toHaveBeenCalled();
	});

	it("ignores a log message with no line", () => {
		const broadcast = vi.fn();
		const state = createState(
			broadcast,
			() => {},
			() => {},
		);

		handleInbound(state, JSON.stringify({ type: "log" }));

		expect(broadcast).not.toHaveBeenCalled();
	});
});
